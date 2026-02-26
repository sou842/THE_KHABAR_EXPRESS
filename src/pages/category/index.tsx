import React, { useState } from "react";
import Layout from "@/components/Layout";

const Category: React.FC = () => {
  return (
    <Layout>
      <div className="khabar-container py-12 text-center ">
        <h1 className="">Category not found</h1>
        <p>The category you're looking for doesn't exist.</p>
      </div>
    </Layout>
  );
};

export default Category;
