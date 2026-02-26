import { FC, useState } from "react";
import { Search, Menu, X, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import SearchDialog from "./SearchDialog";
import Link from "next/link";
import Head from "next/head";
import Logo from "./Logo";

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
    "name": categories?.map(cat => cat.name),
    "url": categories?.map(cat => `${process.env.NEXT_PUBLIC_SITE_URL || 'https://khabar.com'}/category/${cat.slug}`),
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg" role="banner">
        <div className="khabar-container">
          <div className="flex h-16 items-center justify-between">
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
            <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main Navigation">
              {categories?.map(
                (category: { name: string; slug: string }, index: number) => (
                  <Link
                    key={index}
                    href={`/category/${category?.slug}`}
                    aria-label={`${category?.name} News Category`}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
                  className="flex items-center space-x-1 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <User className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  title="Login"
                  aria-label="Login to Account"
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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
                className="md:hidden rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
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
            className="md:hidden border-t border-border py-4"
            role="navigation" 
            aria-label="Mobile Navigation"
          >
            <div className="khabar-container">
              <nav className="flex flex-col space-y-4">
                {categories?.map((category: any, index: number) => (
                  <Link
                    key={index}
                    href={`/category/${category.slug}`}
                    aria-label={`${category.name} News Category`}
                    className="text-foreground hover:text-khabar-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category?.name}
                  </Link>
                ))}
                <div className="border-t border-border pt-4 mt-4">
                  <Link
                    href="/about"
                    aria-label="About Us"
                    className="text-foreground hover:text-khabar-500 transition-colors"
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
