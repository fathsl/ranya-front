import { FileIcon, FileTextIcon, Upload, XIcon } from "lucide-react";
import { useRef, useState } from "react";

interface DocumentUploadProps {
  label: string;
  currentDocument?: string;
  onDocumentChange: (file: File | null, documentUrl: string) => void;
  className?: string;
  accept?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  currentDocument,
  onDocumentChange,
  className = "",
  accept = ".pdf,.doc,.docx,.txt,.rtf",
}) => {
  const [preview, setPreview] = useState<string>(currentDocument || "");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return <FileTextIcon className="h-8 w-8 text-red-500" />;
      case "doc":
      case "docx":
        return <FileTextIcon className="h-8 w-8 text-blue-500" />;
      case "txt":
        return <FileTextIcon className="h-8 w-8 text-gray-500" />;
      default:
        return <FileIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const handleFileSelect = (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/rtf",
    ];

    if (file && allowedTypes.includes(file.type)) {
      setIsLoading(true);
      setFileName(file.name);
      setFileSize(formatFileSize(file.size));

      const reader = new FileReader();
      reader.onload = (e) => {
        const documentUrl = e.target?.result as string;
        setPreview(documentUrl);
        onDocumentChange(file, documentUrl);
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

  const handleRemoveDocument = () => {
    setPreview("");
    setFileName("");
    setFileSize("");
    onDocumentChange(null, "");
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
            <p className="text-sm text-gray-600">Processing document...</p>
          </div>
        ) : preview && fileName ? (
          <div className="relative">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">{getFileIcon(fileName)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileName}
                </p>
                <p className="text-sm text-gray-500">{fileSize}</p>
              </div>
              <div className="flex-shrink-0">
                <a
                  href={preview}
                  download={fileName}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  Download
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveDocument();
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <XIcon size={16} />
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, TXT, RTF up to 50MB
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

export default DocumentUpload;
