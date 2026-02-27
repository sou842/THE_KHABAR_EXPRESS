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
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <article className="py-8 md:py-16" itemScope itemType="https://schema.org/NewsArticle">
          <div className="w-full">
            {/* Category, breadcrumbs, and metadata bar */}
            <div className="mb-10 space-y-4">
              {/* Breadcrumb — lightest element, sits at the very top */}
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/60"
              >
                <Link href="/" className="hover:text-primary transition-colors duration-200">
                  Home
                </Link>
                <span className="mx-2" aria-hidden="true">/</span>
                <Link href={`/category/${blog?.category}`} className="hover:text-primary transition-colors duration-200">
                  {blog?.category}
                </Link>
                <span className="mx-2" aria-hidden="true">/</span>
                <span
                  className="text-muted-foreground truncate max-w-[260px] sm:max-w-[440px]"
                  title={blog?.title}
                >
                  {blog?.title}
                </span>
              </nav>

              {/* Meta row — author + date, minimal */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] tracking-wide text-muted-foreground/70">
                {blog?.author?.name && (
                  <span itemProp="author" className="font-semibold text-foreground/80">
                    {blog.author.name}
                  </span>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 opacity-40" aria-hidden="true" />
                  <time
                    dateTime={new Date(blog?.createdAt).toISOString()}
                    itemProp="datePublished"
                  >
                    <DateTimeDisplay type="date">{blog?.createdAt}</DateTimeDisplay>
                  </time>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="w-full pb-12 flex flex-col items-center gap-0 mt-8" itemProp="articleBody">
              {blog?.body?.map((block: any, index: number) => (
                <BlogContent key={index} block={block} />
              ))}
            </div>

            {/* Article Footer & Social sharing */}
            <div className="border-t border-b border-border py-6 mb-12 bg-muted/20">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
                <p className="text-sm font-bold uppercase tracking-widest text-primary border-l-2 border-primary pl-3">
                  Share this story
                </p>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleCopy}
                    title="Copy Link"
                    aria-label="Copy article link to clipboard"
                    className="flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-sm text-sm font-semibold hover:bg-muted transition-colors text-foreground"
                  >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>
            </div>

            {/* FAQ's section */}
            {blog?.faqs?.length > 0 &&
              <section className="mx-auto my-12 p-8 border border-border rounded-sm bg-muted/10">
                <h3 className="text-xl font-bold font-serif mb-6 border-l-4 border-primary pl-4 text-foreground">Frequently Asked Questions</h3>
                <FaqSchema faqs={blog?.faqs || []} />
              </section>}

            {/* Related articles */}
            <section aria-labelledby="related-articles-heading" className="mt-16 mb-12 border-t border-border pt-12">
              <div className="mb-8 flex items-baseline justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Read More</h2>
                  <h3 id="related-articles-heading" className="text-3xl font-bold font-serif text-foreground tracking-tight">Related Articles</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts && relatedPosts?.map((post: any) => (
                  <BlogCard variant="editorPick" key={post?._id} blog={post} />
                ))}
                {relatedPosts?.length === 0 && (
                  <p className="text-muted-foreground col-span-3 text-center py-8 bg-muted/30 rounded-sm font-serif italic text-lg border border-border">No related articles found matching this topic.</p>
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
