import Head from "next/head";

export default function DefaultLayoutSeo({
  title,
  path,
}: {
  title?: string;
  path?: string;
}) {
  return (
    <Head>
      <title>{title && `${title} - `} The Khabar Express</title>
      <link
        rel="canonical"
        href={`${process.env.NEXT_PUBLIC_SITE_URL}/${path || ""}`}
      />
      <meta
        data-rh="true"
        property="og:title"
        content={`${title || "Today's News"} - The Khabar Express`}
      />
      <meta
        name="description"
        content={
          "At The Khabar Express, we bring you the latest and most relevant news from around the world, covering everything from current events and technology to health, entertainment, and beyond."
        }
        data-rh="true"
      />
      <meta
        data-rh="true"
        property="og:description"
        content={
          "At The Khabar Express, we bring you the latest and most relevant news from around the world, covering everything from current events and technology to health, entertainment, and beyond."
        }
      />
      <meta name="robots" content="index,follow"></meta>
      <meta
        data-rh="true"
        name="og:image"
        content="https://images.pexels.com/photos/3944460/pexels-photo-3944460.jpeg?auto=compress&cs=tinysrgb&w=600"
      />
      <meta data-rh="true" property="og:type" content="article" />
      <meta data-rh="true" property="og:image:width" content="1200" />
      <meta data-rh="true" property="og:image:height" content="630" />
      <meta
        data-rh="true"
        property="og:url"
        content={`${process.env.NEXT_PUBLIC_SITE_URL}/${path || ""}`}
      />
      <meta
        data-rh="true"
        property="og:logo"
        content={`${process.env.NEXT_PUBLIC_SITE_URL}/favicon.ico`}
      />

      <meta data-rh="true" name="twitter:card" content="summary_large_image" />
      <meta
        data-rh="true"
        name="twitter:title"
        content="The Khabar Express - Latest News"
      />
      <meta
        data-rh="true"
        name="twitter:description"
        content="At The Khabar Express, we bring you the latest and most relevant news from around the world, covering everything from current events and technology to health, entertainment, and beyond."
      />
      <meta
        data-rh="true"
        name="twitter:image"
        content="https://images.pexels.com/photos/3944460/pexels-photo-3944460.jpeg?auto=compress&cs=tinysrgb&w=600"
      />
      {/* <meta data-rh="true" name="twitter:site" content="@yourTwitterHandle" />  */}
    </Head>
  );
}
