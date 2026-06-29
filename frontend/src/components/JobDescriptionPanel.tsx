"use client";

import React from "react";
import { Briefcase } from "lucide-react";

interface JobDescriptionPanelProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function JobDescriptionPanel({ value, onChange, disabled = false }: JobDescriptionPanelProps) {
  return (
    <div className="bg-[#3A0A11] border border-[#D9A646]/20 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <Briefcase className="w-5 h-5 text-[#D9A646]" />
        <h2 className="text-lg font-medium">Job Description</h2>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste the job description here..."
        className="w-full h-48 bg-transparent border border-[#D9A646]/20 rounded-xl p-4 text-sm text-[#F5EFE6]/90 focus:outline-none focus:border-[#D9A646] transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-[#F5EFE6]/70"
      />
    </div>
  );
}
