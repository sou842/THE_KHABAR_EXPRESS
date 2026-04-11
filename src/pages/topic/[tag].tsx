import { FC, useMemo } from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { Skeleton } from "@/components/Skeleton";
import { getter } from "@/lib/helper";
import useSWRInfinite from "swr/infinite";
import { useParams } from "next/navigation";
import { Loader2, Hash } from "lucide-react";

const TopicHub: FC = () => {
  const params = useParams<{ tag: string }>();
  const tag = params?.tag;
  const PAGE_SIZE = 9;

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.data.length) return null;
    return `/api/blogs?tag=${tag}&status=approved&page=${pageIndex + 1}&limit=${PAGE_SIZE}`;
  };

  const { data, size, setSize, isLoading, error } = useSWRInfinite(
    getKey,
    getter
  );

  const blogs = useMemo(() => {
    return data ? data.flatMap((page) => page.data) : [];
  }, [data]);

  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.data?.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.data?.length < PAGE_SIZE);

  if (error) {
    return (
      <Layout title="Error">
        <div className="khabar-container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Topic</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Layout>
    );
  }

  const displayTag = tag ? decodeURIComponent(tag as string) : "";

  return (
    <Layout 
      title={`${displayTag} News, Trends & Insights | The Khabar Express`} 
      path={`topic/${tag}`}
      description={`Stay informed with the latest ${displayTag} news, in-depth analysis, and expert perspectives on The Khabar Express. Discover trending stories and comprehensive coverage updated daily.`}
    >
      <div className="khabar-container py-8 md:py-12">
        {!isLoading || blogs.length > 0 ? (
          <>
            {/* Header section for pSEO enhanced with Breadcrumbs */}
            <div className="mb-16 border-b border-border pb-12">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-8">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span className="opacity-40">/</span>
                <span className="text-primary font-bold">Topics</span>
                <span className="opacity-40">/</span>
                <span className="text-foreground font-bold">{displayTag}</span>
              </nav>

              <div className="flex items-center gap-3 text-primary mb-4">
                <Hash className="h-6 w-6" />
                <span className="text-sm font-bold uppercase tracking-widest">Topic Hub</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-6 capitalize">
                {displayTag}
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
                {`Delivering comprehensive coverage and expert analysis on ${displayTag}. Our curated collection of reports, guides, and opinions keeps you at the forefront of the most important developments in ${displayTag}.`}
              </p>
            </div>

            {isEmpty ? (
              <div className="text-center py-20 bg-muted/20 rounded-sm border border-dashed border-border">
                <p className="text-lg text-muted-foreground italic">No articles found matching this topic yet.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                  {blogs && blogs?.map((post: any, index: number) => (
                    <BlogCard key={post?._id || index} blog={post} />
                  ))}
                </div>

                {/* Load More */}
                {!isReachingEnd && (
                  <div className="flex justify-center mb-16">
                    <button
                      onClick={() => setSize(size + 1)}
                      disabled={isLoadingMore}
                      className="flex items-center gap-2 px-10 py-4 bg-foreground text-background rounded-full font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-70 shadow-xl"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Fetching more...</span>
                        </>
                      ) : (
                        <span>Explore More {displayTag}</span>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <Skeleton type="category-page" />
        )}
      </div>
    </Layout>
  );
};

export default TopicHub;
