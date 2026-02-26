import React from "react";
import useSWR from "swr";

import BlogCard from "./BlogCard";
import Loading from "./ui/loading";
import { Skeleton } from "./Skeleton";
import { getter } from "@/lib/helper";

interface HeroSectionProps {
  variant?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  variant = "compact",
}) => {
  const preventRerendering = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  };
  const { data: recentPosts, isLoading: loading } = useSWR<any>(
    `/api/blogs?limit=5&status=approved`,
    getter,
    preventRerendering
  );
  const { data: featuredPost, isLoading: featuredPostloading } = useSWR<any>(
    `/api/blogs?limit=1&status=approved&trending=true`,
    getter,
    preventRerendering
  );

  return (
    <section className="py-8 md:py-12">
      <div className="khabar-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Featured post */}
          <div className="lg:col-span-7 xl:col-span-8">
            {featuredPostloading ? <Loading /> : <BlogCard blog={featuredPost?.data?.[0]} variant="hero-section" />}
          </div>

          {/* Recent posts */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="mb-4">
              <h2 className="text-lg font-medium">Recent Stories</h2>
            </div>
            {!loading ? (
              <div className="space-y-4">
                {recentPosts && recentPosts?.data?.map((post: any, index: number) => (
                  <BlogCard key={index} blog={post} variant={"compact"} />
                ))}
              </div>
            ) : (
              <Skeleton repeat={5} type={`category-${variant}-skeleton`} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
