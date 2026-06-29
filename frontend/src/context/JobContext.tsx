"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface JobContextType {
  jobDescription: string;
  setJobDescription: (desc: string) => void;
  uploadedFiles: File[];
  setUploadedFiles: (files: File[]) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
  const [jobDescription, setJobDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  return (
    <JobContext.Provider
      value={{
        jobDescription,
        setJobDescription,
        uploadedFiles,
        setUploadedFiles,
      }}
    >
      {children}
    </JobContext.Provider>
  );
}

export function useJob() {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error("useJob must be used within a JobProvider");
  }
  return context;
}
