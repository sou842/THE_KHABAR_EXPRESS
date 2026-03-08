import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import AdminSideBar from "@/components/admin/AdminSideBar";
import Overview from "@/components/admin/section/Overview";
import Blogs from "@/components/admin/section/Blogs";
import AutoBlogger from "@/components/admin/section/AutoBlogger";
import UsersPage from "@/components/admin/section/Users";
import Contributor from "@/components/admin/section/Contributor";
import Settings from "@/components/admin/section/Settings";
import TaskList from "@/components/admin/section/TaskList";
import Automation from "@/components/admin/section/Automation";
import ContactMessages from "@/components/admin/section/ContactMessages";

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

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-dvh overflow-y-auto flex gap-6">
      <AdminSideBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 h-dvh overflow-y-auto p-4">{renderContent()}</div>
    </div>
  );
}