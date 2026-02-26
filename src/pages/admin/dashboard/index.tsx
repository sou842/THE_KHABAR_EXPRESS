import { useEffect, useState } from "react";
import AdminSideBar from "@/components/admin/AdminSideBar";
import Overview from "@/components/admin/section/Overview";
import Blogs from "@/components/admin/section/Blogs";
import UsersPage from "@/components/admin/section/Users";
import Contributor from "@/components/admin/section/Contributor";
import Settings from "@/components/admin/section/Settings";
import TaskList from "@/components/admin/section/TaskList";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <Overview />;

      case "blogs":
        return <Blogs />;

      case "users":
        return <UsersPage />;

      case "contributor":
        return <Contributor />;

      case "settings":
        return <Settings />;
        
      case "tasklist":
        return <TaskList />;

      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <AdminSideBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 p-4">{renderContent()}</div>
    </div>
  );
}