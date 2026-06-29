"use client";

import React, { useState, useRef } from "react";
import { useJob } from "@/context/JobContext";
import { api } from "@/lib/api";
import { FileText, Play, AlertCircle, ArrowRight, Download, Loader2 } from "lucide-react";
import { AIMarkdownText } from "../AIMarkdownText";
interface ResumeOptimization {
  overall_feedback: string;
  rewritten_resume: string;
}

export function OptimizerTab() {
  const { jobDescription, uploadedFiles } = useJob();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ResumeOptimization | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!results) return;
    setIsExporting(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await api.post(
        "/export/pdf",
        { markdown: results.rewritten_resume },
        {
          responseType: "blob",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Optimized_Resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      console.error("Failed to export PDF:", err);
      setError("Failed to generate PDF document.");
    } finally {
      setIsExporting(false);
    }
  };

  const canRun = jobDescription.trim().length > 0 && uploadedFiles.length > 0;

  const handleRunAnalysis = async () => {
    if (!canRun) return;

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("job_description", jobDescription);
      
      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });
      
      const token = localStorage.getItem("access_token");
      const response = await api.post("/optimize", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });

      setResults(response.data);
    } catch (err: any) {
      console.error("Failed to optimize resume:", err);
      setError(err.response?.data?.detail || "Failed to optimize resume.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!results && !isAnalyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center relative z-10 p-8">
        <FileText className="w-16 h-16 text-[#F5EFE6]/70 mb-4" />
        <h2 className="text-2xl font-bold text-[#F5EFE6]/90 mb-2">Resume Optimizer</h2>
        <p className="text-[#F5EFE6]/50 max-w-md mb-6">
          Get a completely rewritten, AI-optimized version of your resume tailored perfectly to the JD.
        </p>
        <button
          onClick={handleRunAnalysis}
          disabled={!canRun}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            !canRun
              ? "bg-[#5C141F] text-[#F5EFE6]/50 cursor-not-allowed"
              : "bg-gradient-to-r from-[#D9A646] to-[#F6D88A] hover:bg-[#D9A646] text-[#3A0A11] shadow-lg shadow-[#D9A646]/20"
          }`}
        >
          <Play className="w-5 h-5" />
          Rewrite Resume
        </button>
        {error && (
          <div className="mt-4 text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center relative z-10 p-8">
        <div className="w-12 h-12 border-4 border-[#D9A646]/20 border-t-[#3A0A11] rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-medium text-[#F5EFE6]/90">Rewriting Resume...</h2>
        <p className="text-[#F5EFE6]/50 mt-2">Tailoring your experience for maximum impact...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative z-10 overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Optimized Resume</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 text-sm px-4 py-2 bg-gradient-to-r from-[#D9A646] to-[#F6D88A] hover:bg-[#D9A646] text-[#3A0A11] rounded-lg transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
            {isExporting ? "Generating PDF..." : "Download PDF"}
          </button>
          <button
            onClick={handleRunAnalysis}
            className="text-sm px-4 py-2 bg-[#5C141F] hover:bg-[#120807] text-[#F5EFE6]/90 rounded-lg transition-colors"
          >
            Re-Analyze
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-950/40 border border-rose-900/50 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-6 pb-8">
          <div className="p-5 bg-[#5C141F]/40 border border-[#D9A646]/30/50 rounded-xl">
            <h3 className="text-lg font-medium text-[#F6D88A] mb-2">Overall Feedback</h3>
            <AIMarkdownText content={results.overall_feedback} className="text-sm" />
          </div>

          <div>
            <h3 className="text-lg font-medium text-[#F5EFE6]/90 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              Fully Rewritten Resume
            </h3>
            
            <div className="p-6 bg-[#3A0A11]/80 border border-[#D9A646]/30/50 rounded-xl overflow-x-auto shadow-inner">
              <AIMarkdownText content={results.rewritten_resume} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
