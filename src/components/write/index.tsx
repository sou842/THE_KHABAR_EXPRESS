import CommonEditor from "@/components/BlogEditor/CommonEditor";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import CustomToggle from "@/components/CustomToggle";

import { toast } from "sonner";
import { poster } from "@/lib/helper";
import { useAuth } from "@/contexts/AuthContext";

import { useRouter } from "next/router";
import { Skeleton } from "@/components/Skeleton";
import { v4 as uuidv4 } from "uuid";
import FileUploadDialog from "@/components/FileUploadDialog";

const TextEditor = dynamic(() => import("@/components/BlogEditor/EditorJS"), {
  ssr: false,
});

const Write: React.FC = () => {
  const [selected, setSelected] = useState<string>("");
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
        title: content?.thumbnail?.title,
        body: content?.content,
        category: content?.category,
        tags: content?.category,
        author: user?.name,
        authorId: user?.id,
        editorType: content?.editorType,
        thumbnail: content?.thumbnail,
        views: 0,
        videoUrl: "",
        language: "en",
        url: formatString(content?.thumbnail?.title),
        faqs: content?.faqs
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
      <Layout>
        <Skeleton type="write-submit-skeleton" />
      </Layout>
    );

  return (
    < >
      <div className="relative">
        <CustomToggle
          defaultValue="advance"
          options={["advance", "default"]}
          onChange={(value) => setSelected(value)}
          className="sticky top-22 left-0 z-50"
        />
        {selected === "advance" ? (
          <TextEditor
            category={category}
            defaultCategory={defaultCategory}
            setCategory={setCategory}
            handleContentSave={handleContentSave}
            setDefaultCategory={setDefaultCategory}
          />
        ) : (
          <CommonEditor />
        )}
      </div>

      <FileUploadDialog />
    </>
  );
};

export default Write;
