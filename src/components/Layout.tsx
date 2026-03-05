import { FC, ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion } from "framer-motion";
import SeoMeta from "./SeoMeta";

interface LayoutProps {
  children: ReactNode;
  disableDefaultMeta?: boolean;
  title?: string;
  description?: string;
  image?: string;
  path?: string;
}

const Layout: FC<LayoutProps> = ({ children, disableDefaultMeta, title, description, image, path }) => {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/${path || ""}`;

  return (
    <div className="min-h-screen flex flex-col">
      {!disableDefaultMeta && (
        <SeoMeta 
          title={title!}
          description={description!}
          image={image!}
          url={url} 
        />
      )}

      <Navbar />
      <motion.main
        className="flex-grow khabar-container my-2 md:my-6"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};

export default Layout;
