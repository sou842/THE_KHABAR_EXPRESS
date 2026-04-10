import { FC, useState } from "react";
import { Search, Menu, X, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import SearchDialog from "./SearchDialog";
import Link from "next/link";
import Head from "next/head";
import Logo from "./Logo";
import { buildSiteUrl } from "@/lib/site";

const Navbar: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { query, pathname } = router;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => [
    router.push(
      {
        pathname: pathname,
        query: { ...query, search: "true" },
      },
      undefined,
      { shallow: true }
    ),
  ];

  const categories = [
    { name: "Technology", slug: "technology" },
    { name: "Health", slug: "health" },
    { name: "Finance", slug: "finance" },
    { name: "Politics", slug: "politics" },
    // { name: "Entertainment", slug: "entertainment" },
    { name: "Sports", slug: "sports" },
  ];

  // JSON-LD structured data for navigation
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "name": categories?.map(cat => cat?.name),
    "url": categories?.map((cat) => buildSiteUrl(`/category/${cat.slug}`)),
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-sm" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2"
              aria-label="Khabar Homepage"
              onClick={() => setIsMenuOpen(false)}
            >
              <Logo type="full-logo" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-12" role="navigation" aria-label="Main Navigation">
              {categories?.map(
                (category: { name: string; slug: string }, index: number) => (
                  <Link
                    key={index}
                    href={`/category/${category?.slug}`}
                    aria-label={`${category?.name} News Category`}
                    className="hover:opacity-75 transition-opacity font-medium text-primary-foreground"
                  >
                    {category?.name}
                  </Link>
                )
              )}
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-1 md:space-x-4">
              <button
                onClick={toggleSearch}
                title="Search"
                aria-label="Search Articles"
                className="rounded-full p-2 text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </button>

              {isAuthenticated ? (
                <Link
                  href={
                    user?.role === "admin"
                      ? "/admin/dashboard"
                      : "/editor/dashboard"
                  }
                  title="Profile"
                  aria-label="User Profile Dashboard"
                  className="flex items-center justify-center space-x-1 rounded-full p-2 text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                >
                  <User className="h-5 w-5 m-0" />
                  <span className="sr-only">Profile</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  title="Login"
                  aria-label="Login to Account"
                  className="rounded-full p-2 text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Login</span>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMenu}
                title="Menu"
                aria-label="Toggle Mobile Menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                className="md:hidden rounded-full p-2 text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
                <span className="sr-only">Menu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {query?.search === "true" && (
          <SearchDialog open={query.search === "true"} />
        )}

        {/* Mobile menu */}
        {isMenuOpen && (
          <div 
            id="mobile-menu" 
            className="md:hidden pb-4 border-t border-primary-foreground/20 pt-4 space-y-3 bg-primary"
            role="navigation" 
            aria-label="Mobile Navigation"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex flex-col space-y-3">
                {categories?.map((category: any, index: number) => (
                  <Link
                    key={index}
                    href={`/category/${category.slug}`}
                    aria-label={`${category.name} News Category`}
                    className="block hover:opacity-75 transition-opacity font-medium text-primary-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category?.name}
                  </Link>
                ))}
                <div className="border-t border-primary-foreground/20 pt-4 mt-4">
                  <Link
                    href="/about"
                    aria-label="About Us"
                    className="block hover:opacity-75 transition-opacity font-medium text-primary-foreground"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    About Us
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default Navbar;
