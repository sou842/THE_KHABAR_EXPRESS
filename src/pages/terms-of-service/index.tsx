import React, { FC } from "react";
import Layout from "@/components/Layout";
import { termsofservice } from "@/assets/static";
import { ContentComponent } from "@/components/ContentComponent";

const TermsOfService: FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service - The Khabar Express",
    "description": "Read the Terms of Service for The Khabar Express. Understand the rules, guidelines, and legal terms governing your use of our news platform.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.thekhabarexpress.com"}/terms-of-service`
  };

  return (
    <Layout 
      title={"Terms of Service"} 
      path={"terms-of-service"}
      description={"Read the Terms of Service for The Khabar Express. Understand the rules, guidelines, and legal terms governing your use of our news platform."}
      jsonLd={jsonLd}
    >
      <ContentComponent contents={termsofservice} />
    </Layout>
  );
};

export default TermsOfService;
