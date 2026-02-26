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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Pending Approvals
                        </h3>
                    </div>
                    <div className="flex items-end">
                        <span className="text-2xl font-medium">
                            {record?.totalPendingBlogs}
                        </span>
                        <span className="ml-1 text-sm text-muted-foreground">
                            blogs
                        </span>
                    </div>
                </div>

                <div className="bg-card p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Active Editors
                        </h3>
                    </div>
                    <div className="flex items-end">
                        <span className="text-2xl font-medium">
                            {record?.totalEditors}

                        </span>
                        <span className="ml-1 text-sm text-muted-foreground">
                            editors
                        </span>
                    </div>
                </div>

                <div className="bg-card p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Total Blogs
                        </h3>
                    </div>
                    <div className="flex items-end">
                        <span className="text-2xl font-medium"> {record?.totalBlogs}</span>
                        <span className="ml-1 text-sm text-muted-foreground">

                            published
                        </span>
                    </div>
                </div>

                <div className="bg-card p-4 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-muted-foreground">
                            Total Views
                        </h3>
                    </div>
                    <div className="flex items-end">
                        <span className="text-2xl font-medium">{record?.totalViews}</span>
                    </div>
                </div>
            </div>

            {/* ---Set Trending blog---  */}
            <hr />
            <h3 className="text-lg font-medium mb-2">Set Trending Blog</h3>
            <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadOptions}
                onChange={(option) => setSelectedBlog(option?.blog)}
                placeholder="Search blog..."
                isClearable
            />

            {selectedBlog && (
                <>
                    <div className='max-w-full justify-around  flex flex-col md:flex-row border overflow-hidden '>
                        <BlogCard blog={selectedBlog} variant='hero-section' />

                        <div className="min-h-full p-4 py-auto border rounded-xl bg-muted">
                            <h4 className="text-xl font-semibold">{selectedBlog.title}</h4>
                            <p className="text-muted-foreground text-sm mt-1">
                                Author: {selectedBlog.author}
                            </p>
                            <p className="text-muted-foreground text-sm mt-1">
                                Category: {selectedBlog.category}
                            </p>
                            <p className="text-muted-foreground text-sm mt-1">
                                Views: {selectedBlog.views}

                            </p>


                            <p className="text-muted-foreground text-sm mt-1">
                                Language: {selectedBlog.language}
                            </p>
                            <p className="text-muted-foreground text-sm mt-1">
                                Date: {new Date(selectedBlog.createdAt).toDateString()}
                            </p>
                            <Button className='item-end my-2' onClick={() => handleSetTrending(selectedBlog?._id, true)}>Set as Trending</Button>
                        </div>
                    </div>


                </>
            )}

            <hr />
            <h3>Currently On Trending</h3>
            <div>
                {trendingPost && trendingPost?.data?.map((post: any, index: number) => (
                    <div
                        key={index}
                        className="p-4 hover:bg-muted/30 transition-colors"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden">
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
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                                            {/* {status} */}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            <DateTimeDisplay type='auto-advanced'>{post?.createdAt}</DateTimeDisplay>
                                        </span>
                                    </div>
                                    <h4 className="text-base font-medium mb-1">
                                        {post?.title}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                        {post?.excerpt}
                                    </p>
                                </Link>
                                <p className='text-sm text-muted-foreground pb-2.5'>{
                                    post?.thumbnail?.description}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-muted-foreground capitalize">
                                            By {post?.author}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            <Label category={post?.category}>{post?.category}</Label>
                                        </span>
                                    </div>
                                    <div className="flex space-x-2">

                                        <button
                                            onClick={() => handleSetTrending(post?._id, false)}
                                            className="flex items-center text-xs px-3 py-1 rounded bg-red-900 text-red-200 hover:bg-red-200 transition-colors"
                                        >
                                            {/* <Trash2 className="h-3 w-3 mr-1" /> */}
                                            Remove Trending
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