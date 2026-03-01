import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import Link from "next/link";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { Skeleton } from "@/components/Skeleton";
import { getter, preventRerendering } from "@/lib/helper";
import { IBlog } from "@/models/blog.model";
import { useEffect, useRef } from "react";
import { PenLine, ArrowRight } from "lucide-react";

export default function Home() {
  // 1. Fetch general top articles
  const { data: generalData, isLoading: isGeneralLoading } = useSWR<any>(
    "/api/blogs?limit=15&status=approved",
    getter,
    preventRerendering
  );

  // 2. Separate API calls for categories
  const { data: techData } = useSWR<any>(
    "/api/blogs?category=technology&limit=4&status=approved",
    getter,
    preventRerendering
  );
  const { data: financeData } = useSWR<any>(
    "/api/blogs?category=finance&limit=4&status=approved",
    getter,
    preventRerendering
  );
  const { data: sportsData } = useSWR<any>(
    "/api/blogs?category=sports&limit=4&status=approved",
    getter,
    preventRerendering
  );

  // 3. Infinite scrolling for All Stories
  const getInfiniteKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && (!previousPageData.data || previousPageData.data.length === 0)) return null;
    return `/api/blogs?limit=8&page=${pageIndex + 1}&status=approved`;
  };
  
  const { data: infiniteData, size, setSize, isLoading: isInfiniteLoading } = useSWRInfinite<any>(
    getInfiniteKey,
    getter,
    preventRerendering
  );

  // Parse general articles
  const articles: IBlog[] = generalData?.data || [];
  
  const featuredBlog = articles[0] || null;
  const topStories = articles.slice(1, 4) || [];
  const trendingBlogs = articles.slice(4, 7) || [];
  const mostReadBlogs = articles.slice(7, 10) || [];
  const editorsPicks = articles.slice(10, 13) || [];
  
  // Parse category arrays
  const designBlogs: IBlog[] = techData?.data || [];
  const financeBlogs: IBlog[] = financeData?.data || [];
  const webDevBlogs: IBlog[] = sportsData?.data || [];
  
  // Flatten infinite scroll data
  const latestAll: IBlog[] = infiniteData ? infiniteData.reduce((acc, val) => [...acc, ...(val?.data || [])], []) : [];
  const isReachingEnd = infiniteData && infiniteData[infiniteData.length - 1]?.data?.length < 8;

  // Helper functions moved to BlogCard.tsx

  if (isGeneralLoading && !articles.length) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-grow bg-background">
          <Skeleton type="home" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      <Head>
        <title>Khabar - The Latest News and Insights</title>
      </Head>

      <Navbar />

      <main className="flex-grow bg-background">
        {/* Large Hero Featured Article */}
        {featuredBlog && (
          <section className="border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
              <BlogCard blog={featuredBlog} variant="hero" />
            </div>
          </section>
        )}

        {/* Top Stories Grid */}
        {topStories.length > 0 && (
          <section className="border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Top Stories</h2>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">What's trending now</h3>
              </div>
              
              <div className="space-y-6">
                {topStories.map((blog, idx) => (
                  <BlogCard key={idx} blog={blog} variant="topStory" index={idx} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Trending & Categories Grid */}
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Trending */}
              <div>
                <h3 className="text-xl font-bold text-foreground mb-6">Trending</h3>
                <div className="space-y-4">
                  {trendingBlogs && trendingBlogs?.length > 0 && trendingBlogs?.map((blog, idx) => (
                    <BlogCard key={idx} blog={blog} variant="trending" />
                  ))}
                </div>
              </div>

              {/* Contributor CTA */}
              <div className="bg-primary/5 border border-primary/20 rounded-sm p-8 flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <PenLine size={80} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 relative z-10">Become a Contributor</h3>
                <p className="text-muted-foreground mb-6 relative z-10">Share your stories, insights, and expertise with our growing community of readers.</p>
                <div className="relative z-10">
                  <Link 
                    href="/write" 
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-sm font-semibold hover:bg-primary/90 transition-all hover:gap-3 group"
                  >
                    <span>Start Writing</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Sections - Design, Tech, Web Dev */}
        <section className="border-t border-border py-12 md:py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Design Section (Mapped to Technology here as example fallback) */}
              {designBlogs?.length > 0 && (
                <div className="border-l-4 border-primary pl-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">{designBlogs?.[0]?.category}</h3>
                  <div className="space-y-6">
                    {designBlogs?.map((blog, idx) => (
                      <BlogCard key={idx} blog={blog} variant="trending" />
                    ))}
                  </div>
                </div>
              )}

              {/* Technology Section (Mapped to Finance) */}
              {financeBlogs?.length > 0 && (
                <div className="pl-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">{financeBlogs?.[0]?.category}</h3>
                  <div className="space-y-6">
                    {financeBlogs?.map((blog, idx) => (
                      <BlogCard key={idx} blog={blog} variant="trending" />
                    ))}
                  </div>
                </div>
              )}

              {/* Web Development Section (Mapped to Sports) */}
              {webDevBlogs?.length > 0 && (
                <div className="pl-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-6">{webDevBlogs?.[0]?.category}</h3>
                  <div className="space-y-6">
                    {webDevBlogs?.map((blog, idx) => (
                      <BlogCard key={idx} blog={blog} variant="trending" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Editors' Picks Section */}
        {editorsPicks.length > 0 && (
          <section className="border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Curated</h2>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">Editors&apos; Picks</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {editorsPicks.map((blog, idx) => (
                  <BlogCard key={idx} blog={blog} variant="editorPick" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Most Read Articles Section */}
        {mostReadBlogs.length > 0 && (
          <section className="border-b border-border bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Popular</h2>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">Most Read This Week</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mostReadBlogs.map((blog, idx) => (
                  <BlogCard key={idx} blog={blog} variant="mostRead" index={idx} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Articles Grid Section */}
        {latestAll?.length > 0 && (
          <section className="border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              <div className="flex items-baseline justify-between mb-8">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Complete Archive</h2>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">All Stories</h3>
                </div>
                <Link href="/blog" className="text-primary font-semibold hover:text-primary/80 transition-colors hidden md:block">
                  Browse All &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {latestAll?.map((blog, idx) => (
                  <BlogCard key={`all-${idx}`} blog={blog} variant="compact" />
                ))}
              </div>
              
              {/* Infinite Scroll trigger / Loading state */}
              <div 
                className="mt-12 w-full flex justify-center py-8 border-t border-border"
              >
                {!isReachingEnd && (
                   <button 
                     onClick={() => setSize(size + 1)}
                     disabled={isInfiniteLoading}
                     className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                   >
                     {isInfiniteLoading ? (
                       <span className="flex items-center gap-2">
                         <svg className="animate-spin h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Loading more...
                       </span>
                     ) : "Load More Stories"}
                   </button>
                )}
                {isReachingEnd && latestAll.length > 0 && (
                  <p className="text-muted-foreground text-sm font-medium">You have reached the end of the archive.</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Industry Updates Section */}
        {articles.length > 0 && (
          <section className="border-b border-border bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              <div className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-2">News</h2>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">Industry Updates</h3>
              </div>

              <div className="space-y-4">
                {articles.slice(0, 4).map((blog, idx) => (
                  <BlogCard key={idx} blog={blog} variant="horizontal" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter & Social Section */}
        {/* <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 bg-primary text-primary-foreground rounded-sm p-8 md:p-12">
                <div className="max-w-2xl">
                  <h3 className="text-2xl md:text-3xl font-bold mb-3">Stay in the Loop</h3>
                  <p className="text-primary-foreground/80 mb-6 flex-wrap">Get the best stories, analysis, and insights delivered to your inbox every week. No spam, no fluff.</p>
                  <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="flex-1 bg-primary-foreground text-foreground px-4 py-3 rounded-sm placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-offset-primary focus:ring-primary-foreground"
                    />
                    <button
                      type="submit"
                      className="bg-primary-foreground text-primary px-8 py-3 rounded-sm font-extrabold uppercase tracking-widest text-xs hover:bg-primary-foreground/90 transition-colors whitespace-nowrap"
                    >
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section> */}

        {/* All Stories CTA */}
        {/* <section className="border-t border-border py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex justify-center">
            <Link href="/category/finance" className="inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-3 rounded-sm font-semibold hover:bg-primary/90 transition-colors">
              Explore Complete Archives
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section> */}
      </main>

      <Footer />
    </div>
  );
}
