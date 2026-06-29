"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, X, FileText, AlertCircle } from "lucide-react";

interface FileUploadZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUploadZone({ files, onFilesChange, disabled = false }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateAndAddFiles = (newFiles: File[]) => {
    setError(null);
    const validFiles: File[] = [];
    let hasError = false;

    newFiles.forEach((file) => {
      if (file.type !== "application/pdf") {
        setError(`"${file.name}" is not a PDF.`);
        hasError = true;
      } else if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" exceeds the 10MB limit.`);
        hasError = true;
      } else {
        // Avoid duplicates by name
        if (!files.some((f) => f.name === file.name)) {
          validFiles.push(file);
        }
      }
    });

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndAddFiles(droppedFiles);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      validateAndAddFiles(selectedFiles);
    }
    // Reset input so same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (fileName: string) => {
    onFilesChange(files.filter((f) => f.name !== fileName));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="bg-[#3A0A11] border border-[#D9A646]/20 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <Upload className="w-5 h-5 text-[#D9A646]" />
        <h2 className="text-lg font-medium">Candidate Resumes</h2>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
          disabled
            ? "border-[#D9A646]/20 bg-transparent opacity-50 cursor-not-allowed"
            : isDragging
            ? "border-[#D9A646] bg-[#D9A646]/10"
            : "border-[#D9A646]/30 hover:border-[#D9A646]/50 hover:bg-[#5C141F] cursor-pointer"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <Upload className={`w-8 h-8 mb-3 ${isDragging ? "text-[#D9A646]" : "text-[#F5EFE6]/50"}`} />
        <span className="text-sm text-[#F5EFE6]/90 font-medium">
          Drag & drop PDFs or click to browse
        </span>
        <span className="text-xs text-[#F5EFE6]/50 mt-1">Max 10MB per file</span>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="application/pdf"
          multiple
          className="hidden"
          disabled={disabled}
        />
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 text-sm text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between bg-transparent border border-[#D9A646]/20 rounded-lg p-3 group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="w-4 h-4 text-[#D9A646] shrink-0" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm text-[#F5EFE6] truncate">{file.name}</span>
                  <span className="text-xs text-[#F5EFE6]/50">{formatSize(file.size)}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.name);
                }}
                disabled={disabled}
                className="p-1.5 text-[#F5EFE6]/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
