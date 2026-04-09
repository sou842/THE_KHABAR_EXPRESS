import { FC, ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SeoMeta from "./SeoMeta";
import dynamic from "next/dynamic";
import { buildSiteUrl } from "@/lib/site";

const SocialFollowDialog = dynamic(() => import("./SocialFollowDialog"), {
  ssr: false,
});

interface LayoutProps {
  children: ReactNode;
  disableDefaultMeta?: boolean;
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  jsonLd?: Record<string, any>;
}

const Layout: FC<LayoutProps> = ({ children, disableDefaultMeta, title, description, image, path, jsonLd }) => {
  const url = buildSiteUrl(path);

  return (
    <div className="min-h-screen flex flex-col">
      {!disableDefaultMeta && (
        <SeoMeta 
          title={title!}
          description={description!}
          image={image!}
          url={url} 
          jsonLd={jsonLd}
        />
      )}

      <Navbar />
      <main className="flex-grow khabar-container my-2 md:my-6">
        {children}
      </main>
      <Footer />
      <SocialFollowDialog />
    </div>
  );
};

export default Layout;
