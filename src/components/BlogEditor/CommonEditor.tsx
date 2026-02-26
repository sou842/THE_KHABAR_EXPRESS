import React, { useState, useEffect } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { X } from "lucide-react";

const categories = [
  { id: "technology", name: "Technology" },
  { id: "health", name: "Health" },
  { id: "finance", name: "Finance" },
  { id: "lifestyle", name: "Lifestyle" },
  { id: "sports", name: "Sports" },
  { id: "politics", name: "Politics" },
  { id: "entertainment", name: "Entertainment" },
];

const formFields = [
  {
    id: "title",
    label: "Blog Title *",
    type: "text",
    placeholder: "Enter a title",
    required: true,
    size: 100,
  },
  {
    id: "excerpt",
    label: "Excerpt/Summary *",
    type: "textarea",
    placeholder: "Write a short summary (100-150 characters)",
    required: true,
    rows: 2,
    size: 100,
  },
  {
    id: "content",
    label: "Blog Content *",
    type: "textarea",
    placeholder: "Write your blog content here",
    required: true,
    rows: 6,
    size: 100,
  },
  {
    id: "category",
    label: "Category *",
    type: "select",
    options: categories,
    required: true,
    size: 100,
  },
  // {
  //   id: "tags",
  //   label: "Tags",
  //   type: "text",
  //   placeholder: "Separate tags with commas",
  //   size: 48,
  // },
];

const CommonEditor: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "technology",
    tags: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearData = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "technology",
      tags: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    toast.success("Blog submitted for approval!", {
      description: "Your blog will be reviewed by an admin before publishing.",
    });
    setTimeout(() => {
      router.push("/editor/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Create New Blog</h1>
          <p className="text-muted-foreground">
            Fill in the details to submit your blog for approval
          </p>
        </div>
        <button
          onClick={() => router.push("/editor/dashboard")}
          className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <div className="flex flex-wrap justify-between space-y-6 bg-card rounded-md shadow-sm p-6">
          {formFields &&
            formFields?.map((field: any) => (
              <div style={{ flexBasis: `${field.size}%` }} key={field.id}>
                <label
                  htmlFor={field?.id}
                  className="block text-sm font-semibold mb-1.5 text-foreground/75"
                >
                  {field?.label}
                </label>
                {(() => {
                  switch (field.type) {
                    case "textarea":
                      return (
                        <textarea
                          id={field.id}
                          value={(formData as any)[field.id]}
                          onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                          }
                          className="w-full p-3 border rounded-md"
                          placeholder={field.placeholder}
                          required={field.required}
                          rows={field.rows}
                        />
                      );
                    case "select":
                      return (
                        <select
                          id={field.id}
                          value={(formData as any)[field.id]}
                          onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                          }
                          className="w-full h-12 p-3 border rounded-md bg-card cursor-pointer"
                          required={field?.required}
                        >
                          {field?.options?.map((opt: any) => (
                            <option key={opt.id} value={opt.id}>
                              {opt?.name}
                            </option>
                          ))}
                        </select>
                      );
                    default:
                      return (
                        <input
                          id={field.id}
                          type={field.type}
                          value={(formData as any)[field.id]}
                          onChange={(e) =>
                            handleInputChange(field.id, e.target.value)
                          }
                          className="w-full h-12 p-3 border rounded-md"
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      );
                  }
                })()}
              </div>
            ))}
        </div>

        <div className="relative space-y-6 bg-card rounded-md shadow-sm p-6">
          <h3 className="block text-lg font-semibold mb-4 text-foreground/75">
            Featured Image
          </h3>
          <div className="max-h-[400px] overflow-scroll">
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto min-h-48 object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.pexels.com/photos/235985/pexels-photo-235985.jpeg?auto=compress&cs=tinysrgb&w=600";
                  }}
                />

                <button
                  className={`absolute p-1 z-20 top-6.5 right-7.5 text-foreground/70 text-2xl font-bold hover:bg-foreground/5 rounded-full cursor-pointer`}
                  onClick={(e) => {
                    setImagePreview("");
                    e.preventDefault();
                  }}
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div
                className="border-2 border-dashed p-6 text-center cursor-pointer"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm">
                  Drag and drop an image, or click to browse
                </p>
              </div>
            )}
          </div>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => handleClearData()}
            className="px-6 py-2 border rounded-md cursor-pointer"
          >
            Clear
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-khabar-500 text-white rounded-md cursor-pointer"
          >
            Submit for Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommonEditor;
