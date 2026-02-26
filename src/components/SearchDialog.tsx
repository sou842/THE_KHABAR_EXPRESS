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
      <div className="flex items-center px-4 pt-2">
        <button
          // onClick={handleResetBack}
          className="p-2 rounded-full bg-foreground hover:bg-foreground/50"
        >
          {searchLoading ? (
            <Loader className="h-4 w-4 opacity-70 text-white animate-spin" />
          ) : (
            <Search className="h-4 w-4 opacity-70 text-white" />
          )}
        </button>
        <input
          ref={inputRef}
          value={search}
          placeholder="Search all topics here"
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearch}
          className="flex h-11 w-full rounded-md bg-transparent py-3 pl-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        {true && (
          <button
            onClick={handleResetBack}
            className="p-2 rounded-full hover:bg-foreground/5"
          >
            <X className="h-4 w-4 opacity-50" />
          </button>
        )}
      </div>

      {/* Horizontal Scroll Categories */}
      <div className="w-full px-4 pt-3 pb-2">
        <div
          id="hide_scrollbar"
          className="flex flex-row gap-3 overflow-x-auto scrollbar-hide"
        >
          {categories.map((category: any, index: number) => (
            <div
              onClick={handleResetBack}
              key={index}
              className="w-[130px] h-[80px] shrink-0"
            >
              <BlogCard
                key={category.thumbnail._id}
                blog={category}
                variant="category"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Search Results or Recent Posts */}
      <div className="w-full h-full md:max-h-[300px] md:min-h-[150px] px-4 overflow-y-scroll scroll-smooth rounded-4xl py-2">
        {searchQuery ? (
          searchLoading ? (
            <Skeleton repeat={5} type="category-compact-skeleton" />
          ) : searchResult?.data?.length === 0 ? (
            <div className="w-fit m-auto text-muted-foreground text-md">
              No search results found.
            </div>
          ) : (
            searchResult?.data?.map((result: any, index: number) => (
              <div
                key={index}
                onClick={() => handleSelect(result?.url)}
                className="flex items-center gap-3 py-2 cursor-pointer"
              >
                <BlogCard blog={result} variant="compact" />
              </div>
            ))
          )
        ) : loading ? (
          <Skeleton repeat={5} type="category-compact-skeleton" />
        ) : recentPosts?.data?.length === 0 ? (
          <div className="w-fit m-auto text-muted-foreground text-md">
            No search results found.
          </div>
        ) : (
          recentPosts?.data?.map((result: any, index: number) => (
            <div
              key={index}
              onClick={() => handleSelect(result?.url)}
              className="flex items-center gap-3 py-2 cursor-pointer"
            >
              <BlogCard blog={result} variant="compact" />
            </div>
          ))
        )}
      </div>
    </CommandDialog>
  );
};

export default SearchDialog;
