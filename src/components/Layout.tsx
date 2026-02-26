import { FC, ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion } from "framer-motion";
import DefaultLayoutSeo from "./SeoMeta/DefaultLayoutSeo";

interface LayoutProps {
  children: ReactNode;
  disableDefaultMeta?: boolean;
  title?: string;
  path?: string;
}

const Layout: FC<LayoutProps> = ({ children, disableDefaultMeta, title, path }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {!disableDefaultMeta && <DefaultLayoutSeo title={title} path={path} />}

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
