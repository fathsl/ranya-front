import { Video, XIcon } from "lucide-react";
import { useRef, useState } from "react";

interface VideoUploadProps {
  label: string;
  currentVideo?: string;
  onVideoChange: (file: File | null, videoUrl: string) => void;
  className?: string;
  accept?: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  label,
  currentVideo,
  onVideoChange,
  className = "",
  accept = "video/*",
}) => {
  const [preview, setPreview] = useState<string>(currentVideo || "");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith("video/")) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        const videoUrl = e.target?.result as string;
        setPreview(videoUrl);
        onVideoChange(file, videoUrl);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveVideo = () => {
    setPreview("");
    onVideoChange(null, "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${preview ? "border-solid border-gray-200" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm text-gray-600">Processing video...</p>
          </div>
        ) : preview ? (
          <div className="relative">
            <video
              src={preview}
              controls
              className="w-full h-48 object-cover rounded-lg bg-black"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveVideo();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <XIcon size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">
                MP4, AVI, MOV, WebM up to 100MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default VideoUpload;
