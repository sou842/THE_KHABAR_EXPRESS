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
  UserCircle2,
  ShieldCheck,
  ShieldAlert,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";
import UserDetailView from "../UserDetailView";
import CreateUser from "../CreateUser";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const UserSkeleton = () => (
  <div className="border border-border rounded-xl overflow-hidden bg-card">
    <div className="bg-muted/50 p-4 border-b border-border">
      <div className="grid grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-24" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-border">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 grid grid-cols-6 gap-4 items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <div className="flex justify-end gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
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
      toast.error("Failed to load users");
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-6 mt-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
           User Directory
          </h2>
          <p className="text-muted-foreground mt-1">Manage platform administrators and editors.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-9 pr-4 py-2.5 border border-border bg-background rounded-xl w-full md:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>

          {/* Filter */}
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 group-focus-within:text-primary transition-colors" />
            <select
              value={filterRole}
              onChange={handleFilterChange}
              className="pl-9 pr-8 py-2.5 border border-border bg-background rounded-xl appearance-none text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm min-w-[140px]"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={fetchUsers}
              className="flex items-center justify-center p-2.5 border border-border rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-sm active:scale-95"
              title="Refresh Directory"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                setIsUpdate(false);
                setEditFormData(undefined);
                setShowCreateForm(!showCreateForm);
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all font-semibold text-sm shadow-md active:scale-95 ${
                showCreateForm 
                ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" 
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
              }`}
            >
              {showCreateForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              <span>{showCreateForm ? "Cancel" : "Add New User"}</span>
            </button>
          </div>
        </div>
      </div>

      {showCreateForm ? (
        <div className="max-w-4xl mx-auto mb-8 animate-in slide-in-from-bottom-4 duration-500">
          <CreateUser
            onSuccess={handleUserCreated}
            onCancel={() => setShowCreateForm(false)}
            data={editFormData}
            isUpdate={isUpdate}
          />
        </div>
      ) : loading ? (
        <UserSkeleton />
      ) : filteredUsers.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl p-20 text-center animate-in zoom-in-95 duration-300">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCircle2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No users found</h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
          <button 
            onClick={() => {setSearchTerm(""); setFilterRole("all")}}
            className="text-primary font-semibold mt-4 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border">
                <TableHead className="w-[280px] py-5 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/70">Member</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/70">Role</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/70">Status</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/70 text-center">Permissions</TableHead>
                <TableHead className="py-5 font-bold uppercase tracking-widest text-[10px] text-muted-foreground/70 text-right pr-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id} className="group hover:bg-muted/10 transition-colors border-border">
                  <TableCell className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="relative group-hover:scale-105 transition-transform">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-bold text-lg shadow-inner">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${user.status === 'active' ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-foreground truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      <span className={`text-[10px] px-2.5 py-1 font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 ${
                        user.role === "admin"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-secondary text-secondary-foreground border border-border shadow-sm"
                      }`}>
                        {user.role === "admin" ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      <span className={`text-[10px] px-2.5 py-1 font-bold rounded-lg uppercase tracking-wider ${
                        user.status === "active"
                          ? "bg-green-500/10 text-green-600 border border-green-500/20"
                          : "bg-destructive/10 text-destructive border border-destructive/20 shadow-sm"
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-6">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest mb-1.5 grayscale opacity-50">Content</span>
                        <div className={`p-1.5 rounded-lg transition-all ${user.access?.canAddBlog ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground/40'}`}>
                          {user.access?.canAddBlog ? <Check className="h-3.5 w-3.5 font-bold" /> : <X className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest mb-1.5 grayscale opacity-50">Approve</span>
                        <div className={`p-1.5 rounded-lg transition-all ${user.access?.canApprove ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground/40'}`}>
                          {user.access?.canApprove ? <Check className="h-3.5 w-3.5 font-bold" /> : <X className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <div className="flex items-center justify-end gap-1 px-1">
                      <button
                        onClick={() => handleViewUser(user._id)}
                        className="p-2 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                        title="View Profile"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleUpdateUser(user)}
                        className="p-2 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                        title="Edit Details"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-all active:scale-90">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-xl border-border shadow-xl">
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(user._id, user.status)}
                            className="rounded-lg gap-2 cursor-pointer focus:bg-primary/5 focus:text-primary py-2.5"
                          >
                            {user.status === "active" ? (
                              <><ShieldAlert className="h-4 w-4" /> <span>Deactivate User</span></>
                            ) : (
                              <><ShieldCheck className="h-4 w-4" /> <span>Activate User</span></>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user._id)}
                            className="rounded-lg gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive py-2.5"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove Member</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground font-medium italic">
            <span>Showing {filteredUsers.length} active platform members</span>
            <span>Last updated: {new Date()?.toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;