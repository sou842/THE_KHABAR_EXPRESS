import React from "react";
import { ArrowRight } from "lucide-react";
import BlogCard from "./BlogCard";
import Link from "next/link";
import { Skeleton } from "./Skeleton";

interface CategorySectionProps {
  title: string;
  slug: string;
  posts: any[];
  variant?: "default" | "featured" | "compact";
  loading?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  title,
  slug,
  posts,
  loading,
  variant = "default",
}) => {
  return (
    <section className="py-12">
      <div className="khabar-container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font- capitalize">{title}</h2>
          <Link
            aria-label="View All"
            href={`/category/${slug}`}
            className="flex items-center text-sm font-medium text-khabar-700 hover:text-gray-800 transition-colors"
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {!loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts &&
              posts?.map((post: any, index: number) => (
                <BlogCard
                  key={index}
                  variant={variant}
                  blog={{ ...post, categorySlug: slug }}
                />
              ))}
          </div>
        ) : (
          <Skeleton repeat={4} type={`category-${variant}-skeleton`} />
        )}
      </div>
    </section>
  );
};

export default CategorySection;
