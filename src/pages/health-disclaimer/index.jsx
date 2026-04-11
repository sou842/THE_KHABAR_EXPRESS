import Layout from "@/components/Layout";
import { healthdisclaimer } from "@/assets/static";
import { ContentComponent } from "@/components/ContentComponent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thekhabarexpress.com";
const PAGE_PATH = "health-disclaimer";
const PAGE_URL = `${SITE_URL}/${PAGE_PATH}`;

const TITLE = "Health Information Disclaimer | The Khabar Express";
const DESCRIPTION =
  "The Khabar Express provides health news and analysis for informational purposes only. We are not a medical provider. Read our full health disclaimer for more information.";

export default function HealthDisclaimerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${TITLE} - The Khabar Express`,
    description: DESCRIPTION,
    url: PAGE_URL,
    dateModified: "2026-03-11",
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "The Khabar Express",
      url: SITE_URL,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Health Disclaimer",
          item: PAGE_URL,
        },
      ],
    },
    publisher: {
      "@type": "Organization",
      name: "The Khabar Express",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon.ico`,
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: "thekhabarexpressnews@gmail.com",
      },
    },
  };

  return (
    <Layout
      title={TITLE}
      path={PAGE_PATH}
      description={DESCRIPTION}
      image={`${SITE_URL}/og-health-disclaimer.png`}
      jsonLd={jsonLd}
    >
      <div className="flex flex-col gap-4">
        <ContentComponent contents={healthdisclaimer} />
      </div>
    </Layout>
  );
}

