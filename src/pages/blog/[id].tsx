import { FC, useState, useRef } from "react";
import Layout from "@/components/Layout";
import Link from "next/link";
import { toast } from "sonner";
import { GetStaticProps, GetStaticPaths } from "next";
import { Calendar, Share2, Sparkles, BrainCircuit, MoreHorizontal, Flag, Link as LinkIcon, AlertTriangle, User, FileDown } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import BlogCard from "@/components/BlogCard";
import DateTimeDisplay from "@/components/DateTimeDisplay";
import SeoMeta from "@/components/SeoMeta";
import { BlogContent } from "@/components/BlogContent";
import TopicCloud from "@/components/TopicCloud";
import FaqSchema, { IFaqItem } from "@/components/BlogEditor/FaqSchema";
import AiSummarySection from "@/components/AI/AiSummarySection";
import TextToSpeech from "@/components/TextToSpeech";
import ArticleDisclaimer from "@/components/Disclaimers/ArticleDisclaimer";
import dynamic from "next/dynamic";
import { generateBlogPdf } from "@/lib/pdfUtils";
import TextSelectionTooltip from "@/components/AI/TextSelectionTooltip";
import { getImageUrl } from "@/lib/blogUtils";

const AskAiChat = dynamic(() => import("@/components/AI/AskAiChat"), {
  ssr: false,
});

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
  author?: string;
  authorId?: {
    _id: string;
    username: string;
  };
  faqs: IFaqItem[];
  tags?: string[];
  aiSummary?: {
    mainIdea: string;
    keyPoints: string[];
    finalTakeaway: string;
  };
}

interface BlogPostPageProps {
  blog: BlogPost;
  relatedPosts: BlogPost[];
}

const Blog: FC<BlogPostPageProps> = ({ blog, relatedPosts }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialQuestion, setChatInitialQuestion] = useState<{ id: number; text: string } | null>(null);
  const [displayTag] = blog?.tags || "";

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  const handleAskAiFromSelection = (selectedText: string) => {
    const questionText = `Tell me more about this line from the article: "${selectedText}"`;
    setChatInitialQuestion({ id: Date.now(), text: questionText });
    setIsChatOpen(true);
  };

  const handleDownloadPdf = async () => {
    try {
      await generateBlogPdf(blog);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Falling back to simple print...");
      window.print();
    }
  };

  const handleCopy = () => {
    const URL = window.location.href;
    navigator.clipboard.writeText(URL);
    toast.success("Link copied!!");
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting");
      return;
    }

    setIsSubmittingReport(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogId: blog?._id,
          reason: reportReason,
        }),
      });

      const data = await res?.json();
      if (data.success) {
        toast.success("Report submitted successfully. Thank you for our feedback.");
        setIsReportModalOpen(false);
        setReportReason("");
      } else {
        toast.error(data.message || "Failed to submit report");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (!blog) return null;

  return (
    <Layout disableDefaultMeta>
      <SeoMeta
        image={getImageUrl(blog as any)}
        title={blog?.title}
        description={blog?.thumbnail?.description || blog?.title}
        url={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blog?.url}`}
        category={blog?.category}
        createdAt={blog?.createdAt}
        updatedAt={blog?.updatedAt}
        author={blog?.author || ''}
      />

      <div className="flex w-full min-h-screen relative overflow-hidden">
        {/* Main Content Area */}
        <motion.div
          initial={false}
          animate={{ width: isChatOpen ? "calc(100% - var(--sidebar-width, 0px))" : "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 200 }}
          className="flex-shrink-0 lg:[--sidebar-width:500px] [--sidebar-width:0px]"
        >
          <motion.div
            className="max-w-4xl mx-auto px-2 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <article ref={articleRef} className="py-8 md:py-16" itemScope itemType="https://schema.org/NewsArticle">
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
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 opacity-40" aria-hidden="true" />
                      <time
                        dateTime={new Date(blog?.createdAt).toISOString()}
                        itemProp="datePublished"
                      >
                        <DateTimeDisplay className="text-xs" type="date">{blog?.createdAt}</DateTimeDisplay>
                      </time>
                    </div>
                  </div>

                </div>

                {/* Main content grid: sidebar on desktop */}
                <div className="flex flex-col gap-12 mt-4 mb-8">
                  <div className="flex-grow min-w-0" itemProp="articleBody">
                    <TextSelectionTooltip targetRef={articleRef} onAskAi={handleAskAiFromSelection} />
                    <div className="flex flex-col items-center gap-0">
                      {blog?.body?.map((block: any, index: number) => (
                        <BlogContent key={index} block={block} isFirst={index === 0} />
                      ))}
                    </div>

                    {/* Post-Article Actions */}
                    <div className="w-full p-4 mt-12 flex flex-col gap-4 rounded-2xl border border-border bg-muted/5">
                      {/* Quick Actions Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {displayTag && (
                          <span className="text-center gap-1 text-sm font-medium text-muted-foreground leading-snug">
                            Love this story? Explore more trending news on {' '}
                            <Link
                              href={`/topic/${encodeURIComponent(displayTag)}`}
                              className="font-semibold capitalize underline decoration-primary underline-offset-4"
                            >
                              {displayTag || ''}
                            </Link>
                          </span>
                        )}
                        <div className="flex justify-center sm:justify-start">
                          <TextToSpeech title={blog?.title} contentBlocks={blog?.body} />
                        </div>

                      </div>
                      {/* AI Summary takes full width */}
                      <AiSummarySection blogId={blog?._id} initialSummary={blog?.aiSummary} />

                    </div>
                  </div>

                  {/* Sidebar: Topic Cloud */}
                  <aside className="flex-shrink-0 space-y-12">
                    <div className="sticky top-24">
                      <TopicCloud />
                    </div>
                  </aside>
                </div>

                {/* Article Footer & Social sharing */}
                <div className="border-t border-b border-border py-6 mt-12 mb-12 bg-muted/20">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4">
                    <p className="text-sm font-bold uppercase tracking-widest text-primary border-l-2 border-primary pl-3">
                      Share this story
                    </p>

                    <div className="flex items-center space-x-4">
                      {/* Interactive Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            title="More actions"
                            aria-label="More actions for this article"
                            className="flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-sm text-sm font-semibold hover:bg-muted transition-colors text-foreground"
                          >
                            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                            <span>More</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-background border-border shadow-lg">
                          {blog?.authorId && (
                            <Link href={`/creator/${blog?.authorId?._id}`}>
                              <DropdownMenuItem className="cursor-pointer gap-2 py-2.5 focus:bg-muted focus:text-foreground font-medium">
                                <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                <span>View Creator Profile</span>
                              </DropdownMenuItem>
                            </Link>
                          )}
                          <DropdownMenuItem onClick={handleDownloadPdf} className="cursor-pointer gap-2 py-2.5 focus:bg-muted focus:text-foreground font-medium">
                            <FileDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <span>Download PDF</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleCopy} className="cursor-pointer gap-2 py-2.5 focus:bg-muted focus:text-foreground font-medium">
                            <LinkIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            <span>Copy Link</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setIsReportModalOpen(true)} className="cursor-pointer gap-2 py-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive font-medium">
                            <Flag className="h-4 w-4" aria-hidden="true" />
                            <span>Report Article</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>


                {/* FAQ's section */}
                {blog?.faqs?.length > 0 &&
                  <section className="mx-auto my-12 p-8 border border-border rounded-sm bg-muted/10">
                    <h3 className="text-xl font-bold font-serif mb-6 border-l-4 border-primary pl-4 text-foreground">Frequently Asked Questions</h3>
                    <FaqSchema faqs={blog?.faqs || []} />
                  </section>
                }

                <ArticleDisclaimer category={blog?.category} />

                {/* Related articles */}
                <section aria-labelledby="related-articles-heading" className="mt-0 mb-12">
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
        </motion.div>

        {/* AI Assistant Sidebar */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="fixed right-0 bottom-0 w-full h-full z-[100] bg-background border-l border-border lg:top-16 sm:lg:top-20 lg:w-[500px] lg:h-[calc(100vh-4rem)] sm:lg:h-[calc(100vh-5rem)] lg:z-[40]"
            >
              <AskAiChat
                blogId={blog._id}
                articleTitle={blog.title}
                initialSummary={blog.aiSummary}
                initialQuestion={chatInitialQuestion || undefined}
                onClose={() => setIsChatOpen(false)}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Floating Sidebar Toggle Button */}
        {!isChatOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="fixed right-8 bottom-8 z-50 flex items-center justify-center"
          >
            {/* Pulsing Aura */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-20 h-20 rounded-full bg-violet-500/20 blur-xl pointer-events-none"
            />

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsChatOpen(true)}
              className="relative flex items-center p-3.5 h-12 rounded-full bg-neutral-900 border border-neutral-800 shadow-2xl group overflow-hidden transition-all duration-500 ease-in-out hover:px-5"
            >
              {/* Shine effect */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 1 }}
                className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -skew-x-12 pointer-events-none"
              />

              {/* Icon Container */}
              <motion.div
                animate={{
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex items-center justify-center flex-shrink-0"
              >
                <Sparkles className="w-5 h-5 text-gray-100 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
              </motion.div>

              {/* Text - Hidden by default, shown on hover */}
              <div className="flex flex-col items-start overflow-hidden whitespace-nowrap w-0 opacity-0 group-hover:w-24 group-hover:opacity-100 group-hover:ml-3 transition-all duration-500 ease-in-out">
                <span className="text-[10px] font-bold text-white tracking-widest uppercase leading-none">Ask AI</span>
                <span className="text-[9px] text-neutral-400 font-medium leading-none mt-1">Direct Insights</span>
              </div>

              {/* Hover highlight border */}
              <div className="absolute inset-0 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Sidebar Toggle Global Styles for Footer */}
      {isChatOpen && (
        <style jsx global>{`
          footer {
            width: calc(100% - 500px) !important;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          @media (max-width: 1024px) {
            footer {
              width: 100% !important;
            }
          }
        `}</style>
      )}

      {/* Report Dialog */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[425px] h-fit md:h-auto max-h-[90vh] rounded-2xl sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              Report Article
            </DialogTitle>
            <DialogDescription className="text-sm text-start">
              We take your feedback seriously. Please share your concerns, and our editorial team will prioritize reviewing this content.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              id="reason"
              placeholder="Please provide specific details so we can take the appropriate action..."
              className="resize-none h-32 placeholder:text-gray-400"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportModalOpen(false)} className="hover:bg-muted focus:bg-muted">
              Cancel
            </Button>
            <Button onClick={handleReport} disabled={isSubmittingReport || !reportReason.trim()}>
              {isSubmittingReport ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
