import { FC } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import { toast } from "sonner";
import { GetStaticProps, GetStaticPaths } from "next";
import { Calendar, Eye, Share2, Facebook, Twitter } from "lucide-react";
import { motion } from "framer-motion";

import BlogCard from "@/components/BlogCard";
import DateTimeDisplay from "@/components/DateTimeDisplay";
import SeoMeta from "@/components/SeoMeta";
import { BlogContent } from "@/components/BlogContent";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import FaqSchema, { IFaqItem } from "@/components/BlogEditor/FaqSchema";

interface BlogPost {
  _id: string;
  title: string;
  body: any[];
  category: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  thumbnail: any;
  url: string;
  author?: {
    name: string;
    image?: string;
  };
  faqs: IFaqItem[]
}

interface BlogPostPageProps {
  blog: BlogPost;
  relatedPosts: BlogPost[];
}

const Blog: FC<BlogPostPageProps> = ({ blog, relatedPosts }) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technology: "bg-blue-100 text-blue-800",
      health: "bg-green-100 text-green-800",
      finance: "bg-purple-100 text-purple-800",
      politics: "bg-red-100 text-red-800",
      entertainment: "bg-pink-100 text-pink-800",
      sports: "bg-orange-100 text-orange-800",
    };

    return colors[blog?.category?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const handleCopy = () => {
    const URL = window.location.href;
    navigator.clipboard.writeText(URL);
    toast.success("Link copied!!");
  };

  return (
    <Layout disableDefaultMeta>
      <SeoMeta
        image={blog?.thumbnail?.image}
        title={blog?.thumbnail?.title}
        description={blog?.thumbnail?.description}
        url={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blog?.url}`}
        category={blog?.category}
        createdAt={blog?.createdAt}
        updatedAt={blog?.updatedAt}
        author={blog?.author || ''}
      />

      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <article className="py-8 md:py-12" itemScope itemType="https://schema.org/NewsArticle">
          <div className="khabar-container max-w-4xl">
            {/* Category and breadcrumbs */}
            <div>
              <nav aria-label="Breadcrumb" className="flex items-center text-sm text-muted-foreground mb-2">
                <Link
                  href="/"
                  aria-label="Home"
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </Link>
                <span className="mx-2" aria-hidden="true">/</span>
                <Link
                  href={`/category/${blog?.category}`}
                  aria-label={`${blog?.category} Category`}
                  className="hover:text-foreground transition-colors"
                >
                  {blog?.category}
                </Link>
                {blog?.category && <span className="mx-2" aria-hidden="true">/</span>}
                <span className="text-foreground" aria-current="page">
                  {blog?.title?.substring(0, 20)}...
                </span>
              </nav>
              <div
                className={`category-tag ${getCategoryColor(blog?.category)}`}
                aria-label={`Category: ${blog?.category}`}
                itemProp="articleSection"
              >
                {blog?.category}
              </div>
            </div>

            {/* Content */}
            <div className="w-full pb-10 flex flex-col items-center gap-5 mt-6" itemProp="articleBody">
              {blog?.body?.map((block: any, index: number) => (
                <BlogContent key={index} block={block} />
              ))}
            </div>

            {/* Social sharing */}
            <div className="border-t border-b py-4 mb-8">
              <div className="flex items-center justify-between">
                {/* Meta information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" aria-hidden="true" />
                    <time dateTime={new Date(blog?.createdAt).toISOString()} itemProp="datePublished">
                      <DateTimeDisplay type="date">
                        {blog?.createdAt}
                      </DateTimeDisplay>
                    </time>
                  </div>
                  {/* <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{blog?.views} views</span>
                  </div> */}
                </div>

                <div className="flex items-center space-x-4">
                  {/* <button className="text-muted-foreground cursor-pointer hover:text-blue-600 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </button>
                  <button className="text-muted-foreground cursor-pointer hover:text-blue-400 transition-colors">
                    <Twitter className="h-5 w-5" />
                  </button> */}
                  <button
                    onClick={handleCopy}
                    title="Copy Link"
                    aria-label="Copy article link to clipboard"
                    className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Share2 className="h-5 w-5" aria-hidden="true" />
                        </TooltipTrigger>
                        <TooltipContent
                          className="text-muted-foreground"
                          side="top"
                        >
                          Copy Link
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="sr-only">Copy article link</span>
                  </button>
                </div>
              </div>
            </div>

            {/* FAQ's section */}
            {blog?.faqs?.length > 0 &&
              <section className="mx-auto">
                <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
                <FaqSchema faqs={blog?.faqs || []} />
              </section>}

            {/* Related articles */}
            <section aria-labelledby="related-articles-heading" className="mt-10 mb-12">
              <h2 id="related-articles-heading" className="text-2xl font-medium mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts?.map((post: any) => (
                  <BlogCard variant="featured" key={post?._id} blog={post} />
                ))}
                {relatedPosts?.length === 0 && (
                  <p className="text-muted-foreground col-span-3 text-center py-4">No related articles found</p>
                )}
              </div>
            </section>
          </div>
        </article>
      </motion.div>
    </Layout>
  );
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

    const relatedRes = await fetch(
      `${siteUrl}/api/blogs?category=${blogData.data.category}&limit=3&status=approved`
    );
    if (!relatedRes.ok) {
      return {
        props: {
          blog: blogData.data,
          relatedPosts: [],
        },
        revalidate: 60 * 60,
      };
    }

    const relatedData = await relatedRes.json();

    return {
      props: {
        blog: blogData.data,
        relatedPosts: relatedData.data || [],
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
