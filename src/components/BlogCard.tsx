import Link from "next/link";
import { getImageUrl, formatDate, formatShortDate } from "@/lib/blogUtils";
import { IBlog } from "@/models/blog.model";
import { motion } from "framer-motion";
import { Eye, ArrowUpRight } from "lucide-react";
import DateTimeDisplay from "@/components/DateTimeDisplay";

interface BlogCardProps {
  blog: IBlog;
  variant?: 
    | "hero" 
    | "topStory" 
    | "trending" 
    | "editorPick" 
    | "mostRead" 
    | "compact" 
    | "horizontal" 
    | "searchItem" 
    | "adminRow"
    | "featured"
    | "default";
  index?: number;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    approved: {
        label: 'Live',
        color: 'text-emerald-700 dark:text-emerald-400',
        bg: 'bg-green-100 dark:bg-green-100 border-green-500 dark:border-green-500',
        dot: 'bg-green-400',
    },
    pending: {
        label: 'Pending',
        color: 'text-orange-700 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-100 border-orange-200/60 dark:border-orange-800/40',
        dot: 'bg-orange-400',
    },
    rejected: {
        label: 'Draft',
        color: 'text-slate-500 dark:text-slate-400',
        bg: 'bg-slate-100 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/40',
        dot: 'bg-slate-400',
    },
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
                  <img 
                    src={getImageUrl(blog)!} 
                    alt={blog.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1624269305548-1527ef905ff6?w=900&auto=format&fit=crop";
                      e.currentTarget.onerror = null;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                )}
              </div>
            </Link>
          </div>
          <div className="lg:col-span-2 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-primary">
                {blog?.category}
              </span>
            </div>
            <Link href={`/blog/${blog?.url}`}>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight hover:text-primary transition-colors line-clamp-3">
                {blog?.title}
              </h1>
            </Link>
            <p className="text-lg text-muted-foreground leading-relaxed line-clamp-3">
              A comprehensive look at why {blog?.category} is shifting paradigms in the modern digital ecosystem.
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-sm">
                <p className="font-semibold text-foreground">{blog?.author}</p>
                <p className="text-muted-foreground">{formatDate(blog?.publishedDate)}</p>
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
                <img 
                  src={getImageUrl(blog)!} 
                  alt={blog.title} 
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1624269305548-1527ef905ff6?w=900&auto=format&fit=crop";
                    e.currentTarget.onerror = null;
                  }}
                />
              )}
            </div>
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase text-primary">{blog?.category}</span>
              <span className="text-xs text-muted-foreground">{index + 1}</span>
            </div>
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {blog?.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-1">Insightful analysis on the recent movements marking a turning point.</p>
          </div>
        </Link>
      );

    case "trending":
      return (
        <Link href={`/blog/${blog?.url}`} className="group block">
          <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {blog?.title}
          </h4>
          <p className="text-xs text-muted-foreground">{formatShortDate(blog?.publishedDate)}</p>
        </Link>
      );

    case "featured":
    case "default":
    case "editorPick":
      return (
        <Link href={`/blog/${blog?.url}`} className="group">
          <div className="bg-muted aspect-video rounded-sm overflow-hidden mb-4 group-hover:opacity-75 transition-opacity relative">
            {getImageUrl(blog) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={getImageUrl(blog)!} 
                alt={blog?.title} 
                className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1624269305548-1527ef905ff6?w=900&auto=format&fit=crop";
                  e.currentTarget.onerror = null;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10" />
            )}
          </div>
          <div className="space-y-2">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary">
              {blog?.category}
            </span>
            <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {blog?.title}
            </h4>

            <div className="space-y-6">
              <p className="text-sm text-muted-foreground line-clamp-1">Explore the latest insights and deep dives.</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">{blog?.author}</span>
                <span className="text-xs font-medium text-muted-foreground">{formatShortDate(blog?.publishedDate)}</span>
              </div>
            </div>
          </div>
        </Link>
      );

    case "mostRead":
      return (
        <Link href={`/blog/${blog?.url}`} className="group flex flex-col h-full">
          <div className="relative mb-4 group-hover:opacity-75 transition-opacity">
            <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg z-10 shadow-md">
              {index + 1}
            </div>
            <div className="bg-muted aspect-video rounded-sm overflow-hidden">
              {getImageUrl(blog) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={getImageUrl(blog)!} 
                  alt={blog?.title} 
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all" 
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1624269305548-1527ef905ff6?w=900&auto=format&fit=crop";
                    e.currentTarget.onerror = null;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-secondary/20 to-primary/20" />
              )}
            </div>
          </div>
          <div className="flex-grow flex flex-col">
            <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {blog?.title}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">A deep dive into why {blog?.category} is shifting paradigms.</p>
            <div className="pt-4 border-t border-border mt-4">
              <p className="text-xs text-muted-foreground">{formatDate(blog?.publishedDate)}</p>
            </div>
          </div>
        </Link>
      );

    case "compact":
      return (
        <Link href={`/blog/${blog?.url}`} className="group block p-4 border border-border rounded-sm hover:bg-muted hover:border-primary/50 transition-all">
          <div className="space-y-2">
            <span className="inline-block text-xs font-bold uppercase text-primary tracking-wider">
              {blog?.category}
            </span>
            <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {blog?.title}
            </h4>
            <p className="text-xs text-muted-foreground">{formatDate(blog?.publishedDate)}</p>
          </div>
        </Link>
      );

    case "horizontal":
      return (
        <Link href={`/blog/${blog?.url}`} className="group block p-4 border border-border rounded-sm hover:bg-background hover:border-primary/50 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block text-xs font-bold uppercase text-primary tracking-wider">
                  {blog?.category}
                </span>
                <span className="text-xs text-muted-foreground">&bull;</span>
                <span className="text-xs text-muted-foreground">{formatDate(blog?.publishedDate)}</span>
              </div>
              <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {blog?.title}
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

      case "searchItem":
        return (
          <div className="group block p-5 border border-border/60 rounded-lg hover:border-primary/50 hover:shadow-sm hover:bg-muted/30 transition-all bg-background">
            <div className="flex flex-col gap-2.5">
              <span className="inline-block text-[11px] font-bold uppercase tracking-[0.15em] text-foreground">
                {blog?.category}
              </span>
              <h4 className="text-xl md:text-[22px] leading-tight font-extrabold text-foreground group-hover:text-primary transition-colors font-sans tracking-tight">
                {blog?.title || blog?.thumbnail?.title}
              </h4>
              <p className="text-[13px] text-muted-foreground/80 font-medium">
                {formatDate(blog?.publishedDate || (blog as any)?.createdAt)}
              </p>
            </div>
          </div>
        );

      case "adminRow":
        {
          const status = statusConfig[blog.status as unknown as string] ?? statusConfig.rejected;
          return (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.035, duration: 0.25, ease: 'easeOut' }}
              className="group relative flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-muted/40 transition-colors duration-150 cursor-default"
            >
              {/* Left accent line on hover */}
              <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center" />

              {/* Thumbnail */}
              <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border/30 bg-muted shadow-sm">
                <img
                  src={blog.thumbnail?.image || 'invalid.jpg'}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200';
                    e.currentTarget.onerror = null;
                  }}
                />
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                {blog.category && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary/70 mb-0.5">
                    {blog.category}
                  </span>
                )}
                <h4 className="font-semibold text-[13.5px] text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors duration-150">
                  {blog.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-[9px] font-bold text-primary uppercase">
                      {blog.author?.[0] ?? '?'}
                    </div>
                    <span className="text-[11px] text-muted-foreground/60 font-medium">{blog.author}</span>
                  </div>
                  <span className="text-muted-foreground/20 text-[10px]">·</span>
                  <span className="text-[11px] text-muted-foreground/40">
                    <DateTimeDisplay type="auto-advanced">{blog.createdAt ? new Date(blog.createdAt).toISOString() : ""}</DateTimeDisplay>
                  </span>
                </div>
              </div>

              {/* Right: views + status + action */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:flex flex-col items-end gap-0.5">
                  <span className="text-sm font-bold tabular-nums text-foreground/70">
                    {(blog.views || 0).toLocaleString()}
                  </span>
                  <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/35 flex items-center gap-0.5">
                    <Eye className="w-2.5 h-2.5" strokeWidth={1.5} /> views
                  </span>
                </div>

                <div className="hidden sm:block h-6 w-px bg-border/30" />

                <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>

                <Link href={`/blog/${blog.url}`}>
                  <button className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-primary/8 hover:bg-primary hover:text-white text-primary flex items-center justify-center transition-all duration-150">
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </Link>
              </div>
            </motion.div>
          );
        }

    default:
      return null;
  }
}