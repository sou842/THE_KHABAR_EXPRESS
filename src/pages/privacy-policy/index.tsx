import React, { FC } from "react";
import Layout from "@/components/Layout";
import { privacypolicy } from "@/assets/static";
import { ContentComponent } from "@/components/ContentComponent";

const PrivacyPolicy: FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - The Khabar Express",
    "description": "Read the Privacy Policy of The Khabar Express. Learn how we collect, use, and protect your personal information in compliance with GDPR and CCPA.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.thekhabarexpress.com"}/privacy-policy`
  };

  return (
    <Layout 
      title="Privacy Policy | The Khabar Express" 
      path="privacy-policy"
      description="Read the Privacy Policy of The Khabar Express. Learn how we collect, use, and protect your personal information in compliance with privacy regulations."
      jsonLd={jsonLd}
    >
      <ContentComponent contents={privacypolicy} />
    </Layout>
  );
};

export default PrivacyPolicy;
