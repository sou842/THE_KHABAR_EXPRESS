import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import AdminSideBar from "@/components/admin/AdminSideBar";
import SeoMeta from "@/components/SeoMeta";

const Overview = dynamic(() => import("@/components/admin/section/Overview"));
const Blogs = dynamic(() => import("@/components/admin/section/Blogs"));
const AutoBlogger = dynamic(() => import("@/components/admin/section/AutoBlogger"));
const UsersPage = dynamic(() => import("@/components/admin/section/Users"));
const Contributor = dynamic(() => import("@/components/admin/section/Contributor"));
const Settings = dynamic(() => import("@/components/admin/section/Settings"));
const TaskList = dynamic(() => import("@/components/admin/section/TaskList"));
const Automation = dynamic(() => import("@/components/admin/section/Automation"));
const ContactMessages = dynamic(() => import("@/components/admin/section/ContactMessages"));
const Reports = dynamic(() => import("@/components/admin/section/Reports"));
const Vault = dynamic(() => import("@/components/admin/section/Vault"));

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTabState] = useState("overview");

  // Sync state with query parameter on load and when query changes
  useEffect(() => {
    if (router.isReady && router.query.tab) {
      setActiveTabState(router.query.tab as string);
    }
  }, [router.isReady, router.query.tab]);

  const setActiveTab = (tab: string) => {
    if (tab === activeTab) return;
    setActiveTabState(tab);
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, tab },
      },
      undefined,
      { shallow: true }
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;

      case "blogs":
        return <Blogs />;

      case "auto-blogger":
        return <AutoBlogger />;

      case "users":
        return <UsersPage />;

      case "vault":
        return <Vault />;

      case "contributor":
        return <Contributor />;

      case "settings":
        return <Settings />;

      case "tasklist":
        return <TaskList />;

      case "automation":
        return <Automation />;

      case "contact":
        return <ContactMessages />;

      case "reports":
        return <Reports />;

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-dvh overflow-y-auto flex gap-6">
      <SeoMeta 
        title={`Admin Dashboard - ${activeTab?.charAt(0)?.toUpperCase() + activeTab?.slice(1)} | The Khabar Express`} 
        description="Admin dashboard for managing blogs, users, and site settings on The Khabar Express."
        url={`${process.env.NEXT_PUBLIC_SITE_URL}/admin/dashboard`}
        image="https://images.pexels.com/photos/3944460/pexels-photo-3944460.jpeg?auto=compress&cs=tinysrgb&w=1200"
      />
      <AdminSideBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 h-dvh overflow-y-auto p-4">{renderContent()}</div>
    </div>
  );
}
