import { useState, useEffect, useRef } from "react";

type Props = {
  label: string;
  variant?: "circle" | "rectangle";
  onFileSelect: (file: File) => void;
  existingImage?: string | null; 
};

const FileUpload = ({
  label,
  variant = "circle",
  onFileSelect,
  existingImage,
}: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  // When existing image comes from backend
  useEffect(() => {
    if (existingImage) {
      // If DB stores: "uploads/filename.png"
      setPreview(`http://localhost:3000/uploads/${existingImage}`);
    } else {
      setPreview(null);
    }
  }, [existingImage]);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onFileSelect(file);
    setFileName(file.name);

    if (variant === "circle") {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  // Cleanup only blob URLs (not server URLs)
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div>
      <p className="text-xs font-semibold mb-4 tracking-wide">
        {label}
      </p>

      {variant === "circle" ? (
        <div
          onClick={handleClick}
          className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 hover:bg-gray-200 transition cursor-pointer"
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-gray-700">
              UPLOAD
            </span>
          )}
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="w-full h-40 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-200 hover:bg-gray-200 transition cursor-pointer"
        >
          <span className="text-sm font-semibold text-gray-700">
            {fileName || "UPLOAD DOCUMENT"}
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={variant === "circle" ? "image/*" : ".pdf,.jpg,.png"}
        hidden
        onChange={handleChange}
      />
    </div>
  );
};

export default FileUpload;
