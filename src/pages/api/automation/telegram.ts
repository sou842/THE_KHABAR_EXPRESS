import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../middleware/auth';

const BOT_TOKEN = '8622451212:AAFGMHRiifGjwgJIcSYon_wyNxT9KRim5qY';

export default withAuth(async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Admin only
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { chat_id, photo, caption, parse_mode } = req.body;

  if (!chat_id || !photo) {
    return res.status(400).json({ success: false, message: 'chat_id and photo are required' });
  }

  try {
    let buffer: Buffer;

    // 1. Detect if photo is base64 or URL
    if (photo.startsWith('data:image')) {
      console.log('[Telegram] Extracting image from base64');
      const base64Data = photo.split(',')[1];
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      // Resolve absolute URL for the image
      let imageUrl = photo;
      if (photo.startsWith('/')) {
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host;
        imageUrl = `${protocol}://${host}${photo}`;
      }

      // 2. Fetch the image data as a buffer
      console.log('[Telegram] Fetching image from:', imageUrl);
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        console.error('[Telegram] Image fetch failed:', imageResponse.status);
        throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }
    
    console.log('[Telegram] Image buffer size:', buffer.length);
    
    // 3. Construct multipart/form-data
    const formData = new FormData();
    formData.append('chat_id', chat_id);
    formData.append('caption', caption || '');
    formData.append('parse_mode', parse_mode || 'HTML');
    
    // Attach as a blob-like with explicit filename to force file upload
    // using Uint8Array to be safe with Blob constructor in all environments
    const blob = new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' });
    formData.append('photo', blob, 'image.jpg');

    // 4. Send to Telegram
    const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
      method: 'POST',
      body: formData,
    });

    const data = await telegramRes.json();

    if (data.ok) {
      console.log('[Telegram] Post successful');
      return res.status(200).json({ success: true, data: data.result });
    } else {
      console.error('[Telegram] Post failed:', data.description);
      return res.status(telegramRes.status).json({ 
        success: false, 
        message: data.description || 'Telegram API error',
        details: data 
      });
    }
  } catch (error: any) {
    console.error('[telegram-api] Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error' 
    });
  }
});

// Since Next.js 15+ fetch handles FormData natively in some environments,
// but we want to ensure multipart/form-data is handled correctly.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
