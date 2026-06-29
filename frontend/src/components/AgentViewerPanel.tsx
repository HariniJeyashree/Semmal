"use client";

import React from "react";
import { AIMarkdownText } from "./AIMarkdownText";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, CheckCircle2, UserCircle, ShieldAlert, BrainCircuit } from "lucide-react";

interface RankingResult {
  candidate_id: string;
  candidate_name: string;
  score: number;
  reasoning: string;
  bias_flag: boolean;
  bias_details?: string;
  interview_plan?: string;
}

interface AgentViewerPanelProps {
  isOrchestrating: boolean;
  results: RankingResult[] | null;
}

export function AgentViewerPanel({ isOrchestrating, results }: AgentViewerPanelProps) {
  return (
    <div className="bg-[#3A0A11] border border-[#D9A646]/20 rounded-2xl p-6 shadow-xl min-h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bot className="w-5 h-5 text-[#D9A646]" />
          <h2 className="text-xl font-bold font-serif text-[#F5EFE6]">Agent Reasoning & Ranking</h2>
        </div>
        {results && !isOrchestrating && (
          <span className="text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Analysis Complete
          </span>
        )}
      </div>

      {isOrchestrating && (
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3 mb-6 text-[#D9A646] font-medium">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
              <BrainCircuit className="w-5 h-5" />
            </motion.div>
            <span>Orchestrating Agent Team...</span>
          </div>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
              className="h-28 bg-[#5C141F]/50 rounded-xl border border-[#D9A646]/20"
            />
          ))}
        </div>
      )}

      {!isOrchestrating && !results && (
        <div className="flex-1 flex flex-col items-center justify-center text-[#F5EFE6]/50">
          <BrainCircuit className="w-12 h-12 mb-4 opacity-20" />
          <p>Waiting for agent orchestration...</p>
        </div>
      )}

      <AnimatePresence>
        {!isOrchestrating && results && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {results.map((c, i) => (
              <motion.div
                key={c.candidate_id || i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group bg-transparent border border-[#D9A646]/20 hover:border-[#D9A646]/50 rounded-xl p-5 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-10 h-10 text-[#F5EFE6]/70" />
                    <div>
                      <h3 className="text-xl font-bold font-serif text-[#D9A646]">{c.candidate_name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#F5EFE6]/70">Semantic Score:</span>
                        <div className="h-1.5 w-24 bg-[#5C141F] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(0, Math.min(100, c.score))}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full bg-[#D9A646]"
                          />
                        </div>
                        <span className="text-xs font-medium text-[#D9A646]">{c.score}%</span>
                      </div>
                    </div>
                  </div>

                  {c.bias_flag && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Bias Alert
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-[#D9A646]/20 grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-[#F5EFE6]/50 font-semibold mb-2">
                      Ranker Reasoning
                    </h4>
                    <AIMarkdownText content={c.reasoning} className="text-sm" />
                  </div>
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-[#F5EFE6]/50 font-semibold mb-2">
                      Interview Planner
                    </h4>
                    <div className="bg-[#3A0A11] p-3 rounded-lg border border-[#D9A646]/20">
                      <AIMarkdownText content={c.interview_plan || "No interview plan generated."} className="text-sm" />
                    </div>
                  </div>
                </div>

                {c.bias_flag && c.bias_details && (
                  <div className="mt-4 bg-rose-950/30 border border-rose-900/50 rounded-lg p-3 text-sm text-rose-300 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="w-full">
                      <strong className="block mb-1">Security/Ethics Agent Intervention:</strong>
                      <AIMarkdownText content={c.bias_details || ""} className="text-sm" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
