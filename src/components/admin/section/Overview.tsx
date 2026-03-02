import React from 'react'
import useSWR from 'swr';
import AsyncSelect from 'react-select/async';
import { motion, AnimatePresence } from 'framer-motion';

import Error from '@/components/Error';
import Loading from '@/components/ui/loading';
import { getter, putter } from '@/lib/helper';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import DateTimeDisplay from '@/components/DateTimeDisplay';
import {
    Clock, FileText, Eye, Trash2, Sparkles, TrendingUp,
    Search, Zap, ArrowUpRight, Activity, Star, BarChart2, Layers
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

type BlogOption = { label: string; value: string; blog: any };

const fetchBlogs = async (inputValue: string): Promise<BlogOption[]> => {
    const res = await fetch(`/api/blogs?limit=5&search=${inputValue}`);
    const result = await res.json();
    return result?.data?.map((blog: any) => ({ label: blog.title, value: blog._id, blog }));
};

const loadOptions = (inputValue: string, callback: (options: BlogOption[]) => void) => {
    fetchBlogs(inputValue).then(callback);
};

const HR = () => <div className="h-px bg-border/40 w-full" />;


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

/* ─── Stat Card ─────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) => (
    <div className="group relative bg-card border border-border/40 rounded-xl p-5 hover:border-border/70 hover:shadow-sm transition-all duration-200 overflow-hidden">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-foreground/8 to-transparent" />
        <div className="flex items-start justify-between mb-4">
            <div className="p-2 rounded-lg bg-muted/60 border border-border/30">
                <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
            </div>
        </div>
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
);

/* ─── Blog Row ───────────────────────────────────────────────────── */
const BlogRow = ({ blog, index }: { blog: any; index: number }) => {
    const status = statusConfig[blog.status] ?? statusConfig.rejected;

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
                        <DateTimeDisplay type="auto-advanced">{blog.createdAt}</DateTimeDisplay>
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
};

/* ─── Trending Row ───────────────────────────────────────────────── */
const TrendingRow = ({ post, onRemove, rank }: { post: any; onRemove: () => void; rank: number }) => (
    <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="group flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/20 transition-colors duration-150"
    >
        <span className="w-4 text-[10px] font-bold text-muted-foreground/25 tabular-nums shrink-0">{rank}</span>

        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-border/20 bg-muted">
            <img
                src={post.thumbnail?.image || 'invalid.jpg'}
                alt=""
                onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=200';
                    e.currentTarget.onerror = null;
                }}
                className="w-full h-full object-cover"
            />
        </div>

        <div className="flex-1 min-w-0">
            <h4 className="font-medium text-[12px] leading-snug line-clamp-1 text-foreground/80">{post.title}</h4>
            <p className="text-[10px] text-muted-foreground/35 mt-0.5 flex items-center gap-1">
                <Eye className="w-2.5 h-2.5" strokeWidth={1.5} /> {(post.views || 0).toLocaleString()}
            </p>
        </div>

        <button
            onClick={onRemove}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/8 text-muted-foreground/30 hover:text-destructive transition-all duration-150 shrink-0"
            title="Remove from spotlight"
        >
            <Trash2 className="w-3 h-3" strokeWidth={1.5} />
        </button>
    </motion.div>
);

/* ─── Main ───────────────────────────────────────────────────────── */
const Overview: React.FC = () => {
    const { data: dashboardData, error: dashboardError, isLoading: dashboardLoading } = useSWR('/api/dashboard/admin', getter);
    const { data: trendingPost, isLoading: trendingLoading, mutate: mutateTrending } = useSWR<any>(
        '/api/blogs?status=approved&trending=true', getter
    );
    const { data: recentBlogs, isLoading: blogsLoading } = useSWR<any>(
        '/api/blogs?limit=10', getter
    );
    const [selectedBlog, setSelectedBlog] = React.useState<any | null>(null);

    const isLoading = dashboardLoading || trendingLoading || blogsLoading;
    if (isLoading) return <div className="flex h-[400px] items-center justify-center"><Loading /></div>;
    if (dashboardError) return <Error />;

    const record = dashboardData?.data;

    const handleSetTrending = async (id: string, value: boolean) => {
        try {
            await putter(`/api/blogs/${id}`, { isTrending: value });
            toast.success(value ? 'Added to spotlight' : 'Removed from spotlight');
            mutateTrending();
            if (value) setSelectedBlog(null);
        } catch (error: any) {
            toast.error(error?.message || 'Update failed');
        }
    };

    return (
        <div className="max-w-[1440px] mx-auto pb-20">

            {/* ── Page Header ──────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">
                            Admin Dashboard
                        </span>
                    </div>
                    <h1 className="text-[22px] font-bold tracking-tight">Overview</h1>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground/50 hidden md:block">
                        <DateTimeDisplay type="auto-advanced">{new Date().toISOString()}</DateTimeDisplay>
                    </span>
                    <div className="h-3.5 w-px bg-border/50 hidden md:block" />
                    <Link
                        href="/admin/blog"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-border/50 bg-background hover:bg-muted/30 text-foreground/60 hover:text-foreground transition-all duration-150 shadow-sm"
                    >
                        <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
                        All Content
                    </Link>
                </div>
            </div>

            {/* ── Stats ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <StatCard label="Total Views" value={(record?.totalViews || 0).toLocaleString()} icon={BarChart2} />
                <StatCard label="Pending Review" value={record?.totalPendingBlogs || 0} icon={Clock} />
                <StatCard label="Published" value={record?.totalBlogs || 0} icon={FileText} />
            </div>

            {/* ── Main Grid ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                {/* ── Blog Feed ──────────────────────────────────────── */}
                <div className="lg:col-span-7 xl:col-span-8 bg-card border border-border/40 rounded-xl overflow-hidden">
                    <Tabs defaultValue="submissions">

                        {/* Tab bar */}
                        <div className="px-5 pt-4 pb-0">
                            <div className="flex items-center justify-between mb-4">
                                <TabsList className="bg-muted/40 rounded-lg p-0.5 h-auto border border-border/30">
                                    <TabsTrigger
                                        value="submissions"
                                        className="rounded-md px-4 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground/60 transition-all"
                                    >
                                        Submissions
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="activity"
                                        className="rounded-md px-4 py-1.5 text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground/60 transition-all"
                                    >
                                        Activity
                                    </TabsTrigger>
                                </TabsList>
                                <span className="text-[11px] text-muted-foreground">
                                    {recentBlogs?.data?.length || 0} results
                                </span>
                            </div>
                        </div>

                        <HR />

                        {/* Submissions tab */}
                        <TabsContent value="submissions" className="m-0">
                            {/* Column headers */}
                            <div className="flex items-center gap-4 px-4 py-2.5 border-b border-border/25 bg-muted/20">
                                <div className="w-12 shrink-0" />
                                <span className="flex-1 text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                                    Article
                                </span>
                                <div className="hidden sm:flex items-center gap-3 shrink-0 pr-1">
                                    <span className="text-xs font-semibold uppercase tracking-normal text-muted-foreground w-14 text-right">
                                        Views
                                    </span>
                                    <div className="w-px h-3 bg-transparent" />
                                    <span className="text-xs font-semibold uppercase tracking-normal text-muted-foreground w-16 text-center">
                                        Status
                                    </span>
                                    <div className="w-8" />
                                </div>
                            </div>

                            <div className="py-1 px-0">
                                <AnimatePresence>
                                    {recentBlogs?.data?.map((blog: any, i: number) => (
                                        <BlogRow key={blog._id} blog={blog} index={i} />
                                    ))}
                                </AnimatePresence>

                                {!recentBlogs?.data?.length && (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <FileText className="w-9 h-9 text-muted-foreground/12 mb-3" strokeWidth={1} />
                                        <p className="text-sm font-medium text-muted-foreground/30">No submissions yet</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Activity tab */}
                        <TabsContent value="activity" className="m-0">
                            <div className="flex flex-col items-center justify-center py-16">
                                <Activity className="w-8 h-8 text-muted-foreground/15 mb-2.5" strokeWidth={1} />
                                <p className="text-sm text-muted-foreground/35">Activity log coming soon</p>
                            </div>
                        </TabsContent>

                    </Tabs>
                </div>

                {/* ── Sidebar ────────────────────────────────────────── */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-4">

                    {/* Spotlight Manager */}
                    <div className="bg-card border border-border/40 rounded-xl overflow-hidden">

                        {/* Header */}
                        <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-semibold">Spotlight</h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Feature articles on the homepage
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-muted/50 border border-border/30">
                                <Star className="w-3.5 h-3.5 text-muted-foreground/40" strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Search */}
                        <div className="px-5 py-4 border-b border-border/20">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" strokeWidth={1.5} />
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={loadOptions}
                                    onChange={(option: any) => setSelectedBlog(option?.blog ?? null)}
                                    placeholder="Search articles..."
                                    isClearable
                                    unstyled
                                    classNames={{
                                        control: () => 'pl-9 pr-3 py-2.5 rounded-lg border border-border/50 bg-muted/20 hover:border-border/70 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/8 text-xs font-medium transition-all duration-200',
                                        placeholder: () => 'text-muted-foreground/35 text-xs',
                                        input: () => 'text-foreground text-xs',
                                        singleValue: () => 'text-foreground text-xs font-medium',
                                        noOptionsMessage: () => 'py-6 text-xs text-muted-foreground/40 text-center',
                                        menu: () => 'mt-2 p-1.5 rounded-xl border border-border/60 bg-card shadow-xl shadow-black/5',
                                        option: ({ isFocused }) => `px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors duration-100 ${isFocused ? 'bg-primary/8 text-primary' : 'text-foreground/80 hover:bg-muted/50'}`,
                                        clearIndicator: () => 'text-muted-foreground/30 hover:text-muted-foreground cursor-pointer p-1 transition-colors',
                                        dropdownIndicator: () => 'hidden',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Selected preview / empty state */}
                        <div className="px-5 py-4">
                            <AnimatePresence mode="wait">
                                {selectedBlog ? (
                                    <motion.div
                                        key="selected"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="space-y-3"
                                    >
                                        <div className="flex gap-3 p-3 rounded-lg bg-muted/30 border border-border/25">
                                            <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 border border-border/20 bg-muted">
                                                <img
                                                    src={selectedBlog.thumbnail?.image || 'invalid.jpg'}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=200';
                                                        e.currentTarget.onerror = null;
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-semibold leading-snug line-clamp-2">{selectedBlog.title}</h4>
                                                {selectedBlog.author && (
                                                    <p className="text-[10px] text-muted-foreground/45 mt-1">{selectedBlog.author}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full gap-2 text-xs font-semibold h-9 rounded-lg transition-all active:scale-[0.99]"
                                            onClick={() => handleSetTrending(selectedBlog._id, true)}
                                        >
                                            <Zap className="w-3.5 h-3.5" strokeWidth={2} /> Add to Spotlight
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-8 flex flex-col items-center justify-center text-center gap-2"
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-muted/50 border border-border/25 flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed max-w-[170px]">
                                            Search for an article above to add it to the spotlight
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Active Spotlight List */}
                    <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-primary/50" strokeWidth={1.5} />
                                <h2 className="text-sm font-semibold">Active Spotlight</h2>
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground/40 bg-muted/50 border border-border/25 px-2 py-1 rounded-md tabular-nums">
                                {trendingPost?.data?.length || 0}
                            </span>
                        </div>

                        <div className="px-3 py-2">
                            <AnimatePresence>
                                {trendingPost?.data?.map((post: any, i: number) => (
                                    <TrendingRow
                                        key={post._id}
                                        post={post}
                                        rank={i + 1}
                                        onRemove={() => handleSetTrending(post._id, false)}
                                    />
                                ))}
                            </AnimatePresence>

                            {!trendingPost?.data?.length && (
                                <div className="py-10 flex flex-col items-center justify-center text-center">
                                    <Sparkles className="w-6 h-6 text-muted-foreground/15 mb-2" strokeWidth={1} />
                                    <p className="text-xs text-muted-foreground/30">No articles in spotlight</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Overview;