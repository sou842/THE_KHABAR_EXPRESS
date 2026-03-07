import type { NextApiRequest, NextApiResponse } from 'next';

const BUFFER_TOKEN = process.env.BUFFER_TOKEN || '';
const GQL_ENDPOINT = process.env.GQL_ENDPOINT || '';
const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || '';
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID || '';
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '';

// Timeout for all external HTTP calls (ms)
const FETCH_TIMEOUT = 15_000;

export const config = {
  api: { bodyParser: { sizeLimit: '20mb' } },
};


/** fetch() with an AbortController timeout so we never hang forever */
async function fetchWithTimeout(url: string, options: RequestInit, ms = FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Structured user-facing error — never leaks internal stack traces */
function apiError(res: NextApiResponse, status: number, message: string, code?: string) {
  return res.status(status).json({ success: false, error: message, code: code || 'ERROR' });
}

/**
 * Upload base64 image to a CDN and return a public URL.
 * Tries Cloudinary → Imgur → ImgBB in order, returns null if all fail.
 */
async function uploadImage(base64String: string, mimeType: string): Promise<{ url: string; provider: string } | null> {
  // 1. Cloudinary — most reliable for Instagram
  if (CLOUDINARY_CLOUD && CLOUDINARY_PRESET) {
    try {
      const res = await fetchWithTimeout(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: `data:image/jpeg;base64,${base64String}`,
            upload_preset: CLOUDINARY_PRESET,
          }),
        }
      );
      const data = await res.json();
      if (data.secure_url) return { url: data.secure_url, provider: 'cloudinary' };
      console.warn('[buffer] Cloudinary failed:', data.error?.message);
    } catch (e: any) {
      console.warn('[buffer] Cloudinary exception:', e.message);
    }
  }

  // 2. Imgur fallback
  if (IMGUR_CLIENT_ID) {
    try {
      const res = await fetchWithTimeout('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: { 'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64String, type: 'base64' }),
      });
      const data = await res.json();
      if (data.success && data.data?.link) return { url: data.data.link, provider: 'imgur' };
      console.warn('[buffer] Imgur failed:', data.data?.error);
    } catch (e: any) {
      console.warn('[buffer] Imgur exception:', e.message);
    }
  }

  // 3. ImgBB fallback
  if (IMGBB_API_KEY) {
    try {
      const form = new URLSearchParams();
      form.append('key', IMGBB_API_KEY);
      form.append('image', base64String);
      form.append('expiration', '15552000');
      const res = await fetchWithTimeout('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) {
        const url = data.data.image?.url || data.data.display_url || data.data.url;
        return { url, provider: 'imgbb' };
      }
      console.warn('[buffer] ImgBB failed:', data.error);
    } catch (e: any) {
      console.warn('[buffer] ImgBB exception:', e.message);
    }
  }

  return null;
}

/** Run Buffer GQL query/mutation with timeout */
async function gql(query: string, variables?: Record<string, any>) {
  if (!GQL_ENDPOINT || !BUFFER_TOKEN) {
    throw new Error('Buffer API configuration is missing (GQL_ENDPOINT or BUFFER_TOKEN)');
  }

  const res = await fetchWithTimeout(GQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BUFFER_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const action = query.action as string;

  // GET /profiles
  if (method === 'GET' && action === 'profiles') {
    try {
      const result = await gql(`
        query GetProfiles {
          account {
            organizations {
              id
              name
              channels { id name service }
            }
          }
        }
      `);

      if (result.errors) {
        console.error('[buffer] profiles GQL error:', result.errors);
        return apiError(res, 502, 'Could not load Buffer profiles. Please try again.', 'PROFILES_ERROR');
      }

      const channels = result.data?.account?.organizations?.flatMap((org: any) =>
        org.channels.map((ch: any) => ({ ...ch, organizationId: org.id }))
      ) || [];

      return res.status(200).json(channels);
    } catch (e: any) {
      console.error('[buffer] profiles exception:', e.message);
      // Don't block the page — return empty array with a warning flag
      return res.status(200).json({ channels: [], warning: 'Could not load profiles. Check your Buffer connection.' });
    }
  }

  // ── POST /upload_image ─────────────────────────────────────────────────────
  if (method === 'POST' && action === 'upload_image') {
    const { image_data, image_mime_type } = body || {};
    if (!image_data) return apiError(res, 400, 'image_data is required', 'MISSING_IMAGE');

    try {
      const base64String = image_data.includes(',') ? image_data.split(',')[1] : image_data;
      const mimeType = image_mime_type || 'image/jpeg';

      const uploaded = await uploadImage(base64String, mimeType);
      if (uploaded) {
        return res.status(200).json({ success: true, url: uploaded.url, provider: uploaded.provider });
      }
      return apiError(res, 502, 'Could not upload image. Check your Cloudinary/Imgur/ImgBB settings.', 'IMAGE_UPLOAD_FAILED');
    } catch (e: any) {
      console.error('[buffer] upload_image exception:', e.message);
      return apiError(res, 500, 'Image upload failed. Please try again.', 'INTERNAL_ERROR');
    }
  }

  // ── POST /create_update ────────────────────────────────────────────────────

  if (method === 'POST' && action === 'create_update') {
    // Validate required fields upfront
    const { profile_id, text, image_url, image_data, image_mime_type } = body || {};

    if (!profile_id) return apiError(res, 400, 'No Instagram account selected.', 'MISSING_PROFILE');
    if (!text?.trim()) return apiError(res, 400, 'Post text cannot be empty.', 'MISSING_TEXT');

    try {
      // ── Step 1: Get Instagram metadata schema (cached-friendly, non-blocking) ─
      let instagramFields: string[] = ['type', 'shouldShareToFeed']; // safe defaults
      let postTypeValue = 'post'; // safe default

      try {
        const introResult = await gql(`
          query IntrospectInstagram {
            instagramMeta: __type(name: "InstagramPostMetadataInput") {
              inputFields { name }
            }
            postType: __type(name: "PostType") {
              enumValues { name }
            }
          }
        `);
        const fields = introResult.data?.instagramMeta?.inputFields?.map((f: any) => f.name) || [];
        const enums = introResult.data?.postType?.enumValues?.map((e: any) => e.name) || [];
        if (fields.length) instagramFields = fields;
        if (enums.length) {
          postTypeValue = ['post', 'feed', 'image', 'standard'].find(p =>
            enums.map((v: string) => v.toLowerCase()).includes(p)
          ) || enums[0];
        }
      } catch (e: any) {
        // Non-fatal — use safe defaults above
        console.warn('[buffer] introspection failed, using defaults:', e.message);
      }

      // ── Step 2: Upload image ───────────────────────────────────────────────
      let resolvedImageUrl: string | null = image_url || null;

      if (image_data) {
        const base64String = image_data.includes(',') ? image_data.split(',')[1] : image_data;
        const mimeType = image_mime_type || 'image/jpeg';

        const uploaded = await uploadImage(base64String, mimeType);
        if (uploaded) {
          resolvedImageUrl = uploaded.url;
          console.log(`[buffer] image uploaded via ${uploaded.provider}:`, resolvedImageUrl);
        } else {
          // Image upload failed — for Instagram this will likely fail, but we still
          // attempt the post. The user gets a clear warning either way.
          console.error('[buffer] all image upload providers failed');
          return apiError(
            res, 502,
            'Could not upload the image. Please check your Cloudinary settings or try again.',
            'IMAGE_UPLOAD_FAILED'
          );
        }
      }

      // ── Step 3: Build CreatePostInput ──────────────────────────────────────
      const instagramMetadata: Record<string, any> = {};
      if (instagramFields.includes('type')) instagramMetadata.type = postTypeValue;
      if (instagramFields.includes('shouldShareToFeed')) instagramMetadata.shouldShareToFeed = true;

      const input: Record<string, any> = {
        channelId: profile_id,
        text,
        schedulingType: 'automatic',
        mode: 'shareNow',
        saveToDraft: false,
      };

      if (Object.keys(instagramMetadata).length > 0) {
        input.metadata = { instagram: instagramMetadata };
      }

      if (resolvedImageUrl) {
        input.assets = { images: [{ url: resolvedImageUrl }] };
      }

      // ── Step 4: Create the post ────────────────────────────────────────────
      const result = await gql(`
        mutation CreatePost($input: CreatePostInput!) {
          createPost(input: $input) {
            __typename
            ... on PostActionSuccess {
              post { id text status }
            }
            ... on UnexpectedError {
              message
            }
          }
        }
      `, { input });

      if (result.errors) {
        console.error('[buffer] createPost GQL error:', result.errors);
        return apiError(res, 502, 'Buffer rejected the post. Please try again.', 'BUFFER_GQL_ERROR');
      }

      const payload = result.data?.createPost;

      if (payload?.__typename === 'PostActionSuccess') {
        const post = payload.post;
        // status "sent" = live, "error" = Instagram rejected it
        if (post.status === 'error') {
          return res.status(200).json({
            success: false,
            code: 'INSTAGRAM_REJECTED',
            error: 'Post was sent to Buffer but Instagram rejected it. Check your Instagram account connection in Buffer.',
            postId: post.id,
          });
        }
        return res.status(200).json({
          success: true,
          message: 'Successfully Published!',
          postId: post.id,
          status: post.status,
        });
      }

      if (payload?.__typename === 'UnexpectedError') {
        console.error('[buffer] UnexpectedError:', payload.message);
        return apiError(res, 502, payload.message || 'An unexpected error occurred in Buffer.', 'BUFFER_UNEXPECTED');
      }

      // Truly unknown response
      console.error('[buffer] unknown response type:', payload);
      return apiError(res, 502, 'Received an unexpected response from Buffer.', 'UNKNOWN_RESPONSE');

    } catch (e: any) {
      console.error('[buffer] create_update exception:', e.message);
      if (e.name === 'AbortError') {
        return apiError(res, 504, 'Request timed out. Please try again.', 'TIMEOUT');
      }
      return apiError(res, 500, 'Something went wrong. Please try again.', 'INTERNAL_ERROR');
    }
  }

  // ── GET /post_status ───────────────────────────────────────────────────────
  if (method === 'GET' && action === 'post_status') {
    const postId = query.post_id as string;
    if (!postId) return apiError(res, 400, 'post_id is required', 'MISSING_POST_ID');

    try {
      const result = await gql(`
        query GetPost($input: PostInput!) {
          post(input: $input) {
            id
            status
            error { message supportUrl rawError }
          }
        }
      `, { input: { id: postId } });

      if (result.errors) {
        console.error('[buffer] post_status GQL error:', result.errors);
        return apiError(res, 502, 'Could not fetch post status.', 'POST_STATUS_ERROR');
      }

      const post = result.data?.post;
      return res.status(200).json({
        postId: post?.id,
        status: post?.status,
        errorMessage: post?.error?.message || null,
        rawError: post?.error?.rawError || null,
      });
    } catch (e: any) {
      console.error('[buffer] post_status exception:', e.message);
      return apiError(res, 500, 'Could not fetch post status. Please try again.', 'INTERNAL_ERROR');
    }
  }

  return apiError(res, 405, 'Method not allowed', 'METHOD_NOT_ALLOWED');
}