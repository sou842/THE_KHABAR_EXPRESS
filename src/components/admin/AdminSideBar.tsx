import { useAuth } from "@/contexts/AuthContext";
import {
  FilePlus,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  HeartHandshake,
  List,
  Bot,
  PanelLeftClose,
  Mail,
  Youtube,
  Flag,
  Database,
} from "lucide-react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import Logo from "../Logo";

interface SidebarProps {
  activeTab: string;
  setActiveTab: any;
}

const menuItems = [
  { label: "Overview", value: "overview", icon: LayoutDashboard },
  { label: "Vault", value: "vault", icon: Database },
  { label: "Blogs", value: "blogs", icon: FilePlus },
  { label: "Auto Blogger", value: "auto-blogger", icon: Youtube },
  { label: "Automation", value: "automation", icon: Bot },
  { label: "Users", value: "users", icon: Users },
  { label: "Contributor", value: "contributor", icon: HeartHandshake },
  { label: "Reports", value: "reports", icon: Flag },
  { label: "Settings", value: "settings", icon: Settings },
  { label: "Contact", value: "contact", icon: Mail },
  { label: "Task List", value: "tasklist", icon: List },
] as const;

const AdminSideBar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (activeTab === "automation") {
      setIsCollapsed(true);
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div
      className={`hidden md:flex flex-col bg-card border-r transition-all duration-300 ease-in-out relative ${isCollapsed ? "w-20" : "w-64"
        }`}
    >
      <div className={`p-6 flex items-center transition-all duration-300 ${isCollapsed ? "px-2 justify-center" : "px-6 justify-between"}`}>
        <div className="flex items-center overflow-hidden">
          {isCollapsed ? <button
            onClick={() => setIsCollapsed(false)}
            className="p-3 rounded-lg hover:bg-foreground/60 text-white bg-foreground/50 transition-colors"
            title="Expand Sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button> : <button
            onClick={() => router.push("/")}
            className="text-xl font-bold bg-clip-text text-transparent flex items-center shrink-0"
          >
            <Logo type="admin-logo" />
          </button>}
        </div>

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="absolute -right-3 top-8 p-1.5 rounded-lg hover:bg-foreground/80 text-white bg-foreground/60 transition-colors shrink-0"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className="px-6 mb-4">
          <div className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">
            Admin Dashboard
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 pt-2">
        <nav className="space-y-1">
          {menuItems?.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              title={isCollapsed ? label : ""}
              className={`w-full flex items-center rounded-lg text-sm transition-all duration-200 group ${isCollapsed ? "justify-center px-0 py-2.5" : "space-x-3 px-3 py-2.5"
                } ${activeTab === value
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                }`}
            >
              <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${activeTab === value ? "scale-110" : "group-hover:scale-110"}`} />
              {!isCollapsed && (
                <span className="whitespace-nowrap overflow-hidden transition-all duration-300">
                  {label}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className={`p-4 border-t border-border/50 transition-all duration-300 ${isCollapsed ? "px-2" : "px-4"}`}>
        <div className={`flex items-center mb-4 ${isCollapsed ? "justify-center" : "space-x-3"}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center shrink-0 border border-border/50">
            <span className="text-xs font-bold text-foreground/70">
              {user?.name?.charAt(0) || "A"}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">{user?.name}</div>
              <div className="text-[10px] text-muted-foreground truncate">{user?.email}</div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          title={isCollapsed ? "Sign Out" : ""}
          className={`w-full flex items-center justify-center border border-border/50 rounded-lg text-xs font-medium text-muted-foreground hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all duration-200 ${isCollapsed ? "p-2" : "space-x-2 px-3 py-2"
            }`}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSideBar;
