import React, { FC } from "react";
import Layout from "@/components/Layout";
import { cookiepolicy } from "@/assets/static";
import { ContentComponent } from "@/components/ContentComponent";

const CookiePolicy: FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Cookie Policy - The Khabar Express",
    description:
      "Read the Cookie Policy for The Khabar Express and learn how cookies, analytics, translation, and advertising-related technologies are used on the website.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.thekhabarexpress.com"}/cookie-policy`,
  };

  return (
    <Layout
      title="Cookie Policy | The Khabar Express"
      path="cookie-policy"
      description="Read our Cookie Policy to learn how The Khabar Express uses cookies and similar technologies to improve your user experience and deliver relevant content."
      jsonLd={jsonLd}
    >
      <ContentComponent contents={cookiepolicy} />
    </Layout>
  );
};

export default CookiePolicy;
