import React from 'react'
import { FilePlus } from 'lucide-react';
import { useRouter } from 'next/router';

import BlogSection from '@/components/BlogSection';

const Blogs = () => {
    const router = useRouter();


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-2xl font-bold text-foreground">Blog Management</h2>
                <button
                    onClick={() => router.push('/write')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm"
                >
                    <FilePlus className="h-4 w-4" />
                    <span>New Blog</span>
                </button>
            </div>

            {['pending', 'rejected', 'approved'].map((status) => (
                <BlogSection key={status} status={status} />
            ))}
        </div>
    );

}

export default Blogs
