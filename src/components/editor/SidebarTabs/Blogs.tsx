import React, { useState, useEffect } from "react";
import { Edit2, Eye, Plus, Search, X, Trash2, FileText, ArrowRight, Activity, Layers } from "lucide-react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import useSWR from "swr";
import { getter } from "@/lib/helper";
import { toast } from "sonner";
import DateTimeDisplay from "@/components/DateTimeDisplay";
import { Skeleton } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Use same config as Overview
const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    approved: {
        label: 'Live',
        color: 'text-green-700 dark:text-green-400',
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

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const HR = () => <div className="h-px bg-border/40 w-full" />;

// Modified BlogRow for Editor
const BlogRow = ({ blog, index, onAction }: { blog: any; index: number; onAction: (id: string, action: string) => void }) => {
    const status = statusConfig[blog.status] ?? statusConfig.rejected;

    return (
        <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.035, duration: 0.25, ease: 'easeOut' }}
            className="group relative flex flex-col md:flex-row md:items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors duration-150 cursor-default"
        >
            {/* Left accent line on hover */}
            <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center hidden md:block" />

            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Thumbnail */}
                <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 border border-border/30 bg-muted shadow-sm">
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
                    <div className="flex items-center gap-2 mb-1">
                        {blog.category && (
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary/70">
                                {blog.category}
                            </span>
                        )}
                        <span className="text-muted-foreground/30 text-[10px]">•</span>
                        <span className="text-[11px] text-muted-foreground/50">
                            <DateTimeDisplay type="auto-advanced">{blog.createdAt}</DateTimeDisplay>
                        </span>
                    </div>
                    
                    <h4 className="font-semibold text-[14px] md:text-[15px] text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors duration-150 pr-4">
                        {blog.title}
                    </h4>
                    
                </div>
            </div>

            {/* Right: views + status + action */}
            <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 mt-3 md:mt-0 pt-3 md:pt-0 border-t md:border-none border-border/30">
                <div className="flex items-center gap-4 md:gap-5 mr-auto md:mr-0">
                    <div className="flex flex-col items-start md:items-end gap-0.5 min-w-[60px]">
                        <span className="text-sm font-bold tabular-nums text-foreground/80">
                            {(blog.views || 0).toLocaleString()}
                        </span>
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/45 flex items-center gap-0.5">
                            <Eye className="w-2.5 h-2.5" strokeWidth={2} /> views
                        </span>
                    </div>

                    <div className="h-8 w-px bg-border/30 hidden md:block" />

                    <div className="min-w-[80px] flex md:justify-center">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                        </span>
                    </div>
                </div>

                <div className="hidden md:block h-8 w-px bg-border/30 ml-2" />

                <div className="flex items-center justify-end gap-1 min-w-[100px]">
                    <button 
                        onClick={() => onAction(blog.url, 'view')}
                        className="w-9 h-9 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted flex items-center justify-center transition-all"
                        title="View"
                    >
                        <Eye className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button 
                        onClick={() => onAction(blog.url, 'edit')}
                        className="w-9 h-9 rounded-lg text-muted-foreground/60 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-all"
                        title="Edit"
                    >
                        <Edit2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                    <button 
                        onClick={() => onAction(blog._id, 'delete')}
                        className="w-9 h-9 rounded-lg text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-all"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};


const Blogs = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [activeTab, setActiveTab] = useState('pending');

  const tabs = [
      { id: 'approved', label: 'Live' },
      { id: 'pending', label: 'Pending Review' },
      { id: 'rejected', label: 'Drafts' },
  ];

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, activeTab]);

  let url = `/api/blogs?authorId=${user?.id}&limit=10&page=${currentPage}`;
  if (debouncedSearchTerm) url += `&search=${encodeURIComponent(debouncedSearchTerm)}`;
  if (activeTab !== 'all') url += `&status=${activeTab}`;

  const { data, isLoading, mutate } = useSWR(url, getter);

  const handleDeletePost = async (postId: string) => {
    try {
      await fetch(`/api/blogs/${postId}`, { method: 'DELETE' });
      toast.success("Post deleted successfully");
      mutate();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handlePostAction = async (id: string, action: string) => {
    try {
      switch (action) {
        case "edit":
          router.push(`/edit/${id}`);
          break;
        case "delete":
          handleDeletePost(id);
          break;
        case "view":
          router.push(`/blog/${id}`);
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action} post`);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* ── Page Header & Controls ─────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
            <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">
                    Content Management
                </span>
            </div>
            <h1 className="text-[22px] font-bold tracking-tight">My Blogs</h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none" strokeWidth={2} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-[260px] pl-9 pr-8 h-10 rounded-lg border border-border/50 bg-background hover:border-border/80 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-sm transition-all duration-200 shadow-sm"
              placeholder="Search articles..."
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            )}
          </div>

          <button
            onClick={() => router.push("/write")}
            className="flex items-center justify-center gap-2 px-5 h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New Blog
          </button>
        </div>
      </div>

      {/* ── Main Content Area ─────────────────────────────────── */}
      <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
        
        {/* Custom Tab Bar */}
        <div className="px-2 pt-2 pb-0 bg-muted/10">
            <div className="flex overflow-x-auto pb-2 sm:pb-0 scrollbar-hide border-b border-border/30">
                <div className="flex space-x-1 px-3">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                                    isActive ? 'text-primary' : 'text-muted-foreground/60 hover:text-foreground/80'
                                }`}
                            >
                                {tab.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* Tab Content Header */}
        <div className="hidden md:flex items-center gap-4 px-5 py-3 border-b border-border/25 bg-muted/20">
            <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                Article Details
            </span>
            <div className="flex items-center justify-end gap-5 shrink-0 pr-2 min-w-[316px]">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 w-[60px] text-right">
                    Views
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 w-[80px] text-center">
                    Status
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 w-[100px] text-center ml-2">
                    Actions
                </span>
            </div>
        </div>

        {/* List Body */}
        <div className="py-2">
            {!isLoading ? (
                data?.data?.length > 0 ? (
                    <AnimatePresence>
                        {data.data.map((post: any, index: number) => (
                            <div key={post._id}>
                                <BlogRow blog={post} index={index} onAction={handlePostAction} />
                                {index < data.data.length - 1 && <HR />}
                            </div>
                        ))}
                    </AnimatePresence>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/25 flex items-center justify-center mb-4">
                            <Layers className="w-7 h-7 text-muted-foreground/30" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-1">
                            {searchTerm ? 'No results found' : 'No articles yet'}
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            {searchTerm 
                                ? `We couldn't find any blogs matching "${searchTerm}". Try tweaking your search.`
                                : activeTab === 'all' 
                                    ? "You haven't published any blogs yet. Start writing your first masterpiece!"
                                    : `There are currently no blogs in the ${tabs.find(t=>t.id === activeTab)?.label.toLowerCase()} folder.`}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="mt-4 text-primary font-medium text-sm hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )
            ) : (
                <div className="py-6 px-5 space-y-4">
                    <Skeleton repeat={5} type="category-compact-skeleton" />
                </div>
            )}
        </div>
      </div>

      {/* Pagination */}
      {data?.pagination?.pages > 1 && (
        <div className="pt-4 flex justify-center">
            <Pagination
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                totalPages={data?.pagination?.pages || 1}
            />
        </div>
      )}
    </div>
  );
};

export default Blogs;