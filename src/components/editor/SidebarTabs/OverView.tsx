import BlogCard from "@/components/BlogCard";
import { Skeleton } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { getter } from "@/lib/helper";
import React from "react";
import useSWR from "swr";

const stats = [
  { label: "Total Posts", key: "totalUserBlogs", unit: "articles" },
  { label: "Total Views", key: "totalViews", unit: "views" },
  { label: "Pending Approval", key: "totalPendingUserBlogs", unit: "articles" },
  { label: "Approved Blogs", key: "totalApprovedUserBlogs", unit: "articles" },
  { label: "Rejected Blogs", key: "totalRejectedUserBlogs", unit: "articles" },
];

const OverView: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = useSWR(`/api/blogs?authorId=${user?.id}`, getter);
  const { data: analytics, isLoading: analyticsLoading } = useSWR(
    `/api/dashboard/editor?id=${user?.id}`,
    getter
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-medium">Dashboard Overview</h2>

      {/* Stats Section */}
      <div
        className={
          analyticsLoading
            ? "w-full"
            : "w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2"
        }
      >
        {!analyticsLoading ? (
          stats?.map(({ label, key, unit }: any) => (
            <div key={key} className="bg-card p-4 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {label}
                </h3>
              </div>
              <div className="flex items-end">
                <span className="text-2xl font-medium">
                  {analytics?.data?.[key] || 0}
                </span>
                {unit && (
                  <span className="ml-1 text-sm text-muted-foreground">
                    {unit}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <Skeleton repeat={5} type={`analytics-skeleton`} />
        )}
      </div>

      {/* Top Performing Post Section */}
      <div className="bg-card p-4 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Top Performing Post</h3>
        </div>

        {!isLoading ? (
          <div className="w-full flex flex-col gap-3">
            {data &&
              data?.data?.map((post: any, index: number) => (
                <>
                  {index ? (
                    <div className="w-full h-[1px] bg-muted"></div>
                  ) : null}
                  <BlogCard key={index} post={post} variant="compact" />
                </>
              ))}
          </div>
        ) : (
          <Skeleton type={`category-compact-skeleton`} />
        )}
      </div>
    </div>
  );
};

export default OverView;
