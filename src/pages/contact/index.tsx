import React from "react";
import Head from "next/head";
import Layout from "@/components/Layout";

export default function ContactUs() {
  return (
    <Layout title="Contact Us" path="contact">
      <section className="min-h-screen  py-12 px-4">
        <div className="max-w-3xl mx-auto rounded-2xl p-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
            Contact Us
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Have a query or feedback? Feel free to reach out. You can also email
            us directly at
            <a
              href="mailto:thekhabarexpressnews@gmail.com"
              className="text-khabar-600 font-medium hover:underline ml-1"
            >
              thekhabarexpressnews@gmail.com
            </a>
            .
          </p>
        </div>
      </section>
    </Layout>
  );
}
