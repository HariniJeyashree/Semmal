import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AIMarkdownTextProps {
  content: string;
  className?: string;
}

export const AIMarkdownText: React.FC<AIMarkdownTextProps> = ({ content, className = "" }) => {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-amber-200 mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-amber-200 mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-amber-200 mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="text-[#F5EFE6] leading-relaxed mb-4" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside text-[#F5EFE6] mb-4 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside text-[#F5EFE6] mb-4 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="text-[#F5EFE6] ml-2" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-[#F6D88A]" {...props} />,
          a: ({ node, ...props }) => <a className="text-[#D9A646] hover:text-[#F6D88A] transition-colors underline" target="_blank" rel="noopener noreferrer" {...props} />,
          code: ({ node, ...props }) => <code className="bg-[#0D0604]/50 text-[#F6D88A] px-1.5 py-0.5 rounded font-mono text-sm border border-[#3A0A11]" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
