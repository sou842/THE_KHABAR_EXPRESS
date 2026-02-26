import React from "react";
import Link from "next/link";
import Logo from "./Logo";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background py-12 px-5 md:px-6">
      <div className="khabar-container">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo and description */}
          <div className="space-y-4">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-khabar-600 to-khabar-400 bg-clip-text text-transparent inline-block"
            >
              <Logo type={"full-logo"} />
            </Link>
            <p className="text-muted-foreground text-sm">
              Stay informed with the latest news across various domains, from
              technology to health, finance to entertainment.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-base font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/disclaimer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-base font-medium mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/category/technology"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Technology
                </Link>
              </li>
              <li>
                <Link
                  href="/category/health"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Health
                </Link>
              </li>
              <li>
                <Link
                  href="/category/finance"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Finance
                </Link>
              </li>
              <li>
                <Link
                  href="/category/politics"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Politics
                </Link>
              </li>
            </ul>
          </div>

          {/* Language */}
          <div>
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
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {currentYear} The Khabar Express. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
