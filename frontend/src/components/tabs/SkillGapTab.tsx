"use client";

import React, { useState } from "react";
import { useJob } from "@/context/JobContext";
import { api } from "@/lib/api";
import { BookOpen, ExternalLink, Play, AlertCircle } from "lucide-react";

interface Resource {
  title: string;
  url: string;
  type: string;
}

interface SkillGap {
  skill: string;
  importance: string;
  resources: Resource[];
}

interface SkillGapAnalysis {
  missing_skills: SkillGap[];
  matching_skills: string[];
}

export function SkillGapTab() {
  const { jobDescription, uploadedFiles } = useJob();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SkillGapAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const response = await api.post("/skill-gap", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });

      setResults(response.data);
    } catch (err: any) {
      console.error("Failed to analyze skill gap:", err);
      setError(err.response?.data?.detail || "Failed to analyze skill gap.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!results && !isAnalyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center relative z-10 p-8">
        <BookOpen className="w-16 h-16 text-[#F5EFE6]/70 mb-4" />
        <h2 className="text-2xl font-bold text-[#F5EFE6]/90 mb-2">Skill Gap Analysis</h2>
        <p className="text-[#F5EFE6]/50 max-w-md mb-6">
          Compare your resume against the job description to identify missing skills and get tailored learning resources.
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
          Run Analysis
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
        <h2 className="text-xl font-medium text-[#F5EFE6]/90">Analyzing Skill Gaps...</h2>
        <p className="text-[#F5EFE6]/50 mt-2">Diffing resume against JD requirements...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative z-10 overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Skill Gap & Resources</h2>
        <button
          onClick={handleRunAnalysis}
          className="text-sm px-4 py-2 bg-[#5C141F] hover:bg-[#120807] text-[#F5EFE6]/90 rounded-lg transition-colors"
        >
          Re-Analyze
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-950/40 border border-rose-900/50 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-8 pb-8">
          <div>
            <h3 className="text-lg font-medium text-[#F5EFE6]/90 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Matching Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {results.matching_skills.length > 0 ? (
                results.matching_skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-full">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[#F5EFE6]/50 text-sm italic">No overlapping skills found.</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[#F5EFE6]/90 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              Missing Skills & Resources
            </h3>
            {results.missing_skills.length > 0 ? (
              <div className="space-y-4">
                {results.missing_skills.map((gap, idx) => (
                  <div key={idx} className="p-5 bg-[#5C141F]/40 border border-[#D9A646]/30/50 rounded-xl hover:border-[#D9A646]/50/50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-rose-300">{gap.skill}</h4>
                        <span className="text-xs px-2 py-1 bg-[#5C141F] text-[#F5EFE6]/70 rounded mt-1 inline-block">
                          Importance: {gap.importance}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium text-[#F5EFE6]/70 mb-2">Recommended Learning Resources:</p>
                      <div className="grid gap-2">
                        {gap.resources.map((res, ridx) => (
                          <a
                            key={ridx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-[#3A0A11]/50 rounded-lg hover:bg-[#5C141F] transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-medium px-2 py-1 bg-[#D9A646]/20 text-[#F6D88A] rounded">
                                {res.type}
                              </span>
                              <span className="text-sm text-[#F5EFE6]/90 group-hover:text-[#F6D88A] transition-colors">
                                {res.title}
                              </span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-[#F5EFE6]/50 group-hover:text-[#D9A646]" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 bg-[#5C141F]/40 border border-[#D9A646]/30/50 rounded-xl text-center">
                <span className="text-[#F5EFE6]/70 text-sm">Great job! You seem to have all the required skills.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
