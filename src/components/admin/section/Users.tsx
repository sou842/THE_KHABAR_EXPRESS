import React, { useState, useEffect, ChangeEvent, useCallback, useMemo } from "react";
import {
  Check,
  Eye,
  Filter,
  Pencil as PencilIcon,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
  MoreVertical,
  Mail,
  Calendar,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  Users as UsersIcon,
  Shield,
  LayoutGrid,
  List as ListIcon,
  MoreHorizontal,
  UserX,
  UserCheck,
  XCircle,
  Loader2,
  Settings,
  Circle,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import UserDetailView from "../UserDetailView";
import CreateUser from "../CreateUser";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export interface User {
  _id: string;
  name: string;
  email: string;
  username?: string;
  profilePhoto?: string;
  role: "admin" | "editor";
  access: {
    canApprove: boolean;
    canAddBlog: boolean;
  };
  createdAt: string;
  status: "active" | "inactive";
}

const UserSkeleton = () => (
  <div className="flex items-center gap-4 py-4 px-6 mb-2 bg-white border border-slate-200 rounded-xl animate-pulse">
    <div className="w-10 h-10 rounded-full bg-slate-100" />
    <div className="flex-1 space-y-2">
      <div className="h-4 w-32 bg-slate-100 rounded" />
      <div className="h-3 w-48 bg-slate-50 rounded" />
    </div>
    <div className="w-24 h-8 bg-slate-100 rounded-lg" />
  </div>
);

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<User | undefined>();
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error("Failed to load users");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setLoading(false);
    }
  };

  const handleUpdateUser = (user: User): void => {
    setIsUpdate(true);
    setShowCreateForm(true);
    setEditFormData(user);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>): void => {
    setFilterRole(e.target.value);
  };

  const handleViewUser = (userId: string): void => {
    setSelectedUser(userId);
  };

  const handleCloseUserDetail = (): void => {
    setSelectedUser(null);
  };

  const handleDeleteUser = async (userId: string): Promise<void> => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        toast.success("User deleted successfully");
        fetchUsers();
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Process error");
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string): Promise<void> => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`User set to ${newStatus}`);
        setUsers(users.map(user => user._id === userId ? { ...user, status: newStatus } : user));
      } else {
        toast.error("Status update failed");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Process error");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterRole === "all" || user.role === filterRole;
      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, filterRole]);

  const handleUserCreated = (newUser: User): void => {
    setShowCreateForm(false);
    fetchUsers();
  };

  if (selectedUser) {
    return (
      <UserDetailView 
        userId={selectedUser} 
        onClose={handleCloseUserDetail} 
        onEdit={() => {
          const user = users.find(u => u._id === selectedUser);
          if (user) handleUpdateUser(user);
        }}
      />
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto py-10 px-6 space-y-8 animate-in fade-in duration-500">
      {/* Professional Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage team members, roles, and system permissions.</p>
        </div>
        <button
          onClick={() => {
            setIsUpdate(false);
            setEditFormData(undefined);
            setShowCreateForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-all active:scale-[0.98] shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add User</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showCreateForm ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-900">{isUpdate ? "Edit User Profile" : "Create New User"}</h2>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="p-1">
               <CreateUser
                onSuccess={handleUserCreated}
                onCancel={() => setShowCreateForm(false)}
                data={editFormData}
                isUpdate={isUpdate}
              />
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 border border-slate-200 rounded-xl shadow-sm">
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-200/60 rounded-lg text-sm outline-none focus:bg-white focus:border-slate-300 focus:ring-4 focus:ring-slate-900/5 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={filterRole}
                    onChange={handleFilterChange as any}
                    className="pl-9 pr-8 py-2 bg-slate-50/50 border border-slate-200/60 rounded-lg text-xs font-medium text-slate-600 outline-none focus:bg-white focus:border-slate-300 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Administrators</option>
                    <option value="editor">Editors</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                </div>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                <button
                  onClick={fetchUsers}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                  title="Refresh List"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Structured Table/List */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Member</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Access</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered</th>
                      <th className="px-6 py-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="px-6 py-4"><div className="h-8 bg-slate-50 rounded-lg w-full" /></td>
                        </tr>
                      ))
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                              <Search className="h-5 w-5 text-slate-300" />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900">No users found</h3>
                            <p className="text-xs text-slate-500">Try adjusting your search or filters.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="group hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm shrink-0 overflow-hidden">
                                {user.profilePhoto ? (
                                  <img src={user.profilePhoto} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  user.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">
                                  {user.name}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tight">
                                  {user.username ? `@${user.username}` : user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                              user.role === 'admin' 
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200/50' 
                                : 'bg-slate-100 text-slate-600 border-slate-200/50'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1.5 text-slate-400">
                              <Plus className={`h-3.5 w-3.5 ${user.access?.canAddBlog ? 'text-slate-900' : 'opacity-20'}`} strokeWidth={3} />
                              <Check className={`h-3.5 w-3.5 ${user.access?.canApprove ? 'text-slate-900' : 'opacity-20'}`} strokeWidth={3} />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                              <span className={`text-xs font-medium ${user.status === 'active' ? 'text-slate-900' : 'text-slate-400'}`}>
                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                              <button
                                onClick={() => handleViewUser(user._id)}
                                className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-md transition-all text-slate-400 hover:text-slate-900"
                                title="View Profile"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateUser(user)}
                                className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-md transition-all text-slate-400 hover:text-slate-900"
                                title="Edit User"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              
                              <div className="relative group/more">
                                <button className="p-2 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-md transition-all text-slate-400 hover:text-slate-900">
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all z-20">
                                  <button 
                                    onClick={() => handleToggleStatus(user._id, user.status)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                  >
                                    {user.status === "active" ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                                    <span>{user.status === "active" ? "Deactivate" : "Activate"}</span>
                                  </button>
                                  {user.username && (
                                    <button 
                                      onClick={() => window.open(`/creator/${user.username}`, "_blank")}
                                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                      <Globe className="h-3.5 w-3.5" />
                                      <span>View Creator Page</span>
                                    </button>
                                  )}
                                  <div className="h-px bg-slate-100 my-1" />
                                  <button 
                                    onClick={() => handleDeleteUser(user._id)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Delete Member</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              {!loading && filteredUsers.length > 0 && (
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Showing {filteredUsers.length} of {users.length} members
                  </p>
                  <div className="flex items-center gap-1">
                    <button className="px-3 py-1.5 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-white hover:text-slate-900 transition-all">Previous</button>
                    <button className="px-3 py-1.5 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-white hover:text-slate-900 transition-all">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;