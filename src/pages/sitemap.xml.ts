import { staticPages } from "@/assets/static";
import { GetServerSideProps } from "next";
import { format } from "date-fns";

interface Blog {
  url: string;
}

interface BlogApiResponse {
  data?: Blog[];
}

function generateSitemap(staticPages: string[], blogs: Blog[] = []): string {
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
    .map((blog: any) =>
      generateUrlEntry(`/blog/${blog?.url}`, {
        changefreq: "weekly",
        priority: "0.8",
        lastmod: format(new Date(blog?.updatedAt), "yyyy-MM-dd"),
      })
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticUrls}
        ${blogUrls}
      </urlset>`;
}

function generateUrlEntry(
  path: string,
  { changefreq, priority, lastmod }: { changefreq: string; priority: string, lastmod?: string }
): string {
  return `
      <url>
        <loc>${process.env.NEXT_PUBLIC_SITE_URL}${path}</loc>
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
    const blogRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/sitemap`
    );
    const { data: blogs = [] }: BlogApiResponse = await blogRes?.json();

    const sitemap = generateSitemap(staticPages, blogs);

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
