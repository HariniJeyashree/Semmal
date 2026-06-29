"use client";

import React, { useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { JobDescriptionPanel } from "@/components/JobDescriptionPanel";
import { FileUploadZone } from "@/components/FileUploadZone";
import { AgentViewerPanel } from "@/components/AgentViewerPanel";
import { Play, AlertCircle, X, LogOut, CheckCircle, BarChart, BookOpen, Users, FileText, Search, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useJob } from "@/context/JobContext";
import { SkillGapTab } from "@/components/tabs/SkillGapTab";
import { OptimizerTab } from "@/components/tabs/OptimizerTab";
import { JobFinderTab } from "@/components/tabs/JobFinderTab";
import { InterviewTab } from "@/components/tabs/InterviewTab";
import HistorySidebar from "@/components/HistorySidebar";
import ProfileSettingsModal from "@/components/ProfileSettingsModal";
import { Menu } from "lucide-react";
import SemmalLogo from "@/components/SemmalLogo";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

export default function Dashboard() {
  const { jobDescription, setJobDescription, uploadedFiles, setUploadedFiles } = useJob();
  const [activeTab, setActiveTab] = useState("ranking");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  
  // Tab-specific states
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [rankingResults, setRankingResults] = useState<any[] | null>(null);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);

  const canRunAnalysis = jobDescription.trim().length > 0 && uploadedFiles.length > 0;

  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const host = typeof window !== "undefined" ? window.location.origin : "http://localhost:8000";
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || host + "/api/v1";
        const baseUrl = apiUrl.replace(/\/api\/v1(\/analyze)?\/?$/, "");
        const res = await fetch(`${baseUrl}/health`);
        setIsBackendHealthy(res.ok);
      } catch (err) {
        setIsBackendHealthy(false);
      }
    };
    checkHealth();
  }, []);

  const handleSessionSelect = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    if (!sessionId) {
      setJobDescription("");
      setUploadedFiles([]);
      setRankingResults(null);
      setActiveTab("ranking");
      setIsDrawerOpen(false); // Close drawer
      return;
    }

    try {
      setIsOrchestrating(true);
      const response = await api.get(`/sessions/${sessionId}`);
      const data = response.data;
      setJobDescription(data.session.job_description);
      setRankingResults(data.results);
      // Note: We can't easily populate files from just text in this demo, so we'll leave files as is or empty.
      setIsDrawerOpen(false); // Close drawer on mobile
    } catch (error: any) {
      console.error(error);
      setErrorMessage("Failed to load session.");
    } finally {
      setIsOrchestrating(false);
    }
  };

  const handleRunRanking = async () => {
    if (!canRunAnalysis) return;

    setIsOrchestrating(true);
    setErrorMessage(null);
    setRankingResults(null);

    try {
      const formData = new FormData();
      formData.append("job_description", jobDescription);
      
      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });
      
      const response = await api.post("/analyze", formData);
      const data = response.data;
      setRankingResults(data);
      // Auto-set the current session ID based on the result
      if (data && data.length > 0) {
        setCurrentSessionId(data[0].session_id);
        setHistoryRefreshTrigger(prev => prev + 1);
      }
    } catch (error: any) {
      console.error("Failed to fetch from backend:", error);
      setErrorMessage(error.response?.data?.detail || error.message || "An unexpected error occurred while connecting to the backend.");
    } finally {
      setIsOrchestrating(false);
    }
  };

  const tabs = [
    { id: "ranking", label: "Ranking & Bias", icon: BarChart },
    { id: "skills", label: "Skill Gap", icon: BookOpen },
    { id: "optimizer", label: "Optimizer", icon: FileText },
    { id: "jobs", label: "Job Finder", icon: Search },
    { id: "interview", label: "Interview", icon: Users },
  ];

  if (loading || !user) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center"><div className="text-[#F5EFE6]/70">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-transparent text-[#F5EFE6] selection:bg-[#D9A646]/30 flex overflow-hidden">
      {/* Sliding History Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <HistorySidebar
          onSelectSession={handleSessionSelect}
          currentSessionId={currentSessionId}
          onClose={() => setIsDrawerOpen(false)}
          refreshTrigger={historyRefreshTrigger}
        />
      </div>
      
      {/* Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <main className="flex-1 max-w-7xl mx-auto p-4 md:p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-2 text-[#F5EFE6]/70 hover:text-[#F5EFE6] hover:bg-[#5C141F] rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <SemmalLogo width={64} height={64} />
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#D9A646] font-serif">
                  Semmal
                </h1>
                <p className="text-[#F5EFE6]/70 mt-1 italic text-sm">Know Your Worth. Find Your Way.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#F5EFE6]/70 hover:text-[#F5EFE6] hover:bg-[#5C141F] rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#F5EFE6]/70 hover:text-[#F5EFE6] hover:bg-[#5C141F] rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Error States */}
        {errorMessage && (
          <div className="mb-6 flex items-start justify-between bg-rose-950/40 border border-rose-900/50 p-4 rounded-xl shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-rose-300">Action Failed</h3>
                <p className="text-sm text-rose-400/80 mt-1">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400/50 hover:text-rose-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {isBackendHealthy === false && (
          <div className="mb-6 flex items-start gap-3 bg-amber-950/40 border border-amber-900/50 p-4 rounded-xl shadow-lg">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-300">Backend Unreachable</h3>
              <p className="text-sm text-amber-400/80 mt-1">Please ensure the FastAPI backend is running on port 8000.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Context (Inputs) */}
          <div className="lg:col-span-4 space-y-6">
            <ErrorBoundary fallbackMessage="Job Description Panel crashed.">
              <JobDescriptionPanel
                value={jobDescription}
                onChange={setJobDescription}
                disabled={isOrchestrating}
              />
            </ErrorBoundary>

            <ErrorBoundary fallbackMessage="File Upload Zone crashed.">
              <FileUploadZone
                files={uploadedFiles}
                onFilesChange={setUploadedFiles}
                disabled={isOrchestrating}
              />
            </ErrorBoundary>
          </div>

          {/* Right Column: Tabbed Interface */}
          <div className="lg:col-span-8 flex flex-col h-full">
            {/* Animated Tabs Navigation */}
            <div className="flex overflow-x-auto border-b border-[#D9A646]/20 mb-6 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? "text-[#D9A646]"
                        : "text-[#F5EFE6]/70 hover:text-[#F5EFE6] hover:bg-[#5C141F]/30"
                    }`}
                  >
                    <Icon className="w-4 h-4 z-10 relative" />
                    <span className="z-10 relative">{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D9A646]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 bg-[#3A0A11]/50 border border-[#D9A646]/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#D9A646]/5 to-[#F6D88A]/5 pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex flex-col relative z-10"
                >
                  {activeTab === "ranking" && (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold font-serif text-[#F5EFE6]">Ranking & Bias Analysis</h2>
                        <button
                      onClick={handleRunRanking}
                      disabled={!canRunAnalysis || isOrchestrating}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        !canRunAnalysis
                          ? "bg-[#5C141F] text-[#F5EFE6]/50 cursor-not-allowed"
                          : isOrchestrating
                          ? "bg-[#D9A646]/50 text-[#3A0A11] cursor-wait"
                          : "bg-gradient-to-r from-[#D9A646] to-[#F6D88A] hover:bg-[#D9A646] text-[#3A0A11] shadow-lg shadow-[#D9A646]/20"
                      }`}
                    >
                      {isOrchestrating ? (
                        <div className="w-4 h-4 border-2 border-[#3A0A11]/20 border-t-[#3A0A11] rounded-full animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      {isOrchestrating ? "Analyzing..." : "Run Analysis"}
                    </button>
                  </div>
                  <ErrorBoundary fallbackMessage="Agent Viewer Panel crashed.">
                    <AgentViewerPanel
                      isOrchestrating={isOrchestrating}
                      results={rankingResults}
                    />
                  </ErrorBoundary>
                </>
              )}

              {activeTab === "skills" && (
                <SkillGapTab />
              )}

              {activeTab === "optimizer" && (
                <OptimizerTab />
              )}

              {activeTab === "jobs" && (
                <JobFinderTab />
              )}

              {activeTab === "interview" && (
                <InterviewTab 
                  currentSessionId={currentSessionId} 
                  rankingResults={rankingResults} 
                />
              )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
      
      {isProfileModalOpen && (
        <ProfileSettingsModal onClose={() => setIsProfileModalOpen(false)} />
      )}
    </div>
  );
}
