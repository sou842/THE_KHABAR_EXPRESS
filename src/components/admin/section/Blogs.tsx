import React from 'react'
import { FilePlus } from 'lucide-react';
import { useRouter } from 'next/router';

import BlogSection from '@/components/BlogSection';

const Blogs = () => {
    const router = useRouter();


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-medium">Blog Management</h2>
                <button
                    onClick={() => router.push('/write')}
                    className="flex items-center gap-1 px-4 py-2 bg-khabar-500 text-white rounded-md hover:bg-khabar-700 transition-colors"
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
