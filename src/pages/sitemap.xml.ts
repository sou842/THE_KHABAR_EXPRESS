import { staticPages } from "@/assets/static";
import { GetServerSideProps } from "next";
import { format } from "date-fns";

interface Blog {
  url: string;
}

interface BlogApiResponse {
  data?: Blog[];
}

function generateSitemap(staticPages: string[], blogs: Blog[] = [], tags: string[] = []): string {
  const staticUrls = staticPages
    .map((page: any) =>
      generateUrlEntry(page, {
        changefreq: "monthly",
        priority: "1.0",
        lastmod: format(new Date(), "yyyy-MM-dd"),
      })
    )
    .join("");

  const blogUrls = blogs
    .map((blog: any) => {
      // 1. English version (default)
      const entries = [
        generateUrlEntry(`/blog/${blog?.url}`, {
          changefreq: "weekly",
          priority: "0.8",
          lastmod: format(new Date(blog?.updatedAt || blog?.createdAt), "yyyy-MM-dd"),
        })
      ];

      // 2. Add translated versions if they exist in DB
      if (blog.translations) {
        Object.keys(blog.translations).forEach((lang) => {
          entries.push(
            generateUrlEntry(`/${lang}/blog/${blog?.url}`, {
              changefreq: "weekly",
              priority: "0.8",
              lastmod: format(new Date(blog?.updatedAt || blog?.createdAt), "yyyy-MM-dd"),
            })
          );
        });
      }

      return entries.join("");
    })
    .join("");

  const tagUrls = (tags as any[])
    ?.map((tagObj: any) => {
      const tagName = typeof tagObj === 'string' ? tagObj : tagObj.tag;
      if (!tagName) return "";
      
      // Properly encode the tag for the URL
      const encodedTag = encodeURIComponent(tagName).replace(/%20/g, '+');
      
      return generateUrlEntry(`/topic/${encodedTag}`, {
        changefreq: "weekly",
        priority: "0.6",
        lastmod: format(new Date(), "yyyy-MM-dd"),
      });
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticUrls}${blogUrls}${tagUrls}
      </urlset>`;
}

function generateUrlEntry(
  path: string,
  { changefreq, priority, lastmod }: { changefreq: string; priority: string, lastmod?: string }
): string {
  // Ensure the path itself is XML-safe by replacing & with &amp;
  // although URI encoding usually handles this, naked & in loc is forbidden.
  const fullUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thekhabarexpress.com'}${path}`.replace(/&/g, '&amp;');

  return `
      <url>
        <loc>${fullUrl}</loc>
        <priority>${priority}</priority>
        <lastmod>${lastmod}</lastmod>
        <changefreq>${changefreq}</changefreq>
      </url>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  if (!res) {
    return { props: {} };
  }
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thekhabarexpress.com';
    const [blogRes, tagRes] = await Promise.all([
      fetch(`${siteUrl}/api/sitemap`),
      fetch(`${siteUrl}/api/blogs/tags?sitemap=true`)
    ]);

    const [{ data: blogs = [] }, { data: tags = [] }] = await Promise.all([
      blogRes.json(),
      tagRes.json()
    ]);

    const sitemap = generateSitemap(staticPages, blogs, tags);

    res.setHeader("Content-Type", "text/xml");
    res.write(sitemap);
    res.end();

    return { props: {} };
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.statusCode = 500;
    res.end();

    return { props: {} };
  }
};

export default function Sitemap() {
  return null;
}
