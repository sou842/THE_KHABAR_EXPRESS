import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function VaultSkeleton({ type }: { type: 'prompt' | 'feature_plan' }) {
  if (type === 'prompt') {
    return (
      <div className="flex-1 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4 bg-card border-border/60">
            <div className="flex justify-between items-start mb-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-16 w-full rounded-md" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-4 w-20" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full flex-1">
      {[1, 2, 3, 4].map((col) => (
        <div key={col} className="rounded-xl p-3 bg-muted/30 border border-border/50 flex flex-col h-full gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="p-4 bg-card border-border/60 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-1.5">
                    <Skeleton className="h-5 w-5 rounded-full border-2 border-background" />
                    <Skeleton className="h-5 w-5 rounded-full border-2 border-background" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
