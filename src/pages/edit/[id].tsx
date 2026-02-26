import CommonEditor from "@/components/BlogEditor/CommonEditor";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import CustomToggle from "@/components/CustomToggle";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import { toast } from "sonner";
import { getter, putter } from "@/lib/helper";
import { useAuth } from "@/contexts/AuthContext";
import { Router } from "lucide-react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/Skeleton";

const TextEditor = dynamic(() => import("@/components/BlogEditor/EditorJS"), {
  ssr: false,
});

const Edit: React.FC = () => {
  const params = useParams<{ id: string }>();
  const { data, isLoading } = useSWR<any>(`/api/blogs/${params?.id}`, getter);
  const [loading, setLoading] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("");
  const { user } = useAuth();
  const router = useRouter();

  const handleContentSave = async (content: any) => {
    try {
      if (!content && !content?.content) return;
      if (!content?.category) return toast.info("Please select a category");

      setLoading(true);
 
      const body = {
        title: content?.thumbnail?.title,
        body: content?.content,
        category: content?.category,
        tags: content?.category,
        thumbnail: content?.thumbnail,
        videoUrl: "",
        language: "en",
        status: 'pending',
        faqs: content?.faqs
      };

      const apiResult = await putter(`/api/blogs/${data?.data?._id}`, body);

      if (apiResult?.success) {
        setLoading(false);
        router.push(`/${user?.role}/dashboard?tab=blogs`);
      } else {
        toast.error("Something went wrong, please try again.");
      }

      setLoading(false);
      toast.success("Editor added successfully!");
    } catch (error) {
      setLoading(false);
      toast.error("Failed to add editor");
    }
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      //   behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (!!data) setCategory(data?.data?.category);
    if (data && !data?.success) {
      router.replace("/edit");
    }

  }, [data]);
  if (loading)
    return (
      <Layout>
        <Skeleton type="write-submit-skeleton" />
      </Layout>
    );

  return (
    <Layout>
      <div className="relative w-full m-auto max-w-3xl">
        {!isLoading ? (
          <TextEditor
            editMode={true}
            category={category}
            editContent={data?.data?.body}
            setCategory={setCategory}
            handleContentSave={handleContentSave}
            confirmationData={data?.data?.thumbnail}
            faqs={data?.data?.faqs || []}
          />
        ) : (
          <Skeleton type="individual-blog" />
        )}
      </div>
    </Layout>
  );
};

export default PrivateRoute(Edit);
