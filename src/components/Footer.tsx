import React from "react";
import Link from "next/link";
import Logo from "./Logo";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
];

const CATEGORY_LINKS = [
  { label: "Technology", href: "/category/technology" },
  { label: "Health", href: "/category/health" },
  { label: "Finance", href: "/category/finance" },
  { label: "Politics", href: "/category/politics" },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background py-12 px-5 md:px-6">
      <div className="khabar-container">
        <div className="flex justify-between gap-8">
          {/* Logo and description */}
          <div className="w-full space-y-4">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-khabar-600 to-khabar-400 bg-clip-text text-transparent inline-block"
            >
              <Logo type={"footer-logo"} />
            </Link>
            <p className="text-muted-foreground text-sm">
              Stay informed with the latest news across various domains, from
              technology to health, finance to entertainment.
            </p>
          </div>

          {/* Quick links */}
          <div className="w-full">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="w-full">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Categories</h3>
            <ul className="space-y-2 text-sm">
              {CATEGORY_LINKS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Language */}
          {/* <div>
            <h3 className="text-base font-medium mb-4">Language</h3>
            <div className="flex items-center space-x-2">
              <button className="rounded-full py-1 px-3 text-xs font-medium border bg-background hover:bg-secondary transition-colors">
                English
              </button>
              <button
                disabled={true}
                className="rounded-full py-1 px-3 text-xs font-medium border border-muted text-muted-foreground hover:border-foreground hover:text-foreground transition-colors cursor-not-allowed"
              >
                हिन्दी
              </button>
            </div>
          </div> */}
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {currentYear} The Khabar Express. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;