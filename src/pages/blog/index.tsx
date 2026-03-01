import { FC, useState, useMemo, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import {
  Search,
  SlidersHorizontal,
  Loader2,
  X,
  Tag as TagIcon,
  ChevronRight,
  TrendingUp,
  Clock,
  LayoutGrid
} from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { getter } from "@/lib/helper";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import { debounce } from "lodash";
import { motion, AnimatePresence } from "framer-motion";

const BlogArchive: FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const PAGE_SIZE = 12;

  // Fetch Categories and Tags
  const { data: categoriesData } = useSWR("/api/blogs/category", getter);
  const { data: tagsData } = useSWR("/api/blogs/tags", getter);

  const categories = categoriesData?.data || [];
  const tags = tagsData?.data || [];

  // Search Debounce
  const debouncedSearch = useMemo(
    () => debounce((value: string) => setActiveSearch(value), 500),
    []
  ) as any;

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  // Infinite Scroll Hook
  const getKey = useCallback((pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.data.length) return null;

    let url = `/api/blogs?status=approved&page=${pageIndex + 1}&limit=${PAGE_SIZE}`;
    if (activeSearch) url += `&search=${encodeURIComponent(activeSearch)}`;
    if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
    if (selectedTag) url += `&tag=${encodeURIComponent(selectedTag)}`;

    return url;
  }, [activeSearch, selectedCategory, selectedTag]);

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(
    getKey,
    getter
  );

  const blogs = useMemo(() => {
    let allBlogs = data ? data.flatMap((page) => page.data) : [];

    if (sortBy === "oldest") {
      return [...allBlogs].sort((a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return allBlogs;
  }, [data, sortBy]);

  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
  const isEmpty = data?.[0]?.data?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.data?.length < PAGE_SIZE);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedTag("");
    setSortBy("recent");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <Layout title="Archive | Khabar Express" path="blog">

      <div className="khabar-container py-10 md:py-12">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Enhanced Sticky Sidebar */}
          <aside className="lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-8">
              {/* Mobile Filter Trigger */}
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="lg:hidden w-full flex items-center justify-between p-4 bg-muted/50 border border-border rounded-xl cursor-pointer"
              >
                <div className="flex items-center gap-2 font-bold">
                  <SlidersHorizontal className="h-5 w-5" />
                  <span>Advanced Filters</span>
                </div>
                <ChevronRight className={`h-5 w-5 transition-transform ${isMobileFilterOpen ? 'rotate-90' : ''}`} />
              </button>

              <div className={`${isMobileFilterOpen ? 'block' : 'hidden'} lg:block animate-in fade-in slide-in-from-top-4 lg:animate-none space-y-8`}>
                {/* Category Section */}
                <div className="bg-muted/10 p-6 rounded-2xl border border-border/40 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-5">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Categories</h3>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${selectedCategory === ""
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-primary/5 hover:text-primary"
                        }`}
                    >
                      <span>All Categories</span>
                      {selectedCategory === "" && <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                    </button>
                    {categories.map((cat: any) => (
                      <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all capitalize cursor-pointer ${selectedCategory === cat.name
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-primary/5 hover:text-primary"
                          }`}
                      >
                        <span>{cat.name}</span>
                        {selectedCategory === cat.name && <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Section */}
                <div className="bg-muted/10 p-6 rounded-2xl border border-border/40 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-5">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Sort Order</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSortBy("recent")}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${sortBy === "recent"
                        ? "bg-primary/10 border-primary text-primary shadow-inner"
                        : "bg-background border-border hover:border-primary/40"
                        }`}
                    >
                      <Clock className="h-5 w-5 mb-1" />
                      <span>Newest</span>
                    </button>
                    <button
                      onClick={() => setSortBy("oldest")}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${sortBy === "oldest"
                        ? "bg-primary/10 border-primary text-primary shadow-inner"
                        : "bg-background border-border hover:border-primary/40"
                        }`}
                    >
                      <TrendingUp className="h-5 w-5 mb-1 rotate-180" />
                      <span>Oldest</span>
                    </button>
                  </div>
                </div>

                {/* Tags Section */}
                <div className="bg-muted/10 p-6 rounded-2xl border border-border/40 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-5">
                    <TagIcon className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Trending Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTag("")}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${selectedTag === ""
                        ? "bg-foreground text-background border-foreground shadow-sm"
                        : "border-border hover:border-primary hover:text-primary"
                        }`}
                    >
                      #all
                    </button>
                    {tags?.map((tag: string) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${selectedTag === tag
                          ? "bg-foreground text-background border-foreground shadow-sm"
                          : "border-border hover:border-primary hover:text-primary"
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {(selectedCategory || selectedTag || activeSearch) && (
                  <button
                    onClick={clearFilters}
                    className="w-full flex items-center justify-center gap-2 p-4 text-sm font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors group cursor-pointer"
                  >
                    <X className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {/* Active Filters Bar */}
            <div className="mb-10 flex flex-wrap items-center gap-3">
              <AnimatePresence>
                {activeSearch && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-2 pl-4 pr-2 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-wider"
                  >
                    <span>Search: {activeSearch}</span>
                    <button onClick={() => setSearchTerm("")} className="p-1 hover:bg-primary/10 rounded-full cursor-pointer"><X className="h-3 w-3" /></button>
                  </motion.div>
                )}
                {selectedCategory && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-2 pl-4 pr-2 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-wider"
                  >
                    <span>Category: {selectedCategory}</span>
                    <button onClick={() => setSelectedCategory("")} className="p-1 hover:bg-primary/10 rounded-full cursor-pointer"><X className="h-3 w-3" /></button>
                  </motion.div>
                )}
                {selectedTag && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-2 pl-4 pr-2 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-xs font-bold uppercase tracking-wider"
                  >
                    <span>Tag: #{selectedTag}</span>
                    <button onClick={() => setSelectedTag("")} className="p-1 hover:bg-primary/10 rounded-full cursor-pointer"><X className="h-3 w-3" /></button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isLoading && (
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-auto">
                  {blogs.length} articles discovered
                </span>
              )}
            </div>

            {/* Grid with Framer Motion */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {blogs.map((post: any, index: number) => (
                <motion.div key={post._id || index} variants={itemVariants}>
                  <BlogCard blog={post} />
                </motion.div>
              ))}

              {/* Skeletons */}
              {isLoading && blogs.length === 0 && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-muted/40 h-[450px] rounded-2xl border border-border/50"></div>
                  ))}
                </>
              )}
            </motion.div>

            {/* Empty State */}
            {!isLoading && blogs.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-32 text-center bg-muted/5 rounded-[40px] border border-dashed border-border group"
              >
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-[30px] bg-muted mb-8 group-hover:rotate-12 transition-transform duration-500">
                  <Search className="h-10 w-10 text-muted-foreground/30" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter">No Matches Found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-10 font-medium">
                  We've searched high and low, but couldn't find anything matching your filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-8 py-3 bg-foreground text-background rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg shadow-foreground/10"
                >
                  Clear Discovery Filters
                </button>
              </motion.div>
            )}

            {/* Load More Section */}
            {!isReachingEnd && blogs.length > 0 && (
              <div className="mt-20 flex justify-center pb-20">
                <button
                  onClick={() => setSize(size + 1)}
                  disabled={isLoadingMore}
                  className="group relative flex items-center gap-3 px-12 py-5 bg-foreground text-background rounded-[20px] font-black uppercase tracking-widest text-[13px] transition-all hover:translate-y-[-5px] active:translate-y-[0px] disabled:opacity-50 cursor-pointer shadow-2xl hover:shadow-primary/20"
                >
                  <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="relative z-10">Searching archives...</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Load More Articles</span>
                      <ChevronRight className="relative z-10 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}

            {isReachingEnd && !isEmpty && blogs.length > 0 && (
              <div className="mt-20 text-center pb-20">
                <div className="inline-block px-8 py-4 bg-muted/20 border border-border/50 rounded-full">
                  <p className="text-muted-foreground text-xs font-black uppercase tracking-widest leading-none">
                    ✨ You have reached the core of our knowledge base
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default BlogArchive;
