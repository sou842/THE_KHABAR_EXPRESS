import { GetServerSideProps } from "next";
import dbConnect from "@/lib/mongoose";
import { Blog } from "@/models/blog.model";
import { translateText, translateBody, SupportedLanguage, SUPPORTED_LANGUAGES } from "@/lib/translate";
import { BlogView } from "@/components/BlogView";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const lang = params?.lang as string;
  const slug = params?.slug as string;

  // 1. Validate language
  if (!SUPPORTED_LANGUAGES.includes(lang as any)) {
    return { notFound: true };
  }

  try {
    await dbConnect();

    // 2. Fetch the English blog (source of truth)
    // We find by 'url' which is our slug field
    const blogDoc = await Blog.findOne({ url: slug, status: "approved" });
    if (!blogDoc) {
      return { notFound: true };
    }

    const blog = JSON.parse(JSON.stringify(blogDoc));
    let displayTitle = blog.title;
    let displayBody = blog.body;

    // 3. Handle Translation Logic
    if (lang !== "en") {
      const targetLang = lang as SupportedLanguage;

      // Check if translation already exists in DB cache
      if (blog.translations && blog.translations[targetLang]) {
        displayTitle = blog.translations[targetLang].title;
        displayBody = blog.translations[targetLang].body;
      } else {
        // Perform on-demand translation
        const [translatedTitle, translatedBody] = await Promise.all([
          translateText(blog.title, targetLang),
          translateBody(blog.body, targetLang),
        ]);

        // Update the document in MongoDB
        await Blog.updateOne(
          { _id: blog._id },
          {
            $set: {
              [`translations.${targetLang}`]: {
                title: translatedTitle,
                body: translatedBody,
              },
              updatedAt: new Date(),
            },
          }
        );

        displayTitle = translatedTitle;
        displayBody = translatedBody;
      }
    }

    // 4. Update the blog object with translated content for rendering
    const translatedBlog = {
      ...blog,
      title: displayTitle,
      body: displayBody,
    };

    // 5. Fetch related posts (existing logic from [id].tsx)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thekhabarexpress.com';
    const primaryTag = blog.tags?.[0];
    
    let relatedPosts = [];
    try {
        let relatedRes;
        if (primaryTag) {
          relatedRes = await fetch(`${siteUrl}/api/blogs?tag=${encodeURIComponent(primaryTag)}&limit=4&status=approved`);
        }
        
        if (!relatedRes || !relatedRes.ok) {
          relatedRes = await fetch(`${siteUrl}/api/blogs?category=${blog.category}&limit=4&status=approved`);
        }
        
        const relatedData = await relatedRes.json();
        relatedPosts = (relatedData?.data || [])
          ?.filter((p: any) => p?._id !== blog?._id)
          ?.slice(0, 4);
    } catch (e) {
        console.error("Related posts fetch failed", e);
    }

    return {
      props: {
        blog: translatedBlog,
        relatedPosts: JSON.parse(JSON.stringify(relatedPosts)),
        lang, // Pass current lang back to props
      },
    };
  } catch (error) {
    console.error("Error in localized blog page:", error);
    return { notFound: true };
  }
};

// Reuse exactly the same component and layout from the original blog page
export default BlogView;
