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
      title={"Cookie Policy"}
      path={"cookie-policy"}
      description={
        "Read the Cookie Policy for The Khabar Express and learn how cookies, analytics, translation, and advertising-related technologies are used on the website."
      }
      jsonLd={jsonLd}
    >
      <ContentComponent contents={cookiepolicy} />
    </Layout>
  );
};

export default CookiePolicy;
