import { FC } from "react";
import { GetStaticProps, GetStaticPaths } from "next";
import { BlogView, BlogPost } from "@/components/BlogView";

interface BlogPostPageProps {
  blog: BlogPost;
  relatedPosts: BlogPost[];
}

const Blog: FC<BlogPostPageProps> = ({ blog, relatedPosts }) => {
  return <BlogView blog={blog} relatedPosts={relatedPosts} />;
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      console.warn("NEXT_PUBLIC_SITE_URL is not defined. Skipping getStaticPaths API call.");
      return { paths: [], fallback: "blocking" };
    }

    const res = await fetch(`${siteUrl}/api/blogs`);

    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!data.data) {
      throw new Error("Invalid data format from API");
    }

    const paths = data?.data?.map((post: { _id: string }) => ({
      params: { id: post._id.toString() },
    }));

    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Error in getStaticPaths:", error);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    if (!params?.id) {
      return { notFound: true };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      console.warn("NEXT_PUBLIC_SITE_URL is not defined. Failing getStaticProps.");
      return { notFound: true };
    }

    const blogRes = await fetch(
      `${siteUrl}/api/blogs/${params?.id}`
    );
    if (!blogRes.ok) {
      return { notFound: true };
    }
    const blogData = await blogRes.json();

    if (!blogData.success || !blogData.data) {
      return { notFound: true };
    }

    // Attempt to fetch by tags first (Topical Authority)
    let relatedRes;
    const primaryTag = blogData?.data?.tags?.[0];

    if (primaryTag) {
      relatedRes = await fetch(
        `${siteUrl}/api/blogs?tag=${encodeURIComponent(primaryTag)}&limit=4&status=approved`
      );
    }

    // Fallback to category if no tag or tag fetch failed or returned too few results
    if (!relatedRes || !relatedRes.ok) {
      relatedRes = await fetch(
        `${siteUrl}/api/blogs?category=${blogData.data.category}&limit=4&status=approved`
      );
    }

    const relatedData = await relatedRes.json();

    // Filter out current post and ensure we have exactly 4 if possible
    const relatedPosts = (relatedData?.data || [])
      ?.filter((p: any) => p?._id !== blogData?.data?._id)
      ?.slice(0, 4);

    return {
      props: {
        blog: blogData.data,
        relatedPosts,
      },
      revalidate: 60 * 60,
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};

export default Blog;
