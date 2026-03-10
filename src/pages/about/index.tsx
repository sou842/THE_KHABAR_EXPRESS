import { ContentComponent } from "@/components/ContentComponent";
import Layout from "@/components/Layout";
import { FC } from "react";
import Head from "next/head";
import { aboutpolicy } from "@/assets/static/index";
import { SOCIAL_LINKS } from "@/lib/constants";

const About: FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About The Khabar Express",
    "description": "Learn more about The Khabar Express, our mission, editorial approach, and how we deliver fast, accurate news across Technology, Health, Finance, and more.",
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.thekhabarexpress.com"}/about`,
    "mainEntity": {
      "@type": "NewsMediaOrganization",
      "name": "The Khabar Express",
      "url": process.env.NEXT_PUBLIC_SITE_URL || "https://www.thekhabarexpress.com",
      "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.thekhabarexpress.com"}/logo.png`,
      "description": "The Khabar Express is a digital-first news platform committed to delivering fast, accurate, and insightful stories across Technology, Health, Finance, Politics, Sports, and Entertainment.",
      "sameAs": SOCIAL_LINKS?.map(link => link.href)
    }
  };

  return (
    <Layout 
      title="About Us | The Khabar Express" 
      description="Learn more about The Khabar Express, our mission, editorial approach, and how we deliver fast, accurate news across Technology, Health, Finance, and more."
      path="about"
      jsonLd={jsonLd}
    >
      <ContentComponent contents={aboutpolicy} />
    </Layout>
  );
};

export default About;
