import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Check,
  Eye,
  Filter,
  PencilIcon,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import UserDetailView from "../UserDetailView";
import CreateUser from "../CreateUser";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
  access: {
    canApprove: boolean;
    canAddBlog: boolean;
  };
  createdAt: string;
  status: "active" | "inactive";
}

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
    if (!window.confirm("Are you sure you want to delete this user?")) return;

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
      toast.error("Failed to delete user");
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
        toast.success(`User ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
        setUsers(users.map(user => user._id === userId ? { ...user, status: newStatus } : user));
      } else {
        toast.error("Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const handleUserCreated = (newUser: User): void => {
    setShowCreateForm(false);
    fetchUsers();
  };

  if (selectedUser) {
    return <UserDetailView userId={selectedUser} onClose={handleCloseUserDetail} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>

        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-9 pr-4 py-2 border border-border bg-background rounded-md w-full md:w-64 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <select
              value={filterRole}
              onChange={handleFilterChange}
              className="pl-9 pr-8 py-2 border border-border bg-background rounded-md w-full appearance-none text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchUsers}
            className="flex items-center justify-center p-2 border border-border rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Add user button */}
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>{showCreateForm ? "Cancel" : "Add New User"}</span>
          </button>
        </div>
      </div>

      {/* Users table */}
      {showCreateForm ? <div className="max-w-full w-full m-auto mb-8">
        <CreateUser
          onSuccess={handleUserCreated}
          onCancel={() => setShowCreateForm(false)}
          data={editFormData}
          isUpdate={isUpdate}
        />
      </div> :
        <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground text-sm">Loading user directory...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-sm">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground tracking-widest uppercase">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground tracking-widest uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground tracking-widest uppercase">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground tracking-widest uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground tracking-widest uppercase">Created At</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground tracking-widest uppercase text-center">Permissions</th>
                    <th className="px-6 py-4 text-xs font-semibold text-muted-foreground tracking-widest uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-semibold text-foreground">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2.5 py-1 font-medium rounded-full ${user.role === "admin"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-secondary text-secondary-foreground border border-border"
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2.5 py-1 font-medium rounded-full ${user.status === "active"
                          ? "bg-green-500/10 text-green-600 border border-green-500/20"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                          }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Approve</span>
                            {user.access?.canApprove ? (
                              <div className="bg-green-500/10 p-1 rounded-full"><Check className="h-4 w-4 text-green-600" /></div>
                            ) : (
                              <div className="bg-destructive/10 p-1 rounded-full"><X className="h-4 w-4 text-destructive" /></div>
                            )}
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Add Blog</span>
                            {user.access?.canAddBlog ? (
                              <div className="bg-green-500/10 p-1 rounded-full"><Check className="h-4 w-4 text-green-600" /></div>
                            ) : (
                              <div className="bg-destructive/10 p-1 rounded-full"><X className="h-4 w-4 text-destructive" /></div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewUser(user._id)}
                            className="p-1.5 rounded-md bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateUser(user)}
                            className="p-1.5 rounded-md bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Edit User"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user._id, user.status)}
                            className={`p-1.5 rounded-md bg-muted transition-colors ${user.status === "active" ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive" : "text-muted-foreground hover:bg-green-500/10 hover:text-green-600"}`}
                            title={user.status === "active" ? "Deactivate User" : "Activate User"}
                          >
                            {user.status === "active" ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-1.5 rounded-md bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>}
    </div>
  );
};

export default UserManagement;