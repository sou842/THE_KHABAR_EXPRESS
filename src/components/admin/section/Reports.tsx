import React, { useState } from "react";
import useSWR, { mutate } from "swr";
import { toast } from "sonner";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Clock, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { getter } from "@/lib/helper";
import Cookies from "js-cookie";

interface Report {
  _id: string;
  blogId: {
    _id: string;
    title: string;
    url: string;
  };
  reason: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: string;
}

const Reports = () => {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: Report[] }>("/api/reports", getter);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const reports = data?.data || [];
  
  const filteredReports = reports.filter(report => {
    if (filter === "all") return true;
    return report.status === filter;
  });

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    setUpdatingId(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Cookies.get('auth_token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("Report status updated");
        mutate("/api/reports");
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case "reviewed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1"><AlertCircle className="w-3 h-3" /> Reviewed</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1"><CheckCircle2 className="w-3 h-3" /> Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive p-4 flex items-center gap-2 bg-destructive/10 rounded-lg"><AlertCircle className="w-5 h-5" /> Failed to load reports.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Blog Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and review user reports for blog articles.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        {filteredReports.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">No reports found</h3>
                    <p className="text-sm text-muted-foreground">There are no reports matching the current filter.</p>
                </div>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-medium">Reported Blog</th>
                            <th scope="col" className="px-6 py-4 font-medium">Reason</th>
                            <th scope="col" className="px-6 py-4 font-medium">Date</th>
                            <th scope="col" className="px-6 py-4 font-medium">Status</th>
                            <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredReports.map((report) => (
                            <tr key={report._id} className="bg-card hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4 align-top max-w-[250px]">
                                    {report.blogId ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium truncate" title={report.blogId.title}>{report.blogId.title}</span>
                                            <Link 
                                                href={`/blog/${report.blogId.url}`} 
                                                target="_blank"
                                                className="text-xs text-primary flex items-center gap-1 hover:underline w-fit group"
                                            >
                                                View Article <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                            </Link>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground italic">Blog deleted</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <p className="text-foreground whitespace-pre-wrap break-words">{report.reason}</p>
                                </td>
                                <td className="px-6 py-4 align-top whitespace-nowrap text-muted-foreground">
                                    {format(new Date(report.createdAt), "MMM d, yyyy h:mm a")}
                                </td>
                                <td className="px-6 py-4 align-top whitespace-nowrap">
                                    {getStatusBadge(report.status)}
                                </td>
                                <td className="px-6 py-4 align-top text-right whitespace-nowrap">
                                    <Select 
                                        defaultValue={report.status} 
                                        onValueChange={(val) => handleStatusChange(report._id, val)}
                                        disabled={updatingId === report._id}
                                    >
                                        <SelectTrigger className="w-[130px] h-8 ml-auto">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="reviewed">Reviewed</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
