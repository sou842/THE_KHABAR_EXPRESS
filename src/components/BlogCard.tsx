import Link from "next/link";
import { IBlog } from "@/models/blog.model";

interface BlogCardProps {
  blog: IBlog;
  variant?: any;
  index?: number;
}

export const getImageUrl = (blog: IBlog) => {
  const category = blog?.category?.toLowerCase();
  switch (category) {
    case "technology":
      return "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900&auto=format&fit=crop";
    case "health":
      return "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop";
    case "finance":
      return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop";
    case "politics":
      return "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop";
    case "sports":
      return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop";
    case "travel":
      return "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=900&auto=format&fit=crop";
    case "food":
      return "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=900&auto=format&fit=crop";
    default:
      if (blog?.thumbnail?.url) return blog.thumbnail.url;
  }
};

export const formatDate = (dateString?: Date | string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatShortDate = (dateString?: Date | string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export default function BlogCard({ blog, variant = "editorPick", index = 0 }: BlogCardProps) {
  if (!blog) return null;

  switch (variant) {
    case "hero":
      return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-3">
            <Link href={`/blog/${blog.url}`} className="group block">
              <div className="bg-muted aspect-video rounded-sm overflow-hidden group-hover:opacity-75 transition-opacity relative">
                {getImageUrl(blog) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={getImageUrl(blog)!} alt={blog.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                )}
              </div>
            </Link>
          </div>
          <div className="lg:col-span-2 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {blog.category}
              </span>
            </div>
            <Link href={`/blog/${blog.url}`}>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight hover:text-primary transition-colors line-clamp-3">
                {blog.title}
              </h1>
            </Link>
            <p className="text-lg text-muted-foreground leading-relaxed line-clamp-3">
              A comprehensive look at why {blog.category} is shifting paradigms in the modern digital ecosystem.
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-sm">
                <p className="font-semibold text-foreground">{blog.author}</p>
                <p className="text-muted-foreground">{formatDate(blog.publishedDate)}</p>
              </div>
              <Link href={`/blog/${blog.url}`} className="text-primary hover:text-primary/80 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      );

    case "topStory":
      return (
        <Link href={`/blog/${blog.url}`} className="group flex gap-6 pb-6 border-b border-border last:border-0 hover:opacity-75 transition-opacity">
          <div className="hidden sm:block flex-shrink-0 w-24 md:w-32">
            <div className="w-full aspect-square bg-muted rounded-sm overflow-hidden">
              {getImageUrl(blog) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getImageUrl(blog)!} alt={blog.title} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
              )}
            </div>
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase text-primary">{blog.category}</span>
              <span className="text-xs text-muted-foreground">{index + 1}</span>
            </div>
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {blog.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-1">Insightful analysis on the recent movements marking a turning point.</p>
          </div>
        </Link>
      );

    case "trending":
      return (
        <Link href={`/blog/${blog.url}`} className="group block">
          <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {blog.title}
          </h4>
          <p className="text-xs text-muted-foreground">{formatShortDate(blog.publishedDate)}</p>
        </Link>
      );

    case "editorPick":
      return (
        <Link href={`/blog/${blog.url}`} className="group">
          <div className="bg-muted aspect-video rounded-sm overflow-hidden mb-4 group-hover:opacity-75 transition-opacity relative">
            {getImageUrl(blog) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getImageUrl(blog)!} alt={blog.title} className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10" />
            )}
          </div>
          <div className="space-y-2">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary">
              {blog.category}
            </span>
            <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {blog.title}
            </h4>

            <div className="space-y-6">
              <p className="text-sm text-muted-foreground line-clamp-1">Explore the latest insights and deep dives.</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">{blog.author}</span>
                <span className="text-xs font-medium text-muted-foreground">{formatShortDate(blog.publishedDate)}</span>
              </div>
            </div>
          </div>
        </Link>
      );

    case "mostRead":
      return (
        <Link href={`/blog/${blog.url}`} className="group flex flex-col h-full">
          <div className="relative mb-4 group-hover:opacity-75 transition-opacity">
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg z-10 shadow-md">
              {index + 1}
            </div>
            <div className="bg-muted aspect-video rounded-sm overflow-hidden">
              {getImageUrl(blog) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getImageUrl(blog)!} alt={blog.title} className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20" />
              )}
            </div>
          </div>
          <div className="flex-grow flex flex-col">
            <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {blog.title}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">A deep dive into why {blog.category} is shifting paradigms.</p>
            <div className="pt-4 border-t border-border mt-4">
              <p className="text-xs text-muted-foreground">{formatDate(blog.publishedDate)}</p>
            </div>
          </div>
        </Link>
      );

    case "compact":
      return (
        <Link href={`/blog/${blog.url}`} className="group block p-4 border border-border rounded-sm hover:bg-muted hover:border-primary/50 transition-all">
          <div className="space-y-2">
            <span className="inline-block text-xs font-bold uppercase text-primary tracking-wider">
              {blog.category}
            </span>
            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {blog.title}
            </h4>
            <p className="text-xs text-muted-foreground">{formatDate(blog.publishedDate)}</p>
          </div>
        </Link>
      );

    case "horizontal":
      return (
        <Link href={`/blog/${blog.url}`} className="group block p-4 border border-border rounded-sm hover:bg-background hover:border-primary/50 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block text-xs font-bold uppercase text-primary tracking-wider">
                  {blog.category}
                </span>
                <span className="text-xs text-muted-foreground">&bull;</span>
                <span className="text-xs text-muted-foreground">{formatDate(blog.publishedDate)}</span>
              </div>
              <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {blog.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-1 mt-1">Insightful analysis on the recent movements marking a turning point.</p>
            </div>
            <div className="flex-shrink-0 pt-2">
              <svg className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      );

    default:
      return null;
  }
}