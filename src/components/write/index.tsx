import React, { useState, useEffect, FC } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { poster } from "@/lib/helper";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";

const TextEditor = dynamic(() => import("@/components/BlogEditor/EditorJS"), {
  ssr: false,
});
const CommonEditor = dynamic(() => import("@/components/BlogEditor/CommonEditor"));
const JsonEditor = dynamic(() => import("@/components/BlogEditor/JsonEditor"));
const FileUploadDialog = dynamic(() => import("@/components/FileUploadDialog"), {
  ssr: false,
});
const CustomToggle = dynamic(() => import("@/components/CustomToggle"));

const Write: FC = () => {
  const [selected, setSelected] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("write-editor-preference") || "advance";
    }
    return "advance";
  });
  const [category, setCategory] = useState<string>("");
  const [defaultCategory, setDefaultCategory] = useState<string[]>([
    "technology",
    "health",
    "finance",
    "politics",
    "sports",
    "travel",
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const router = useRouter();

  // Save selection whenever it changes
  useEffect(() => {
    if (selected) {
      localStorage.setItem("write-editor-preference", selected);
    }
  }, [selected]);

  const formatString = (props: string) => {
    if (typeof props !== "string" || !props.trim()) {
      return uuidv4();
    }

    const format = props
      ?.trim()
      ?.replace(/\?/g, "")
      ?.replace(/&/g, "and")
      ?.replace(/\s+/g, "-")
      ?.toLowerCase();

    return `${format}-${uuidv4().split("-")[0]}`;
  };

  const handleContentSave = async (content: any) => {
    try {
      if (!content && !content?.content) return;
      if (!content?.category) return toast.info("Please select a category");

      setIsLoading(true);

      const data = {
        title: content?.thumbnail?.title || content?.title,
        body: content?.content,
        category: content?.category,
        tags: content?.tags || content?.category,
        author: content?.author || user?.name,
        authorId: content?.authorId || user?.id,
        editorType: content?.editorType || "EDITORJS",
        thumbnail: content?.thumbnail,
        views: content?.views || 0,
        videoUrl: content?.videoUrl || "",
        language: content?.language || "en",
        url: content?.url || formatString(content?.thumbnail?.title || content?.title),
        faqs: content?.faqs || []
      };

      const apiResult = await poster("/api/blogs", data);

      if (apiResult?.success) {
        localStorage.removeItem("draft");
        router.push(`/${user?.role}/dashboard`);
        setIsLoading(false);
      } else {
        toast.error("Something went wrong, please try again.");
      }

      toast.success("Editor added successfully!");
      setIsLoading(false);
    } catch (error) {
      toast.error("Failed to add editor");
      setIsLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="py-12 text-center text-muted-foreground">Saving article...</div>
    );

  return (
    < >
      <div className="relative">
        <CustomToggle
          defaultValue={selected || "advance"}
          options={["advance", "default", "JSON"]}
          onChange={(value) => setSelected(value)}
          className="sticky top-22 left-0 z-50"
        />
        {(() => {
          switch (selected.toLowerCase()) {
            case "advance":
              return (
                <TextEditor
                  category={category}
                  defaultCategory={defaultCategory}
                  setCategory={setCategory}
                  handleContentSave={handleContentSave}
                  setDefaultCategory={setDefaultCategory}
                />
              );
            case "json":
              return <JsonEditor handleContentSave={handleContentSave} />;
            default:
              return <CommonEditor />;
          }
        })()}
      </div>

      <FileUploadDialog />
    </>
  );
};

export default Write;
