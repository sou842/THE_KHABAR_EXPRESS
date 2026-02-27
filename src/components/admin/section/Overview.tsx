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
                <div className="group bg-card border border-border/80 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all hover:-translate-y-1 duration-300">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                            Pending Approvals
                        </h3>
                        <div className="bg-primary/10 text-primary p-2.5 rounded-xl transition-colors group-hover:bg-primary/20">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold tracking-tight text-foreground">
                            {record?.totalPendingBlogs || 0}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                            blogs
                        </span>
                    </div>
                </div>

                <div className="group bg-card border border-border/80 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all hover:-translate-y-1 duration-300">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                            Active Editors
                        </h3>
                        <div className="bg-blue-500/10 text-blue-500 p-2.5 rounded-xl transition-colors group-hover:bg-blue-500/20">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold tracking-tight text-foreground">
                            {record?.totalEditors || 0}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                            editors
                        </span>
                    </div>
                </div>

                <div className="group bg-card border border-border/80 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all hover:-translate-y-1 duration-300">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                            Total Blogs
                        </h3>
                        <div className="bg-green-500/10 text-green-600 p-2.5 rounded-xl transition-colors group-hover:bg-green-500/20">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold tracking-tight text-foreground">
                            {record?.totalBlogs || 0}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                            published
                        </span>
                    </div>
                </div>

                <div className="group bg-card border border-border/80 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all hover:-translate-y-1 duration-300">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
                            Total Views
                        </h3>
                        <div className="bg-purple-500/10 text-purple-500 p-2.5 rounded-xl transition-colors group-hover:bg-purple-500/20">
                            <Eye className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold tracking-tight text-foreground">
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
                    <div className='max-w-full justify-around flex flex-col md:flex-row border border-border/80 bg-card rounded-2xl overflow-hidden shadow-sm'>
                        <div className="md:w-2/3 p-6 md:p-8">
                            <BlogCard blog={selectedBlog} variant='editorPick' />
                        </div>

                        <div className="md:w-1/3 min-h-full p-6 md:p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-border/80 bg-muted/20">
                            <h4 className="text-xl md:text-2xl font-bold text-foreground mb-6 leading-tight">{selectedBlog.title}</h4>
                            <div className="space-y-4 mb-8">
                                <p className="text-sm flex items-center gap-3">
                                    <span className="font-semibold text-foreground w-20">Author:</span> 
                                    <span className="text-muted-foreground">{selectedBlog.author}</span>
                                </p>
                                <p className="text-sm flex items-center gap-3">
                                    <span className="font-semibold text-foreground w-20">Category:</span>
                                    <Label category={selectedBlog.category}>{selectedBlog.category}</Label>
                                </p>
                                <p className="text-sm flex items-center gap-3">
                                    <span className="font-semibold text-foreground w-20">Views:</span> 
                                    <span className="text-muted-foreground">{selectedBlog.views || 0}</span>
                                </p>
                                <p className="text-sm flex items-center gap-3">
                                    <span className="font-semibold text-foreground w-20">Language:</span> 
                                    <span className="text-muted-foreground">{selectedBlog.language || 'English'}</span>
                                </p>
                                <p className="text-sm flex items-center gap-3">
                                    <span className="font-semibold text-foreground w-20">Date:</span> 
                                    <span className="text-muted-foreground">{new Date(selectedBlog.createdAt).toDateString()}</span>
                                </p>
                            </div>
                            <Button size="lg" className='w-full font-semibold rounded-xl' onClick={() => handleSetTrending(selectedBlog?._id, true)}>
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
                        className="p-5 border border-border/60 bg-card rounded-2xl hover:border-gray-300 transition-all duration-300 mb-4 group"
                    >
                        <div className="flex items-start space-x-5">
                            <div className="relative flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-muted group-hover:opacity-90 transition-opacity">
                                <img
                                    src={post?.thumbnail?.image || "invalid.jpg"} //to trigger onError func
                                    alt={post?.thumbnail?.title}
                                    onError={(e) => {
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=900&auto=format&fit=crop";
                                        e.currentTarget.onerror = null;
                                    }}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <Link href={`/blog/${post?.url}`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="text-[10px] px-2.5 py-1 rounded-md bg-primary/10 text-primary font-bold uppercase tracking-wider">
                                            Trending
                                        </div>
                                        <span className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest">
                                            <DateTimeDisplay type='auto-advanced'>{post?.createdAt}</DateTimeDisplay>
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                        {post?.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground/80 mb-4 line-clamp-2 leading-relaxed">
                                        {post?.excerpt || "Dive into this trending piece to learn more about the recent updates and details."}
                                    </p>
                                </Link>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm font-semibold text-foreground capitalize">
                                            By {post?.author}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            <Label category={post?.category}>{post?.category}</Label>
                                        </span>
                                    </div>
                                    <div className="flex space-x-2">

                                        <button
                                            onClick={() => handleSetTrending(post?._id, false)}
                                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md text-destructive bg-destructive/5 hover:bg-destructive/15 transition-colors font-medium"
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