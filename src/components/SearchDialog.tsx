import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { CommandDialog } from "@/components/ui/command";
import { X, Search, Loader } from "lucide-react";
import BlogCard from "./BlogCard";
import { getter, preventRerendering } from "@/lib/helper";
import { Skeleton } from "./Skeleton";

type SearchDialogProps = {
  open: boolean;
};

const categories = [
  {
    thumbnail: {
      _id: "technology",
      title: "Technology",
      image:
        "https://images.pexels.com/photos/1181271/pexels-photo-1181271.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  },
  {
    thumbnail: {
      _id: "health",
      title: "Health",
      image:
        "https://images.pexels.com/photos/3759657/pexels-photo-3759657.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  },
  {
    thumbnail: {
      _id: "finance",
      title: "Finance",
      image:
        "https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  },
  {
    thumbnail: {
      _id: "politics",
      title: "Politics",
      image:
        "https://images.pexels.com/photos/1586034/pexels-photo-1586034.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  },
  {
    thumbnail: {
      _id: "entertainment",
      title: "Entertainment",
      image:
        "https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=600",
    },
  },
];

const SearchDialog = ({ open }: SearchDialogProps) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, replace, pathname, push } = router;
  const [search, setSearch] = useState<string>((query.q as string) || "");
  const [searchQuery, setSearchQuery] = useState<string>(
    (query.q as string) || ""
  );

  const { data: recentPosts, isLoading: loading } = useSWR(
    `/api/blogs?limit=7&status=approved`,
    getter,
    preventRerendering
  );

  const { data: searchResult, isLoading: searchLoading } = useSWR(
    searchQuery ? `/api/blogs/search/${searchQuery?.trim()}` : null,
    getter,
    preventRerendering
  );

  const handleSelect = (productId: string) => {
    router.push(`/blog/${productId}`);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setSearchQuery(search);
      push(
        {
          pathname: pathname,
          query: { ...query, search: "true", q: search?.trim() },
        },
        undefined,
        { shallow: true }
      );
    }
  };

  const handleResetBack = () => {
    setSearch("");
    setSearchQuery("");

    const { search, q, ...rest } = query;
    push({ pathname: pathname, query: rest }, undefined, {
      shallow: true,
    });
  };

  useEffect(() => {
    if (open && inputRef?.current) {
      inputRef?.current?.focus();
    }
  }, [open, inputRef?.current]);

  return (
    <CommandDialog open={open} onOpenChange={handleResetBack}>
      {/* Search Bar */}
      <div className="flex items-center gap-4 px-6 py-6 border-b border-border bg-background shrink-0 sticky top-0 z-10">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background shrink-0">
          {searchLoading ? (
            <Loader className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </div>
        <input
          ref={inputRef}
          value={search}
          placeholder="Search all topics here"
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          className="flex-1 h-10 w-full bg-transparent text-lg md:text-xl outline-none placeholder:text-muted-foreground/60 text-foreground"
        />
        <button
          onClick={handleResetBack}
          className="p-1 rounded-sm text-muted-foreground hover:text-foreground shrink-0 transition-colors"
          aria-label="Close search"
        >
          <X className="h-5 w-5 opacity-70" />
        </button>
      </div>

      {/* Search Results or Recent Posts */}
      <div className="w-full h-full md:max-h-[380px] md:min-h-[250px] px-6 overflow-y-auto scroll-smooth py-6 bg-background">
        {searchQuery ? (
          searchLoading ? (
            <div className="space-y-4">
              <Skeleton repeat={3} type="category-compact-skeleton" />
            </div>
          ) : searchResult?.data?.length === 0 ? (
            <div className="w-full text-center py-8 text-muted-foreground font-serif italic text-lg border border-dashed border-border rounded-sm">
              No stories found for "{searchQuery}".
            </div>
          ) : (
            <div className="space-y-4">
              {searchResult?.data?.map((result: any, index: number) => (
                <div
                  key={index}
                  onClick={() => handleSelect(result?.url)}
                  className="cursor-pointer"
                >
                  <BlogCard blog={result} variant="searchItem" />
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories?.map((category: any, index: number) => (
              <button
                key={index}
                onClick={() => {
                  setSearch(category?.thumbnail?.title);
                  setSearchQuery(category?.thumbnail?.title);
                  if (inputRef?.current) inputRef?.current?.focus();
                }}
                className="relative overflow-hidden aspect-[4/3] rounded-lg group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={category?.thumbnail?.image}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={category?.thumbnail?.title}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <span className="text-white font-bold uppercase tracking-widest text-xs sm:text-sm text-center drop-shadow-md">
                    {category?.thumbnail?.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </CommandDialog>
  );
};

export default SearchDialog;
