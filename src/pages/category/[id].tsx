import { FC, useState } from "react";
import { GetServerSideProps } from "next";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { getter } from "@/lib/helper";
import useSWR from "swr";
import { useParams } from "next/navigation";

const Category: FC = () => {
  const params = useParams<{ id: string }>();
  const category = params?.id;
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");
  const [showFilters, setShowFilters] = useState(false);
  const { data, isLoading, error } = useSWR(
    `/api/blogs?category=${params?.id}&status=approved`,
    getter
  );

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

  return (
    <Layout title={category} path={`category/${category}`}>
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
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors cursor-pointer ${
                    sortBy === "recent"
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
                  Showing {data?.data?.length || 0} articles
                </span>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-transparent transition-colors"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>Filters</span>
                </button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {data?.data?.map((post: any, index: number) => (
                <BlogCard key={index} blog={post} />
              ))}
            </div>
          </>
        ) : (
          <Skeleton type="category-page" />
        )}
      </div>
    </Layout>
  );
};

export default Category;
