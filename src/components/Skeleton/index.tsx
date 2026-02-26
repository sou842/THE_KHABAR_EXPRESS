import React from "react";

interface skeletonProps {
  type?: string;
  repeat?: number;
}

const BlogCardSkeleton = ({ type }: { type?: string }) => {
  switch (type) {
    case "featured":
      return <div className="w-full h-36 bg-gray-200 rounded-sm"></div>;
    case "compact":
      return (
        <div className="w-full flex flex-row gap-2">
          <div className="w-16 h-16 bg-gray-300 rounded-sm"></div>
          <div className="w-full flex flex-col gap-2">
            <div className="w-[80%] h-4 bg-gray-200 rounded-sm"></div>
            <div className="flex flex-row items-center gap-2">
              <div className="w-10 h-3 bg-gray-200 rounded-sm"></div>
              <div className="w-16 h-4 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>
      );
    case "analytics":
      return <div className="w-full h-23 bg-gray-200 rounded-sm"></div>;
    default:
      return (
        <div className="w-full flex flex-col gap-2">
          <div className="w-full h-36 bg-gray-300 rounded-sm"></div>
          <div className="h-5 w-14 max-w-4xl bg-gray-300 rounded"></div>
          <div className="h-6 w-full bg-gray-200 rounded-sm my-2"></div>
          <div className="h-3 w-[90%] bg-gray-200 rounded-sm"></div>
          <div className="h-3 w-[60%] bg-gray-200 rounded-sm"></div>
          <div className="w-full flex flex-row justify-between">
            <div className="h-3 w-18 bg-gray-300 rounded-sm"></div>
            <div className="h-3 w-8 bg-gray-300 rounded-sm"></div>
          </div>
        </div>
      );
  }
};

export const Skeleton: React.FC<skeletonProps> = (props) => {
  const { type, repeat = 3 } = props;

  switch (type) {
    case "individual-blog":
      return (
        <div className="min-h-auto pb-8">
          <div className="animate-pulse flex flex-col gap-4">
            <div className="h-5 w-14 max-w-4xl bg-gray-200 rounded"></div>

            <div className="h-12 w-full bg-gray-200 rounded-sm"></div>

            <div className="flex flex-col gap-2">
              <div className="h-3 w-[95%] bg-gray-200 rounded-sm"></div>
              <div className="h-3 w-[80%] bg-gray-200 rounded-sm"></div>
              <div className="h-3 w-[40%] bg-gray-200 rounded-sm"></div>
            </div>

            <div className="h-64 w-full max-w-4xl bg-gray-200 rounded-sm"></div>

            <div className="flex flex-col gap-2">
              <div className="h-3 w-full bg-gray-200 rounded-sm"></div>
              <div className="h-3 w-full bg-gray-200 rounded-sm"></div>
              <div className="h-3 w-[40%] bg-gray-200 rounded-sm"></div>
            </div>
          </div>
        </div>
      );
    case "individual-blog-suggestion":
      return (
        <div className="min-h-auto pb-8">
          <div className="animate-pulse w-full flex flex-col md:flex-row gap-4">
            {Array?.from({ length: repeat })?.map((_, index) => (
              <BlogCardSkeleton key={index} />
            ))}
          </div>
        </div>
      );
    case "category-default-skeleton":
      return (
        <div className="min-h-auto pb-8">
          <div className="animate-pulse w-full flex flex-col md:flex-row gap-4">
            {Array?.from({ length: repeat })?.map((_, index) => (
              <BlogCardSkeleton key={index} />
            ))}
          </div>
        </div>
      );
    case "category-featured-skeleton":
      return (
        <div className="min-h-auto pb-8">
          <div className="animate-pulse w-full flex flex-col md:flex-row gap-4">
            {Array?.from({ length: repeat })?.map((_, index) => (
              <BlogCardSkeleton type="featured" key={index} />
            ))}
          </div>
        </div>
      );
    case "category-compact-skeleton":
      return (
        <div className="min-h-auto pb-8">
          <div className="animate-pulse w-full flex flex-col gap-4">
            {Array?.from({ length: repeat })?.map((_, index) => (
              <BlogCardSkeleton type="compact" key={index} />
            ))}
          </div>
        </div>
      );
    case "category-page":
      return (
        <div className="min-h-auto pt-16 pb-6">
          <div className="animate-pulse w-full flex flex-col gap-4">
            <div className="h-12 w-50 m-auto bg-gray-300 rounded-sm"></div>
            <div className="h-4 w-full max-w-3xl m-auto bg-gray-200 rounded-sm"></div>
            <div className="h-4 w-full max-w-3xs m-auto bg-gray-200 rounded-sm"></div>

            <div className="w-full flex flex-col md:flex-row justify-between gap-2 mt-10 mb-2">
              <div className="h-8 md:h-10 w-30 bg-gray-300 rounded-full"></div>
              <div className="h-8 md:h-10 w-25 bg-gray-300 rounded"></div>
            </div>

            <div className="w-full flex flex-col md:flex-row gap-4">
              {Array?.from({ length: 3 })?.map((_, index) => (
                <BlogCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      );
    case "analytics-skeleton":
      return (
        <div className="min-h-auto pb-0">
          <div className="animate-pulse w-full flex flex-col md:flex-row gap-4">
            {Array?.from({ length: repeat })?.map((_, index) => (
              <BlogCardSkeleton type="analytics" key={index} />
            ))}
          </div>
        </div>
      );
    case "write-submit-skeleton":
      return (
        <div className="min-h-[300px] max-h-screen h-full flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-3">
              <div className="w-4 h-4 bg-gray-600 rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce [animation-delay:0.6s]"></div>
            </div>
          </div>
        </div>
      );
    case "home":
      return (
        <div className="w-full flex flex-col min-h-screen">
          <div className="animate-pulse w-full border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                <div className="lg:col-span-3">
                  <div className="bg-foreground/20 aspect-video rounded-sm w-full h-full"></div>
                </div>
                <div className="lg:col-span-2 space-y-5">
                  <div className="h-4 w-20 bg-foreground/10 rounded"></div>
                  <div className="h-10 w-full bg-foreground/20 rounded"></div>
                  <div className="h-10 w-3/4 bg-foreground/20 rounded"></div>
                  <div className="space-y-2 mt-4">
                    <div className="h-4 w-full bg-foreground/10 rounded"></div>
                    <div className="h-4 w-5/6 bg-foreground/10 rounded"></div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-foreground/10 rounded"></div>
                      <div className="h-3 w-32 bg-foreground/10 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="animate-pulse w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="mb-8 space-y-2">
              <div className="h-4 w-24 bg-foreground/10 rounded"></div>
              <div className="h-8 w-64 bg-foreground/20 rounded"></div>
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-6 pb-6 border-b border-border last:border-0">
                  <div className="hidden sm:block w-24 md:w-32 aspect-square bg-foreground/20 rounded-sm shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-16 bg-foreground/10 rounded"></div>
                    <div className="h-6 w-full max-w-xl bg-foreground/20 rounded"></div>
                    <div className="h-4 w-full max-w-lg bg-foreground/10 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="animate-pulse w-full border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <div className="h-6 w-32 bg-foreground/20 rounded mb-6"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-5 w-full max-w-md bg-foreground/20 rounded"></div>
                        <div className="h-3 w-24 bg-foreground/10 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-foreground/5 border border-border rounded-sm p-8 flex flex-col justify-center">
                  <div className="h-6 w-48 bg-foreground/20 rounded mb-3"></div>
                  <div className="h-4 w-full max-w-xs bg-foreground/10 rounded mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-12 w-full bg-foreground/10 border border-border rounded-sm"></div>
                    <div className="h-12 w-full bg-foreground/20 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="animate-pulse w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <div className="mb-8 space-y-2">
              <div className="h-4 w-20 bg-foreground/10 rounded"></div>
              <div className="h-8 w-56 bg-foreground/20 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-video bg-foreground/20 rounded-sm w-full"></div>
                  <div className="h-3 w-20 bg-foreground/10 rounded"></div>
                  <div className="h-5 w-full bg-foreground/20 rounded"></div>
                  <div className="h-4 w-full max-w-[80%] bg-foreground/10 rounded"></div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-3 w-16 bg-foreground/10 rounded"></div>
                    <div className="h-3 w-24 bg-foreground/10 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex space-x-3">
              <div className="w-4 h-4 bg-gray-600 rounded-full animate-bounce"></div>
              <div className="w-4 h-4 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              <div className="w-4 h-4 bg-gray-400 rounded-full animate-bounce [animation-delay:0.6s]"></div>
            </div>
          </div>
        </div>
      );
  }
};
