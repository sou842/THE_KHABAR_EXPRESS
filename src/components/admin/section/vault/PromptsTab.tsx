import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Clock, TrashIcon } from 'lucide-react';
import DynamicCodeBlock from '@/components/DynamicCodeBlock';
import type { VaultItem } from './types';

interface PromptsTabProps {
  items: VaultItem[];
  handleDelete: (id: string) => void;
}

export default function PromptsTab({ items, handleDelete }: PromptsTabProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (items?.length === 0) {
    return null; // The parent handles the empty state
  }

  return (
    <div className="grid gap-4">
      {items?.map((item) => (
        <Card
          key={item?._id}
          onClick={() => toggleExpand(item?._id)}
          className="p-4 bg-card border-border shadow-none transition-all hover:bg-muted/10 cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2 group" >
            <div className="flex-1 flex items-start gap-2">
              <div className="mt-1 text-muted-foreground flex-shrink-0">
                {expandedItems?.[item?._id] ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-medium text-foreground mb-1 flex items-center gap-2 group-hover:text-primary transition-colors">
                  {item?.title?.replace(/_/g, ' ')}
                </h3>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {new Date(item?.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 ml-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item?._id);
                }}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {expandedItems?.[item?._id] && (
            <div onClick={(e)=> e.stopPropagation()} className="pl-7 pr-2 mt-4 animate-in slide-in-from-top-2 duration-200 cursor-default">
              <div className="overflow-hidden rounded-md text-sm border border-border/50 bg-[#282a36]">
                <DynamicCodeBlock code={item?.content} language="json" />
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
