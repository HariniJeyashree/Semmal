"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Trash2, X, Check } from "lucide-react";

interface JobSession {
  id: string;
  job_title: string;
  job_description?: string;
  created_at: string;
}

interface HistorySidebarProps {
  onSelectSession: (sessionId: string) => void;
  currentSessionId: string | null;
  onClose?: () => void;
  refreshTrigger?: number;
}

// Helper to extract a better title from the job description
const getSessionTitle = (session: JobSession) => {
  if (session.job_description) {
    const lines = session.job_description.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    // Find the first line that doesn't just say "Job Description:"
    for (const line of lines) {
      if (!line.toLowerCase().startsWith('job description:') && line.length > 3) {
        // Return up to 40 characters
        return line.length > 40 ? line.substring(0, 40) + '...' : line;
      }
    }
  }
  // Fallback to the saved job_title or generic
  if (session.job_title && !session.job_title.toLowerCase().startsWith("job description:")) {
    return session.job_title;
  }
  return "AI Recruiter Session";
};

export default function HistorySidebar({ onSelectSession, currentSessionId, onClose, refreshTrigger }: HistorySidebarProps) {
  const [sessions, setSessions] = useState<JobSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [refreshTrigger]);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await api.get("/sessions/", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSessions(response.data);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("access_token");
      await api.delete(`/sessions/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSessions(sessions.filter((s) => s.id !== id));
      if (currentSessionId === id) {
        onSelectSession(""); // Clear current
      }
      setDeleteConfirmId(null);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // If it's already deleted on the server, just remove it from UI
        setSessions(sessions.filter((s) => s.id !== id));
        if (currentSessionId === id) {
          onSelectSession("");
        }
        setDeleteConfirmId(null);
      } else {
        console.error("Failed to delete session", error);
      }
    }
  };

  const promptDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(null);
  };

  return (
    <div className="w-80 bg-[#3A0A11] border-r border-[#D9A646]/20 h-full flex flex-col z-50">
      <div className="p-4 border-b border-[#D9A646]/20 flex justify-between items-center">
        <h2 className="text-lg font-serif text-[#F5EFE6]">History</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => {
              onSelectSession("");
              if (onClose) onClose();
            }}
            className="text-xs bg-[#5C141F] hover:bg-[#3A0A11] border border-[#D9A646]/50 text-[#F5EFE6] px-2 py-1 rounded transition-colors"
          >
            New
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-[#F5EFE6] hover:text-[#D9A646] p-1 transition-colors"
              aria-label="Close history"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-sm text-[#F5EFE6]/50">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-sm text-[#F5EFE6]/50">No previous sessions.</div>
        ) : (
          sessions.map((session) => {
            const isDeleting = deleteConfirmId === session.id;
            
            return (
              <div
                key={session.id}
                onClick={() => !isDeleting && onSelectSession(session.id)}
                className={`p-3 rounded-lg flex justify-between items-center group transition-all duration-300 border ${
                  currentSessionId === session.id
                    ? "bg-[#5C141F] border-[#D9A646]"
                    : "bg-[#3A0A11] hover:bg-[#5C141F]/50 border-transparent hover:border-[#D9A646]/30 cursor-pointer"
                }`}
              >
                <div className="overflow-hidden flex-1">
                  <div className="text-sm font-medium text-[#F5EFE6] truncate" title={getSessionTitle(session)}>
                    {getSessionTitle(session)}
                  </div>
                  <div className="text-xs text-[#D9A646]/70 mt-1">
                    {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                  </div>
                </div>
                
                {isDeleting ? (
                  <div className="flex flex-col items-end gap-1 ml-2 bg-[#5C141F] p-2 rounded-md border border-red-500/50">
                    <span className="text-xs text-red-400 font-medium">Delete this session?</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDelete(e, session.id)}
                        className="text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 px-2 py-1 rounded transition-colors font-medium"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={cancelDelete}
                        className="text-xs bg-[#3A0A11] hover:bg-[#120807] text-[#F5EFE6]/70 px-2 py-1 rounded transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={(e) => promptDelete(e, session.id)}
                    className="text-[#F5EFE6]/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1"
                    title="Delete session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
