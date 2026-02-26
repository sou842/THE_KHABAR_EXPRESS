import { useState, useRef, useEffect } from "react";
import { CommandDialog } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, LinkIcon, ImageIcon, X, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { MultiTagEdit } from "./MultiTagSelector";

type ConfirmationDialogProps = {
  open: boolean;
  category: string;
  onOpenChange: (open: boolean) => void;
  handleSave: (data: {
    title: string;
    description: string;
    image: string;
  }) => void;
  confirmationData?: any;
  editConfirmation?: boolean;
  setCategory: (category: string) => void;
  defaultCategory?: string[];
  setDefaultCategory?: (type: string[]) => void;
};

const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const {
    open,
    category,
    onOpenChange,
    handleSave,
    setCategory,
    confirmationData,
    editConfirmation = false,
    defaultCategory,
    setDefaultCategory,
  } = props;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageType, setImageType] = useState<"url" | "upload">("url");
  const [localImage, setLocalImage] = useState<string>("");
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    image: "",
  });

  const resetForm = () => {
    setFormData({ title: "", description: "", image: "" });
    setLocalImage("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev: any) => ({ ...prev, image: imageUrl }));
    }
  };

  const saveImageUrl = () => {
    if (localImage.trim()) {
      setFormData((prev: any) => ({ ...prev, image: localImage.trim() }));
      setLocalImage("");
    }
  };

  const handleSubmit = () => {
    switch (true) {
      case !formData?.title:
        toast.info("Please enter the title");
        break;

      case !formData?.description:
        toast.info("Please enter the description");
        break;

      case !category:
        toast.info("Please select a category");
        break;

      case !formData?.image:
        toast.info("Please upload an image");
        break;

      default:
        handleSave(formData);
      // onOpenChange(false);
    }
  };

  useEffect(() => {
    if (editConfirmation && confirmationData) setFormData(confirmationData);
  }, [confirmationData]);

  const triggerFileUpload = () => fileInputRef.current?.click();

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="w-full p-6 space-y-5 overflow-y-scroll max-h-[450px] scroll-smooth">
        <h2 className="text-2xl font-semibold text-gray-800">Create Blog</h2>

        {/* Image Preview */}
        {formData?.image && (
          <div className="relative w-full max-w-[400px] mx-auto">
            <img
              src={formData?.image}
              className="rounded-lg w-full h-auto max-h-[240px] object-cover border"
              loading="lazy"
              alt="image Preview"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.pexels.com/photos/235985/pexels-photo-235985.jpeg?auto=compress&cs=tinysrgb&w=600";
              }}
            />
            <button
              aria-label="Remove Image"
              onClick={() =>
                setFormData((prev: any) => ({ ...prev, image: "" }))
              }
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Image Selection */}
        {!formData?.image && (
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-600">Image</label>

            {imageType === "url" ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Paste image URL here"
                  value={localImage}
                  onChange={(e) => setLocalImage(e.target.value)}
                  className="h-12"
                />
                <Button
                  onClick={saveImageUrl}
                  className="h-12 bg-primary text-white hover:bg-primary/90"
                >
                  Save
                </Button>
              </div>
            ) : (
              <>
                <div
                  className="border-2 border-dashed p-6 text-center cursor-pointer hover:bg-gray-50 rounded-lg"
                  onClick={triggerFileUpload}
                >
                  <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm">Drag and drop or click to upload</p>
                </div>
                <input
                  ref={fileInputRef}
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </>
            )}

            {/* Image Type Switch */}
            <div className="flex gap-4 pt-2">
              <Button
                onClick={() => setImageType("url")}
                variant={imageType === "url" ? "default" : "outline"}
                className="flex items-center gap-2 hover:bg-foreground/30"
              >
                <LinkIcon size={16} /> URL
              </Button>
              <Button
                disabled={true}
                onClick={() => setImageType("upload")}
                variant={imageType === "upload" ? "default" : "outline"}
                className="flex items-center gap-2 hover:bg-foreground/30"
              >
                <Upload size={16} /> Upload
              </Button>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Title</label>
          <Input
            placeholder="Enter your title"
            value={formData.title}
            autoFocus
            onChange={(e) =>
              setFormData((prev: any) => ({ ...prev, title: e.target.value }))
            }
            className="h-12 border-border/50 focus:border-accent"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">
            Description
          </label>
          <Textarea
            placeholder="Write your description..."
            value={formData.description}
            onChange={(e) =>
              setFormData((prev: any) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="min-h-32 resize-none border-border/50 focus:border-accent"
          />
        </div>

        <MultiTagEdit
          wrapCaterogy={true}
          category={category}
          setCategory={setCategory}
          defaultCategory={defaultCategory}
          setDefaultCategory={setDefaultCategory}
        />
      </div>

      {/* Submit */}
      <div className="w-full py-4 px-6 flex justify-end gap-2">
        <Button
          onClick={() => onOpenChange(false)}
          className="w-fit h-12 hover:bg-foreground/10"
          variant={"outline"}
        >
          Review
        </Button>
        <Button
          onClick={handleSubmit}
          className="w-fit h-12 bg-accent hover:bg-accent/90 text-white"
        >
          Save
        </Button>
      </div>
    </CommandDialog>
  );
};

export default ConfirmationDialog;
