import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  FilePlus,
  LayoutDashboard,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import Logo from "@/components/Logo";
import Link from "next/link";
import SeoMeta from "@/components/SeoMeta";

const EditorSideBar = dynamic(() => import("@/components/editor/EditorSideBar"));
const OverView = dynamic(() => import("@/components/editor/SidebarTabs/OverView"));
const Blogs = dynamic(() => import("@/components/editor/SidebarTabs/Blogs"));

const menuItems = [
  { label: "Overview", value: "overview", icon: LayoutDashboard },
  { label: "My blogs", value: "blogs", icon: FilePlus },
  // { label: "Stats", value: "stats", icon: BarChart },
  // { label: "Settings", value: "settings", icon: Settings },
] as const;

const EditorDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { tab } = router.query;
  const [activeTab, setActiveTab] = useState<
    "overview" | "blogs" | "stats" | "settings"
  >("overview");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleTabChange = (
    newTab: "overview" | "blogs" | "stats" | "settings"
  ) => {
    setActiveTab(newTab);

    router?.push(
      {
        pathname: router?.pathname,
        query: { tab: newTab },
      },
      undefined,
      { shallow: true }
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverView />;

      case "blogs":
        return <Blogs />;

      case "stats":
        return <center>Comming soon...</center>;

      case "settings":
        return <center>Comming soon...</center>;

      default:
        return null;
    }
  };

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab as "overview" | "blogs" | "stats" | "settings");
    }
  }, [tab, activeTab]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      <SeoMeta 
        title={`Editor Dashboard - ${activeTab?.charAt(0)?.toUpperCase() + activeTab?.slice(1)} | The Khabar Express`} 
        description="Editor dashboard for creating and managing your news articles on The Khabar Express."
        url={`${process.env.NEXT_PUBLIC_SITE_URL}/editor/dashboard`}
        image="https://images.pexels.com/photos/34600/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200"
      />
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <EditorSideBar activeTab={activeTab} setActiveTab={handleTabChange} />

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          {/* Mobile top bar */}
          <div className="md:hidden flex items-center justify-between p-4 border-b">

            <Link
              href="/"
              className="flex items-center space-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Logo type="full-logo" />
            </Link>

            <button
              onClick={toggleMenu}
              className="md:hidden rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
          {isMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <div className="khabar-container">
                <nav className="flex flex-col space-y-4  ">
                  {menuItems?.map(({ label, value, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => {
                        handleTabChange(value);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm ${activeTab === value
                        ? "bg-khabar-50 text-khabar-700 font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                  <div className="border-t border-border pt-4 mt-4">
                    <Link
                      href="/about"
                      className="text-foreground hover:text-khabar-500  transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      About Us
                    </Link>
                  </div>
                </nav>
              </div>
            </div>
          )}
          {/* Content area */}
          <main className="p-6">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default PrivateRoute(EditorDashboard);
