import Head from "next/head";
import { FC } from "react";
import { buildSiteUrl, getSiteUrl } from "@/lib/site";

interface SeoMetaProps {
  title: string;
  description: string;
  image: string;
  url: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: any;
  jsonLd?: Record<string, any>;
  preloadImage?: boolean;
}

const SeoMeta: FC<SeoMetaProps> = (props) => {
  const {
    title = "The Khabar Express - Latest News and Insights",
    description = "At The Khabar Express, we bring you the latest and most relevant news from around the world, covering everything from current events and technology to health, entertainment, and beyond.",
    image = "https://images.pexels.com/photos/3944460/pexels-photo-3944460.jpeg?auto=compress&cs=tinysrgb&w=1200",
    url = getSiteUrl(),
    category,
    createdAt,
    updatedAt,
    author,
    jsonLd,
    preloadImage,
  } = props;
  const siteUrl = getSiteUrl();
  const canonicalUrl = buildSiteUrl(url);

  const generateWebSiteSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "The Khabar Express",
      "alternateName": "Khabar Express",
      "url": siteUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };
  };

  const generateOrganizationSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "The Khabar Express",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": buildSiteUrl("/favicon.ico"),
        "width": 60,
        "height": 60
      },
      "sameAs": [
        "https://twitter.com/thekhabarexpress",
        "https://facebook.com/thekhabarexpress",
        "https://instagram.com/thekhabarexpress"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "thekhabarexpressnews@gmail.com"
      }
    };
  };

  const generateArticleSchema = () => {
    if (!category || !createdAt) return null;

    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: title,
      image: [image],
      datePublished: createdAt,
      dateModified: updatedAt || createdAt,
      author: author
        ? {
          "@type": "Person",
          name: typeof author === 'string' ? author : (author.name || 'Staff Writer'),
        }
        : {
          "@type": "Organization",
          name: "The Khabar Express",
          url: siteUrl,
        },
      publisher: {
        "@type": "Organization",
        name: "The Khabar Express",
        logo: {
          "@type": "ImageObject",
          url: buildSiteUrl("/favicon.ico"),
        },
      },
      description: description,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
      articleSection: category,
    };
  };

  const generateBreadcrumbSchema = () => {
    if (!category || !url) return null;

    const items = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
    ];

    if (category) {
      items.push({
        "@type": "ListItem",
        position: 2,
        name: category,
        item: buildSiteUrl(`/category/${category.toLowerCase()}`),
      });
    }

    if (title && canonicalUrl !== siteUrl) {
      items.push({
        "@type": "ListItem",
        position: items.length + 1,
        name: title,
        item: canonicalUrl,
      });
    }

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items,
    };
  };

  const normalizeUrl = (u: string) => u?.replace(/\/$/, "");

  const allStructuredData = [
    ...(jsonLd ? [jsonLd] : []),
    generateOrganizationSchema(),
    ...(normalizeUrl(canonicalUrl) === normalizeUrl(siteUrl) ? [generateWebSiteSchema()] : []),
    ...(generateArticleSchema() ? [generateArticleSchema()] : []),
    ...(generateBreadcrumbSchema() ? [generateBreadcrumbSchema()] : []),
  ];

  const fullTitle = title.includes("The Khabar Express") ? title : `${title} - The Khabar Express`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {preloadImage && image && (
        <link
          rel="preload"
          as="image"
          href={image}
          // We use high fetchpriority for the LCP image
          {...({ fetchpriority: "high" } as any)}
        />
      )}
      
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph */}
      <meta property="og:site_name" content="The Khabar Express" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={category ? "article" : "website"} />
      <meta property="og:locale" content="en_US" />
      <meta name="google-adsense-account" content="ca-pub-5434867604639566" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured data */}
      {allStructuredData.map((data, index) => (
        <script
          key={`schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Head>
  );
};

export default SeoMeta;
