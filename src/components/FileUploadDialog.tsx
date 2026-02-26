import AWS from "@/lib/aws.config";
import {
  useState,
  useCallback,
  useEffect,
  DragEvent,
  ChangeEvent,
} from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Upload,
  File,
  X,
  Cloud,
  Copy,
  ExternalLink,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { v4 as uuidv4 } from 'uuid';

interface UploadedFile {
  url: string;
  name: string;
  timestamp: number;
}

const FileUploadDialog = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFullUrl, setShowFullUrl] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const storedFiles = localStorage.getItem("khabarRecentUploads");
      if (storedFiles) {
        setRecentFiles(JSON.parse(storedFiles));
      }
    } catch (error) {
      localStorage.removeItem("khabarRecentUploads");
      toast.error("Something went wrong", {
        description: "Please try again",
      });
    }
  }, []);

  const updateRecentFiles = (newFile: UploadedFile) => {
    try {
      const updatedFiles = [newFile, ...(recentFiles || [])].slice(0, 5);
      setRecentFiles(updatedFiles);
      localStorage.setItem("khabarRecentUploads", JSON.stringify(updatedFiles));
    } catch (error) {
      toast.error("Failed to save file history");
    }
  };

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (!url) return "";
    if (url?.length <= maxLength) return url;
    const start = url?.substring(0, maxLength / 2);
    const end = url?.substring(url?.length - maxLength / 2);
    return `${start}...${end}`;
  };

  const formatDate = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return "Unknown date";
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event?.target?.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

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

    return `the-khabar-express-${uuidv4().split("-")[0]}-${format}`;
  };

  const handleFileUpload = async (file: File) => {
    const bucketName = process.env.NEXT_PUBLIC_BUCKET_NAME;
    if (!file) return;

    if (!bucketName) {
      toast.error("Bucket name is not configured");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const params = {
      Bucket: bucketName,
      Key: formatString(file?.name),
      Body: file,
      ContentType: file?.type,
    };

    try {
      const parallelUploadS3 = new AWS.S3.ManagedUpload({
        params,
        partSize: 5 * 1024 * 1024, // 5MB chunks
      });

      parallelUploadS3.on("httpUploadProgress", (progress) => {
        if (progress.total) {
          const percentage = Math.round(
            (progress.loaded / progress.total) * 100
          );
          setUploadProgress(percentage);
        }
      });

      const data = await parallelUploadS3.promise();
      const fileUrl = data.Location;

      updateRecentFiles({
        url: fileUrl,
        name: file?.name,
        timestamp: Date?.now(),
      });

      toast.success("File uploaded successfully");
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) {
      toast.error("No URL to copy");
      return;
    }

    try {
      navigator.clipboard.writeText(text);
      toast.success("URL copied to clipboard");
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy URL");
    }
  };

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e?.dataTransfer?.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="w-fit fixed bottom-6 right-4 z-50 bg-khabar-600 text-white p-4 rounded-full hover:bg-khabar-700 transition-colors shadow-lg hover:shadow-xl">
          <Upload className="w-6 h-6" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-6"
        side="top"
        align="end"
        sideOffset={10}
      >
        <div className="grid gap-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Upload File</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your file here or click to browse
            </p>
          </div>

          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
              isDragging
                ? "border-gov-primary bg-gov-primary/5"
                : "border-gray-200 hover:border-gov-primary/50",
              selectedFile ? "border-green-500 bg-green-50" : ""
            )}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <label className="block w-full h-full cursor-pointer">
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              {selectedFile ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <File className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {selectedFile?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile?.size / 1024)?.toFixed(1)} KB
                      </p>
                    </div>
                    {!isUploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>

                  {isUploading && (
                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Cloud className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Drag and drop your file here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to browse
                    </p>
                  </div>
                </div>
              )}
            </label>
          </div>

          {recentFiles?.length > 0 && (
            <div className="mt-0 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4" />
                <span>Recent Uploads</span>
              </div>
              <div className="space-y-3 max-h-[120px] overflow-y-auto pr-2">
                {recentFiles &&
                  recentFiles?.map((file, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium truncate max-w-[200px]">
                            {file?.name}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(file?.url)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            title="Copy URL"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                          <a
                            href={file?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-500" />
                          </a>
                        </div>
                      </div>
                      <div
                        className="relative group"
                        onClick={() =>
                          setShowFullUrl(
                            showFullUrl === file?.url ? null : file?.url
                          )
                        }
                      >
                        <p
                          className={cn(
                            "text-xs text-gov-primary break-all cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors",
                            showFullUrl === file?.url
                              ? "whitespace-normal"
                              : "whitespace-nowrap overflow-hidden text-ellipsis"
                          )}
                        >
                          {showFullUrl === file?.url
                            ? file?.url
                            : truncateUrl(file?.url)}
                        </p>
                        {showFullUrl !== file?.url && (
                          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(file?.timestamp)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FileUploadDialog;
