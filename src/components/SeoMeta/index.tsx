import Head from "next/head";
import { FC } from "react";

interface SeoMetaProps {
  title: string;
  description: string;
  image: string;
  url: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: any;
  structuredData?: Record<string, any>[];
}

const SeoMeta: FC<SeoMetaProps> = (props) => {
  const {
    title = "Today's News",
    description = "At Khabar Express, we bring you the latest and most relevant news from around the world, covering everything from current events and technology to health, entertainment, and beyond.",
    image = "https://images.pexels.com/photos/3944460/pexels-photo-3944460.jpeg?auto=compress&cs=tinysrgb&w=600",
    url,
    category,
    createdAt,
    updatedAt,
    author,
    structuredData = [],
  } = props;

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
          name: author,
        }
        : {
          "@type": "Organization",
          name: "The Khabar Express",
          url: process.env.NEXT_PUBLIC_SITE_URL,
        },
      publisher: {
        "@type": "Organization",
        name: "The Khabar Express",

        logo: {
          "@type": "ImageObject",
          url: [image],
        },
      },
      description: description,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
      articleSection: category,
    };
  };

  const generateBreadcrumbSchema = () => {
    if (!category) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: process.env.NEXT_PUBLIC_SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: category,
          item: `${process.env.NEXT_PUBLIC_SITE_URL}/category/${category}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: title,
          item: url,
        },
      ],
    };
  };

  const allStructuredData = [
    ...structuredData,
    ...(generateArticleSchema() ? [generateArticleSchema()] : []),
    ...(generateBreadcrumbSchema() ? [generateBreadcrumbSchema()] : []),
  ];

  return (
    <Head>
      <title>{`${title} - The Khabar Express`}</title>
      <link rel="canonical" href={`${url}`} />
      <meta name="title" content={`${title}`} data-rh="true" />
      <meta name="description" content={`${description}`} data-rh="true" />
      <meta
        property="og:site_name"
        content="the khabar express"
        data-rh="true"
      />
      <meta name="robots" content="index,follow"></meta>
      {/* OG Controll */}
      <meta
        property="og:title"
        content={`${title} - The Khabar Express`}
        data-rh="true"
      />
      <meta property="og:description" content={`${description}`} data-rh="true" />
      <meta property="og:image" content={`${image}`} data-rh="true" />
      <meta property="og:type" content="article" data-rh="true" />
      <meta property="og:image:width" content="1200" data-rh="true" />
      <meta property="og:image:height" content="630" data-rh="true" />
      <meta property="og:locale" content="en_US" data-rh="true" />
      <meta property="og:url" content={`${url}`} data-rh="true" />
      <meta property="og:logo" content={`${image}`} data-rh="true" />

      {/* twitter */}
      <meta name="twitter:card" content="summary_large_image" data-rh="true" />
      <meta
        name="twitter:title"
        content={`${title} - The Khabar Express`}
        data-rh="true"
      />
      <meta name="twitter:description" content={`${description}`} data-rh="true" />
      <meta name="twitter:image" content={`${image}`} data-rh="true" />
      {/* <meta name="twitter:site" content="@yourTwitterHandle" />  data-rh="true"*/}

      {/* app links */}
      <meta property="al:android:url" content={`${url}`} data-rh="true" />
      <meta property="al:ios:url" content={`${url}`} data-rh="true" />

      {/* Structured data */}
      {allStructuredData?.map((data: any, index: number) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Head>
  );
};

export default SeoMeta;
