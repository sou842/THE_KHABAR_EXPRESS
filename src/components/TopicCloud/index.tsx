import React, { FC, useEffect, useState } from "react";
import Link from "next/link";
import { Hash, Loader2 } from "lucide-react";

interface Tag {
  tag: string;
  count: number;
}

const TopicCloud: FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/blogs/tags");
        const data = await res.json();
        if (data?.success) {
          const sortedTags = (data?.data as Tag[])
            ?.sort((a, b) => b?.count - a?.count)
            ?.slice(0, 15);
          setTags(sortedTags);
        }
      } catch (error) {
        console.error("Failed to fetch tags for cloud:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (tags?.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-primary rounded-full" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
          Trending Topics
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags?.map((tag) => (
          <Link
            key={tag?.tag}
            href={`/topic/${encodeURIComponent(tag?.tag)}`}
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border border-border rounded-full hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300"
          >
            <Hash className="h-3 w-3 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
            <span className="text-xs font-semibold capitalize">
              {tag?.tag}
            </span>
            <span className="text-[10px] opacity-60 font-mono">
              ({tag?.count})
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopicCloud;
