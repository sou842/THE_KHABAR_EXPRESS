
import React, { useState, useEffect } from "react";
import { Edit2, Eye, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import useSWR from "swr";
import { getter } from "@/lib/helper";
import { toast } from "sonner";
import DateTimeDisplay from "@/components/DateTimeDisplay";
import { Skeleton } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";

// Custom hook for debouncing search input
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Blogs = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const { data, isLoading, mutate } = useSWR(
    `/api/blogs?authorId=${user?.id}&limit=5&page=${currentPage}${debouncedSearchTerm ? `&search=${encodeURIComponent(debouncedSearchTerm)}` : ""
    }`,
    getter
  );

  const handleDeletePost = async (postId: string) => {
    try {
      await fetch(`/api/blogs/${postId}`, {
        method: 'DELETE',
      });
      toast.success("Post deleted successfully");
      mutate();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const handlePostAction = async (postId: string, action: string) => {
    try {
      switch (action) {
        case "edit":
          router.push(`/edit/${postId}`);
          break;
        case "delete":
          handleDeletePost(postId);
          break;
        case "view":
          router.push(`/blog/${postId}`);
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action} post`);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-medium">My Blogs</h2>
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background pl-10 pr-10 py-2 w-full rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-khabar-500 focus:border-transparent"
              placeholder="Search blogs..."
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <button
            onClick={() => router.push("/write")}
            className="flex items-center gap-1 px-4 py-2 bg-khabar-500 text-white rounded-md hover:bg-khabar-700 transition-colors whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>New Blog</span>
          </button>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-8 gap-4 p-4 border-b text-sm font-medium text-muted-foreground">
          <div className="col-span-3">Article</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Views</div>
          <div className="col-span-1">Language</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {!isLoading ? (
          data?.data?.length > 0 ? (
            data.data.map((post:any) => (
              <div
                key={post._id}
                className="border-b last:border-b-0 p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col md:grid md:grid-cols-8 md:gap-4 items-start md:items-center">
                  {/* Image + Title + Date */}
                  <div className="flex items-center space-x-3 col-span-3 w-full mb-3 md:mb-0">
                    <img
                      src={post?.thumbnail?.image}
                      alt={post?.thumbnail?.title}
                      className="w-12 h-12 rounded-md object-cover shrink-0"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.pexels.com/photos/235985/pexels-photo-235985.jpeg?auto=compress&cs=tinysrgb&w=600";
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-medium truncate max-w-[250px]">
                        {post?.thumbnail?.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        <DateTimeDisplay type="auto-advanced">
                          {post?.createdAt}
                        </DateTimeDisplay>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="hidden md:block col-span-1 w-full md:w-auto mb-2 md:mb-0">
                    <span
                      className={`text-xs px-2 py-1 rounded-full inline-block ${post.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : post.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </div>

                  {/* Views */}
                  <div className="hidden md:block col-span-1 text-sm text-muted-foreground mb-2 md:mb-0">
                    {post.views.toLocaleString()} views
                  </div>

                  {/* Language */}
                  <div className="hidden md:block col-span-1 text-sm text-muted-foreground mb-2 md:mb-0">
                    {post.language || "N/A"}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 col-span-2 justify-start md:justify-center w-full">
                    {/* Status Badge (Mobile) */}
                    <div className="md:hidden md:w-auto mb-2 md:mb-0">
                      <span
                        className={`text-xs px-2 py-1 rounded-full inline-block ${post.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : post.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                    </div>

                    {/* Views (Mobile) */}
                    <div className="md:hidden text-sm text-muted-foreground mb-2 md:mb-0">
                      {post.views.toLocaleString()} views
                    </div>

                    <button
                      onClick={() => handlePostAction(post?.url, "edit")}
                      className="p-2 rounded-md hover:bg-accent transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePostAction(post?.url, "view")}
                      className="p-2 rounded-md hover:bg-accent transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {searchTerm ? (
                <div className="flex flex-col items-center gap-2">
                  <p>No blogs found matching "{searchTerm}"</p>
                  <button
                    onClick={clearSearch}
                    className="text-khabar-500 hover:underline text-sm"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <p>No blogs found</p>
              )}
            </div>
          )
        ) : (
          <div className="py-2 px-4">
            <Skeleton repeat={5} type="category-compact-skeleton" />
          </div>
        )}
      </div>

      {data?.pagination?.pages > 1 && (
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={data?.pagination?.pages || 1}
        />
      )}
    </div>
  );
};

export default Blogs;