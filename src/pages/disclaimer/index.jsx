import Layout from "@/components/Layout";
import { disclaimerpolicy } from "@/assets/static";
import { ContentComponent } from "@/components/ContentComponent";

export default function DisclaimerPage() {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Disclaimer - The Khabar Express",
        "description": "Read the Disclaimer for The Khabar Express. Understand the limitations of our content, professional advice warnings, and third-party link policies.",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.thekhabarexpress.com"}/disclaimer`
    };

    return (
        <Layout 
            title="General Disclaimer | The Khabar Express" 
            path="disclaimer"
            description="Read the general disclaimer for The Khabar Express. Learn about the limitations of our content, professional advice warnings, and our policies on third-party links."
            jsonLd={jsonLd}
        >
            <ContentComponent contents={disclaimerpolicy} />
        </Layout>
    );
}
