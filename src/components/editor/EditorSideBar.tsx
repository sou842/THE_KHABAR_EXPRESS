import { useRouter } from "next/router";
import {
  FilePlus,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "../Logo";

interface SidebarProps {
  activeTab: string;
  setActiveTab: any;
}

const menuItems = [
  { label: "Overview", value: "overview", icon: LayoutDashboard },
  { label: "My blogs", value: "blogs", icon: FilePlus },
  // { label: "Stats", value: "stats", icon: BarChart },
  // { label: "Settings", value: "settings", icon: Settings },
] as const;

const EditorSideBar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="hidden md:flex md:w-64 flex-col bg-card border-r">
      <div className="p-6">
        <button
          onClick={() => router.push("/")}
          className="text-xl font-bold bg-gradient-to-r from-khabar-600 to-khabar-400 bg-clip-text text-transparent"
        >
          <Logo />
        </button>
        <div className="text-sm text-muted-foreground mt-1">
          Editor Dashboard
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {menuItems?.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm ${
                activeTab === value
                  ? "bg-khabar-50 text-khabar-700 font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-medium">{user?.name?.charAt(0)}</span>
          </div>
          <div>
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 border rounded-md text-sm hover:bg-muted transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default EditorSideBar;
