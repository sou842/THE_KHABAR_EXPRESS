import { FC, useState, useMemo } from "react";
import { GetServerSideProps } from "next";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { getter } from "@/lib/helper";
import useSWRInfinite from "swr/infinite";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import CategoryDisclaimer from "@/components/Disclaimers/CategoryDisclaimer";

const Category: FC = () => {
  const router = useRouter();
  const id = router.query.id;
  const category = Array.isArray(id) ? id[0] : id;
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const [showFilters, setShowFilters] = useState(false);
  const PAGE_SIZE = 9;

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (!category) return null;
    if (previousPageData && !previousPageData.data.length) return null;
    return `/api/blogs?category=${category}&status=approved&page=${pageIndex + 1}&limit=${PAGE_SIZE}`;
  };

  const { data, size, setSize, isLoading, isValidating, error } = useSWRInfinite(
    getKey,
    getter
  );

  const blogs = useMemo(() => {
    return data ? data.flatMap((page) => page?.data || []) : [];
  }, [data]);

  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.data?.length === 0;
  const isReachingEnd = isEmpty || (data && (data[data.length - 1]?.data?.length ?? 0) < PAGE_SIZE);

  if (error) {
    return (
      <Layout>
        <div className="khabar-container py-8 md:py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </Layout>
    );
  }

  if (!data && !isLoading) {
    return (
      <Layout>
        <div className="khabar-container py-8 md:py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Category not found</h1>
          <p className="text-muted-foreground">
            The category "{category}" doesn't exist.
          </p>
        </div>
      </Layout>
    );
  }

  const capitalizedCategory = (category || "")
    .split(/[- ]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  const pageTitle = `${capitalizedCategory} News & Updates`;
  const pageDescription = `Stay updated with the latest ${category} news, trends, and impactful changes shaping our world every day.`;

  return (
    <Layout title={pageTitle} description={pageDescription} path={`category/${category}`}>
      <div className="khabar-container py-8 md:py-12">
        {!isLoading ? (
          <>
            {/* Category header */}
            <div className="mb-12 text-center max-w-3xl mx-auto">
              <h1 className="mb-4 capitalize">{category}</h1>
              <p className="text-muted-foreground text-lg">
                {`Stay updated with the latest ${category} news, trends, and impactful changes shaping our world every day.`}
              </p>
            </div>

            {/* Filter bar */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSortBy("recent")}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors cursor-pointer ${sortBy === "recent"
                      ? "bg-foreground text-background"
                      : "bg-transparent"
                    }`}
                >
                  Most Recent
                </button>
                {/* <button
                  onClick={() => setSortBy("popular")}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors cursor-pointer ${
                    sortBy === "popular"
                      ? "bg-foreground text-background"
                      : "bg-transparent"
                  }`}
                >
                  Most Popular
                </button> */}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {blogs.length} articles
                </span>
                {/* <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-transparent transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                </button> */}
              </div>
            </div>

            {/* Expandable filters */}
            {showFilters && (
              <div className="mb-8 p-4 bg-muted/50 rounded-lg animate-fade-in">
                <div className="flex items-center mb-2">
                  <Filter className="h-4 w-4 mr-2" />
                  <h3 className="text-sm font-medium">Advanced Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Date Range
                    </label>
                    <select className="w-full mt-1 p-2 rounded-md border text-sm">
                      <option value="all">All Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Author
                    </label>
                    <select className="w-full mt-1 p-2 rounded-md border text-sm">
                      <option value="all">All Authors</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button className="w-full p-2 bg-foreground text-background rounded-md text-sm">
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {blogs.map((post: any, index: number) => (
                <BlogCard key={post._id || index} blog={post} />
              ))}
            </div>

            {/* Load More Button */}
            {!isReachingEnd && (
              <div className="flex justify-center mt-8 mb-12">
                <button
                  onClick={() => setSize(size + 1)}
                  disabled={isLoadingMore}
                  className="flex items-center gap-2 px-8 py-3 bg-foreground text-background rounded-full font-medium transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100 cursor-pointer shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <span>Load More Articles</span>
                  )}
                </button>
              </div>
            )}

            {/* Disclaimer Banner */}
            <CategoryDisclaimer category={category!} />

            {isReachingEnd && !isEmpty && blogs.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground italic">You've reached the end of the collection.</p>
              </div>
            )}
          </>
        ) : (
          <Skeleton type="category-page" />
        )}
      </div>
    </Layout>
  );
};

export default Category;
