import React from "react";
import { ArrowRight } from "lucide-react";
import BlogCard from "./BlogCard";
import Link from "next/link";
import { Skeleton } from "./Skeleton";
import useSWR from "swr";
import { getter, preventRerendering } from "@/lib/helper";

const TrendingSection: React.FC = () => {
  const { data: trendingPosts, isLoading: loading } = useSWR<any>(
    `/api/blogs?category=finance&limit=4`,
    getter,
    preventRerendering
  );

  return (
    <section className="py-12 bg-secondary/50">
      <div className="khabar-container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-medium">Trending Now</h2>
          <Link
            href="/trending"
            aria-label="View All"
            className="flex items-center text-sm font-medium text-khabar-700 hover:text-khabar-700 transition-colors"
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {!loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingPosts &&
              trendingPosts?.data?.map((post: any, index: number) => (
                <BlogCard key={index} post={post} />
              ))}
          </div>
        ) : (
          <Skeleton repeat={3} type="category-default-skeleton" />
        )}
      </div>
    </section>
  );
};

export default TrendingSection;
