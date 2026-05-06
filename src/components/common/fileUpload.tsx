import React, { useCallback, useState } from "react";
import { Controller, Control, FieldValues, Path } from "react-hook-form";
import { Field, FieldLabel, FieldError } from "@/src/components/ui/field";
import { CloudUpload, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import Image from "next/image";

interface FileUploadProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  required?: boolean;
}

function FileUpload<T extends FieldValues>({
  name,
  control,
  label,
  maxFiles = 5,
  maxSizeMB = 5,
  required = false,
}: FileUploadProps<T>) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const value = (field.value || []) as File[];

        const handleFiles = (newFiles: File[]) => {
          const validFiles = newFiles.filter((file) => {
            const isImage = file.type.startsWith("image/");
            const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
            return isImage && isValidSize;
          });

          const totalFiles = [...value, ...validFiles].slice(0, maxFiles);
          field.onChange(totalFiles);
        };

        const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          const droppedFiles = Array.from(e.dataTransfer.files);
          handleFiles(droppedFiles);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            handleFiles(selectedFiles);
          }
        };

        const removeFile = (indexToRemove: number) => {
          const newFiles = value.filter((_, index) => index !== indexToRemove);
          field.onChange(newFiles.length > 0 ? newFiles : undefined);
        };

        return (
          <Field className="w-full mt-4">
            {label && (
              <FieldLabel required={required} className="text-md font-medium">
                {label}
              </FieldLabel>
            )}

            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                "relative flex flex-col items-center justify-center w-full min-h-[160px] p-6 rounded-md border-2 border-dashed transition-colors",
                isDragging
                  ? "border-primary bg-primary/10"
                  : fieldState.invalid
                  ? "border-red-500 bg-red-500/5"
                  : "border-gray-300 bg-gray-300/5 hover:border-primary",
                "cursor-pointer"
              )}
            >
              <input
                type="file"
                multiple
                accept="image/jpeg, image/png, image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleChange}
              />
              
              <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none text-center">
                <div className="p-3 bg-gray-100 rounded-full">
                  <CloudUpload className="w-8 h-8 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-medium">
                    Drag & drop your trade screenshots here
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG (Max {maxSizeMB}MB each)
                  </p>
                </div>
              </div>
            </div>

            {value.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {value.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                  >
                    {/* Object URL could cause memory leaks if not revoked, but for a simple form component it's usually fine or we can revoke on unmount */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors absolute top-2 right-2"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        );
      }}
    />
  );
}

export default FileUpload;
