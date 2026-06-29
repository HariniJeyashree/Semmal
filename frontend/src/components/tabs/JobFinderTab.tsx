"use client";

import React, { useState } from "react";
import { useJob } from "@/context/JobContext";
import { api } from "@/lib/api";
import { Search, Play, AlertCircle, Briefcase, Building, ExternalLink } from "lucide-react";
import { AIMarkdownText } from "../AIMarkdownText";

interface JobPortalLink {
  portal_name: string;
  url: string;
  message: string;
}

interface TargetRole {
  title: string;
  search_keywords: string;
  match_reasoning: string;
  links: JobPortalLink[];
}

interface JobFinderResult {
  market_insights: string;
  target_roles: TargetRole[];
}

export function JobFinderTab() {
  const { uploadedFiles } = useJob();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<JobFinderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [location, setLocation] = useState("Remote");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Level");

  const canRun = uploadedFiles.length > 0;

  const handleRunAnalysis = async () => {
    if (!canRun) return;

    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("location", location);
      formData.append("experience_level", experienceLevel);
      
      const token = localStorage.getItem("access_token");
      const response = await api.post("/jobs", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });

      setResults(response.data);
    } catch (err: any) {
      console.error("Failed to find jobs:", err);
      setError(err.response?.data?.detail || "Failed to find jobs.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!results && !isAnalyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center relative z-10 p-8">
        <Search className="w-16 h-16 text-[#F5EFE6]/70 mb-4" />
        <h2 className="text-2xl font-bold text-[#F5EFE6]/90 mb-2">Job Finder</h2>
        <p className="text-[#F5EFE6]/50 max-w-md mb-6">
          Discover real job openings and market insights that match your skills and experience level.
        </p>
        
        <div className="bg-[#5C141F]/50 p-6 rounded-xl border border-[#D9A646]/30/50 mb-6 w-full max-w-md text-left">
          <h3 className="text-sm font-semibold text-[#F5EFE6]/90 uppercase tracking-wider mb-4">Search Filters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[#F5EFE6]/70 mb-1">Target Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#3A0A11] border border-[#D9A646]/30 rounded-lg px-4 py-2 text-[#F5EFE6] focus:outline-none focus:border-[#D9A646]"
                placeholder="e.g. Remote, New York, London"
              />
            </div>
            <div>
              <label className="block text-sm text-[#F5EFE6]/70 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-[#3A0A11] border border-[#D9A646]/30 rounded-lg px-4 py-2 text-[#F5EFE6] focus:outline-none focus:border-[#D9A646]"
              >
                <option value="Internship">Internship</option>
                <option value="Entry-Level">Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>
        </div>

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
          Find Opportunities
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
        <h2 className="text-xl font-medium text-[#F5EFE6]/90">Scouting the Market...</h2>
        <p className="text-[#F5EFE6]/50 mt-2">Generating real search URLs based on your filters...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative z-10 overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Market Intelligence</h2>
        <button
          onClick={() => setResults(null)}
          className="text-sm px-4 py-2 bg-[#5C141F] hover:bg-[#120807] text-[#F5EFE6]/90 rounded-lg transition-colors"
        >
          Change Filters
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
          <div className="p-5 bg-[#5C141F]/40 border border-[#D9A646]/30/50 rounded-xl">
            <h3 className="text-lg font-medium text-[#F5EFE6]/90 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-400" />
              Market Insights
            </h3>
            <AIMarkdownText content={results.market_insights} className="text-sm" />
          </div>

          <div>
            <h3 className="text-lg font-medium text-[#F5EFE6]/90 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-cyan-400" />
              Target Roles & Live Searches
            </h3>
            <div className="grid gap-6">
              {results.target_roles.map((role, idx) => (
                <div key={idx} className="p-5 bg-[#5C141F]/40 border border-[#D9A646]/30/50 rounded-xl hover:border-[#D9A646]/50/50 transition-colors">
                  <h4 className="text-lg font-bold text-[#F5EFE6] mb-3">{role.title}</h4>
                  
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold text-[#F5EFE6]/50 uppercase tracking-wider mb-2">Why this fits you</h5>
                    <AIMarkdownText content={role.match_reasoning} className="text-sm" />
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-xs font-semibold text-[#F5EFE6]/50 uppercase tracking-wider mb-2">Search Keywords Used</h5>
                    <span className="px-2 py-1 bg-[#3A0A11] border border-[#D9A646]/30 rounded text-xs text-[#F5EFE6]/70">
                      {role.search_keywords}
                    </span>
                  </div>

                  <div className="space-y-3 mt-6">
                    <h5 className="text-xs font-semibold text-[#F5EFE6]/50 uppercase tracking-wider">Live Job Boards</h5>
                    {role.links.map((link, linkIdx) => (
                      <div key={linkIdx} className="p-4 bg-[#3A0A11]/50 border border-[#D9A646]/30/50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-[#F5EFE6]/90 flex items-center gap-2">
                            <Building className="w-4 h-4 text-[#D9A646]" /> {link.portal_name}
                          </span>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-[#D9A646] hover:text-[#F6D88A] transition-colors"
                          >
                            Search Live <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-xs text-[#F5EFE6]/50 italic flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {link.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
