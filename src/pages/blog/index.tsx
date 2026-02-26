
import React from 'react';
import Layout from '@/components/Layout';

const Blog: React.FC = () => {
    return (
        <Layout>
        <div className="khabar-container py-12 text-center ">
            <h1 className="text-">Blog not found</h1>
            <p>The Blog you're looking for doesn't exist.</p>
        </div>
        </Layout>
    );
};

export default Blog;
