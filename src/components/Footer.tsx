import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import { SOCIAL_LINKS } from "@/lib/constants";
import LanguageSwitcher from "./LanguageSwitcher";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "Health Disclaimer", href: "/health-disclaimer" },
  { label: "Finance Disclaimer", href: "/finance-disclaimer" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
  { label: "Cookie Settings", href: "/cookie-settings" },
  { label: "Terms of Service", href: "/terms-of-service" },
];


const CATEGORY_LINKS = [
  { label: "Technology", href: "/category/technology" },
  { label: "Health", href: "/category/health" },
  { label: "Finance", href: "/category/finance" },
  { label: "Politics", href: "/category/politics" },
  { label: "Entertainment", href: "/category/entertainment" },
  { label: "Sports", href: "/category/sports" },
  { label: "Coding", href: "/category/coding" },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background py-12 px-5 md:px-6">
      <div className="khabar-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo and description */}
          <div className="col-span-1 sm:col-span-2 space-y-4 mb-4 md:mb-0">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-khabar-600 to-khabar-400 bg-clip-text text-transparent inline-block"
            >
              <Logo type={"footer-logo"} />
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              Stay informed with the latest news across various domains, from
              technology to health, finance to entertainment.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label={label}>
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <div className="pt-4">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Quick Links</h3>
            <ul className="space-y-3 text-sm">
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
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6">Categories</h3>
            <ul className="space-y-3 text-sm">
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
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground" suppressHydrationWarning>
          © {currentYear} The Khabar Express. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
