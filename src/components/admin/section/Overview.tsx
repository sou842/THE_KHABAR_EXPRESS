import React from 'react'
import useSWR from 'swr';
import AsyncSelect from 'react-select/async';

import Error from '@/components/Error';
import Loading from '@/components/ui/loading';
import { getter, putter } from '@/lib/helper';
import { Button } from '@/components/ui/button';
import BlogCard from '@/components/BlogCard';
import { toast } from 'sonner';
import Link from 'next/link';
import DateTimeDisplay from '@/components/DateTimeDisplay';
import Label from '@/components/Label';
import { Clock, Users, FileText, Eye, Trash2, Sparkles, TrendingUp } from 'lucide-react';


type BlogOption = {
    label: string;
    value: string;
    blog: any; // Blog type can be more specific
};

const fetchBlogs = async (inputValue: string): Promise<BlogOption[]> => {
    const res = await fetch(`/api/blogs?limit=5&search=${inputValue}`);
    const result = await res.json();
    return result.data.map((blog: any) => ({
        label: blog.title,
        value: blog._id,
        blog,
    }));
};

const loadOptions = (inputValue: string, callback: (options: BlogOption[]) => void) => {
    fetchBlogs(inputValue).then(callback);
};

const Overview: React.FC = () => {
    const { data, error, isLoading } = useSWR('/api/dashboard/admin', getter);
    const { data: trendingPost, isLoading: loading,mutate } = useSWR<any>(
        `/api/blogs?status=approved&trending=true`,
        getter
    );
    const [selectedBlog, setSelectedBlog] = React.useState< BlogOption | any | null>(null);

    if (isLoading) {
        return <Loading />
    }
    if (error) {
        return <Error />
    }
    const record = data?.data;

    const handleSetTrending = async (id: string | any, value: boolean) => {
        try {
            await putter(`/api/blogs/${id}`, { isTrending: value });
            toast.success('Trending section updated successfully!');
            mutate();
            if (selectedBlog) {
                setSelectedBlog(null);
            }
        } catch (error: any | { message: string }) {
            toast.error(error?.message)
            console.error(error);

        }
    }

    return (
        <div className="space-y-6 pb-12">
            <h2 className="text-2xl font-medium">Admin Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Pending Approvals
                        </h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight text-foreground">
                            {record?.totalPendingBlogs || 0}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                            blogs
                        </span>
                    </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" /> Active Editors
                        </h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight text-foreground">
                            {record?.totalEditors || 0}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                            editors
                        </span>
                    </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Total Blogs
                        </h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight text-foreground">
                            {record?.totalBlogs || 0}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                            published
                        </span>
                    </div>
                </div>

                <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Eye className="w-4 h-4" /> Total Views
                        </h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight text-foreground">
                            {record?.totalViews || 0}
                        </span>
                    </div>
                </div>
            </div>

            {/* ---Set Trending blog---  */}
            <div className="border-t border-border mt-8 pt-8" />
            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-foreground flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> Set Trending Blog
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Search and select a published blog to feature it on the landing page.</p>
                <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={loadOptions}
                    onChange={(option) => setSelectedBlog(option?.blog)}
                    placeholder="Search blog..."
                    isClearable
                    className="max-w-md"
                />
            </div>

            {selectedBlog && (
                <>
                    <div className='max-w-full justify-around flex flex-col md:flex-row border border-border rounded-xl overflow-hidden shadow-sm'>
                        <div className="md:w-2/3">
                            <BlogCard blog={selectedBlog} variant='hero-section' />
                        </div>

                        <div className="md:w-1/3 min-h-full p-6 flex flex-col justify-center border-l border-border bg-muted/30">
                            <h4 className="text-xl font-semibold text-foreground mb-4">{selectedBlog.title}</h4>
                            <div className="space-y-2 mb-6">
                                <p className="text-muted-foreground text-sm">
                                    <span className="font-medium text-foreground">Author:</span> {selectedBlog.author}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    <span className="font-medium text-foreground">Category:</span> {selectedBlog.category}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    <span className="font-medium text-foreground">Views:</span> {selectedBlog.views}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    <span className="font-medium text-foreground">Language:</span> {selectedBlog.language}
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    <span className="font-medium text-foreground">Date:</span> {new Date(selectedBlog.createdAt).toDateString()}
                                </p>
                            </div>
                            <Button className='w-full' onClick={() => handleSetTrending(selectedBlog?._id, true)}>
                                Set as Trending
                            </Button>
                        </div>
                    </div>
                </>
            )}

            <div className="border-t border-border mt-10 pt-8" />
            <h3 className="text-xl font-semibold mb-6 text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> Currently On Trending
            </h3>
            <div>
                {trendingPost && trendingPost?.data?.map((post: any, index: number) => (
                    <div
                        key={index}
                        className="p-4 border border-transparent rounded-lg hover:border-border hover:bg-muted/30 transition-all mb-2"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="relative flex-shrink-0 w-24 h-24 rounded-md overflow-hidden bg-muted">
                                <img
                                    src={post?.thumbnail?.image || "invalid.jpg"} //to trigger onError func
                                    alt={post?.thumbnail?.title}
                                    onError={(e) => {
                                        e.currentTarget.src = post.thumbnail?.image;
                                        e.currentTarget.onerror = null;
                                    }}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link href={`/blog/${post?.url}`}>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                            Trending
                                        </div>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                            <DateTimeDisplay type='auto-advanced'>{post?.createdAt}</DateTimeDisplay>
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-foreground mb-1 leading-snug hover:text-primary transition-colors">
                                        {post?.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                                        {post?.excerpt}
                                    </p>
                                </Link>
                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm font-medium text-foreground capitalize">
                                            By {post?.author}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            <Label category={post?.category}>{post?.category}</Label>
                                        </span>
                                    </div>
                                    <div className="flex space-x-2">

                                        <button
                                            onClick={() => handleSetTrending(post?._id, false)}
                                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors font-medium border border-transparent hover:border-destructive/20"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}

export default Overview;