import DateTimeDisplay from "@/components/DateTimeDisplay";
import { Skeleton } from "@/components/Skeleton";
import { CommandDialog } from "@/components/ui/command";
import { getter } from "@/lib/helper";
import React, { useState } from "react";
import useSWR from "swr";

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
      <h1 className="text-2xl font-bold mb-6">Contributor Management</h1>

      {!isLoading ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data && data?.data?.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                data?.data?.map((user: any) => (
                  <tr
                    key={user._id}
                    className="cursor-pointer hover:bg-gray-100 transition"
                    onClick={() => handleSelectContributor(user)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {user?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <DateTimeDisplay type="auto-advanced">
                        {user?.createdAt}
                      </DateTimeDisplay>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium text-muted-foreground">
                      {user?.note?.substring(0, 25)}...
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
            <h2 className="text-sm font-bold mb-2">Note:</h2>
            <p className="bg-khabar-200/10 rounded p-4">{selectedContributor?.note}</p>
          </div>
        </div>
      </CommandDialog>
    </div>
  );
};

export default Contributor;
