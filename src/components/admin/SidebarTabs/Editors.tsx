import useSWR from "swr";

import { Edit2, Users, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { getter } from "@/lib/helper";

interface Editor {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  access?: {
    canApprove?: boolean;
    canAddBlog?: boolean;
  };
}


const Editors = () => {
  const { data, error } = useSWR<any>("/api/users", getter);
  const router = useRouter();
  const users = data?.data ?? [];

  if (error) {
    toast.error("Failed to fetch users");
    return <div>Error loading users</div>;
  }

  const handleEditorAction = (
    id: string,
    action: "edit" | "delete" | "toggle-status"
  ) => {
    switch (action) {
      case "edit":
        toast("Edit editor functionality coming soon!");
        break;
      case "delete":
        toast.success("Editor account deleted successfully!");
        break;
      case "toggle-status":
        toast.success("Editor status updated successfully!");
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium">User Management</h2>
        <button
          onClick={() => router.push("/admin/user/add")}
          className="flex items-center gap-1 px-4 py-2 bg-khabar-600 text-white rounded-md hover:bg-khabar-700 transition-colors"
        >
          <Users className="h-4 w-4" />
          <span>Add Editor</span>
        </button>
      </div>

      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-6 gap-4 p-4 border-b text-sm font-medium text-muted-foreground">
          <div className="col-span-2">User</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Role</div>
          <div className="col-span-1">Permissions</div>
          <div className="col-span-1">Actions</div>
        </div>

        {users &&
          users?.map((editor: Editor, index: number) => (
            <div
              key={editor?._id || index}
              className="grid grid-cols-6 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
            >
              <div className="col-span-2 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg -mt-1 leading-0- overflow-visible font-medium">
                    {editor?.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-medium mb-1">{editor?.name}</h4>
                  <div className="text-xs text-muted-foreground">
                    {editor?.email}
                  </div>
                </div>
              </div>

              <div className="col-span-1 flex items-center">
                <div
                  className={`text-xs px-2 py-0.5 rounded-full capitalize ${editor?.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                    }`}
                >
                  {editor?.status}
                </div>
              </div>

              <div className="col-span-1 flex items-center">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${editor?.role === "admin"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
                    }`}
                >
                  {editor?.role}
                </span>
              </div>

              <div className="col-span-1 flex items-center">
                <span className="flex space-x-2">
                  {editor?.access?.canApprove && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      Approve
                    </span>
                  )}
                  {editor?.access?.canAddBlog && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Add Blog
                    </span>
                  )}
                </span>
              </div>

              <div className="col-span-1 flex items-center space-x-2">
                <button
                  onClick={() => handleEditorAction(editor?._id, "edit")}
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    handleEditorAction(editor?._id, "toggle-status")
                  }
                  className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {editor?.status === "active" ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleEditorAction(editor?._id, "delete")}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Editors;
