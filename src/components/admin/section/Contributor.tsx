import DateTimeDisplay from "@/components/DateTimeDisplay";
import { Skeleton } from "@/components/Skeleton";
import { CommandDialog } from "@/components/ui/command";
import { getter } from "@/lib/helper";
import React, { useState } from "react";
import useSWR from "swr";
import { Mail, Calendar, MessageSquare, Quote } from 'lucide-react';

const Contributor: React.FC = () => {
  const { data, isLoading } = useSWR("/api/contributor", getter);
  const [selectedContributor, setSelectedContributor] = useState<any>(null);

  const handleSelectContributor = (user: any) => {
    setSelectedContributor(user);
  };

  const handleCloseCard = () => {
    setSelectedContributor(null);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">Contributor Management</h1>
      </div>

      {!isLoading ? (
        <div className="bg-card shadow-sm rounded-xl overflow-hidden border border-border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                  <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date & Time</div>
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground tracking-widest uppercase">
                  <div className="flex items-center justify-end gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Note</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data && data?.data?.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-8 text-center text-muted-foreground text-sm"
                  >
                    No contributors found
                  </td>
                </tr>
              ) : (
                data?.data?.map((user: any) => (
                  <tr
                    key={user._id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleSelectContributor(user)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground font-medium">
                      {user?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <DateTimeDisplay type="auto-advanced">
                        {user?.createdAt}
                      </DateTimeDisplay>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-muted-foreground">
                      {user?.note?.substring(0, 40) || ""}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <Skeleton repeat={1} type="category-featured-skeleton" />
      )}

      <CommandDialog
        open={!!selectedContributor}
        onOpenChange={handleCloseCard}
      >
        <div className="container mx-auto p-6 flex flex-col gap-6">
          <div className="flex flex-row justify-between items-center gap-2">
            <div className="text-muted-foreground">
              From: {selectedContributor?.email}
            </div>
            <div className="text-muted-foreground text-xs">
              <DateTimeDisplay type="date">
                {selectedContributor?.createdAt}
              </DateTimeDisplay>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold mb-2 flex items-center gap-1.5"><Quote className="w-4 h-4 text-primary" /> Note:</h2>
            <p className="bg-muted p-4 rounded-md border border-border text-foreground text-sm">{selectedContributor?.note}</p>
          </div>
        </div>
      </CommandDialog>
    </div>
  );
};

export default Contributor;
