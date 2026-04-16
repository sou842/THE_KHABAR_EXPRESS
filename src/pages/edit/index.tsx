
import React from 'react';
import Layout from '@/components/Layout';

const Edit: React.FC = () => {
    return (
        <Layout title="Edit Blog - Not Found | The Khabar Express">
        <div className="khabar-container py-12 text-center ">
            <h1 className="text-">Blog not found</h1>
            <p>The Blog you're looking for edit doesn't exist.</p>
        </div>
        </Layout>
    );
};

export default Edit;
