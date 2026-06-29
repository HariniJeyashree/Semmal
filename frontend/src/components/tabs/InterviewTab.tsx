import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { AIMarkdownText } from "../AIMarkdownText";
interface InterviewTabProps {
  currentSessionId: string | null;
  rankingResults: any[] | null;
}

function QuestionCard({ question, currentSessionId, history, onNewSubmission }: { question: string, currentSessionId: string, history: any[], onNewSubmission: () => void }) {
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any | null>(null);

  // Check if this question was already answered in history
  const pastAnswer = history.find(h => h.question_text === question);

  const handleSubmit = async () => {
    if (!currentSessionId || !answerText.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await api.post("/interview/submit", {
        session_id: currentSessionId,
        question_text: question,
        user_answer_text: answerText
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setFeedback(response.data);
      onNewSubmission();
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#3A0A11] rounded-2xl p-6 border border-[#D9A646]/20 mb-6">
      <h3 className="font-semibold text-lg text-[#F5EFE6] mb-4">{question}</h3>
      
      {pastAnswer && !feedback ? (
        <div className="bg-transparent rounded-xl p-4 border border-[#D9A646]/20">
          <div className="text-sm text-[#F5EFE6]/70 mb-2 font-medium">Your Previous Answer:</div>
          <p className="text-[#F5EFE6]/90 italic mb-4">"{pastAnswer.user_answer_text}"</p>
          <div className="flex items-center gap-2 mb-2">
            {pastAnswer.score >= 7 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
            <span className="font-semibold text-[#F5EFE6]">AI Feedback ({pastAnswer.score}/10)</span>
          </div>
          <AIMarkdownText content={pastAnswer.ai_feedback} className="text-sm" />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your detailed answer here..."
              className="w-full h-32 bg-transparent border border-[#D9A646]/20 rounded-xl px-4 py-3 text-[#F5EFE6] placeholder-[#F5EFE6]/50 focus:outline-none focus:ring-2 focus:ring-[#D9A646]/50 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !answerText.trim()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#D9A646] to-[#F6D88A] hover:bg-[#D9A646] text-[#3A0A11] px-6 py-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>Submit Answer <Send className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}

      {feedback && (
        <div className="bg-transparent rounded-xl p-4 border border-[#D9A646]/30 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-bold flex items-center gap-2 text-[#D9A646]">
              {feedback.score >= 7 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
              AI Feedback
            </h4>
            <div className="px-2 py-1 bg-[#3A0A11] rounded-md text-xs font-bold text-[#F6D88A]">
              Score: {feedback.score}/10
            </div>
          </div>
          <AIMarkdownText content={feedback.ai_feedback} className="text-sm" />
          <button 
            onClick={() => setFeedback(null)} 
            className="text-xs text-[#D9A646] mt-3 hover:text-[#F6D88A]"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export function InterviewTab({ currentSessionId, rankingResults }: InterviewTabProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (rankingResults && rankingResults.length > 0) {
      const topCandidate = rankingResults[0];
      if (topCandidate.interview_plan) {
        const lines = topCandidate.interview_plan.split('\n');
        const extractedQuestions = lines
          .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
          .filter((line: string) => line.length > 10 && line.includes('?'));
        
        // Show up to 3 questions max
        setQuestions(extractedQuestions.slice(0, 3));
      }
    }
  }, [rankingResults]);

  const fetchHistory = async () => {
    if (!currentSessionId) return;
    try {
      const token = localStorage.getItem("access_token");
      const response = await api.get(`/interview/session/${currentSessionId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch interview history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentSessionId]);

  if (!currentSessionId) {
    return (
      <div className="bg-[#3A0A11] rounded-2xl p-8 border border-[#D9A646]/20 text-center">
        <h3 className="text-xl font-semibold mb-2">No Active Session</h3>
        <p className="text-[#F5EFE6]/70">Run an analysis or select a history session to practice interview questions.</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-[#3A0A11] rounded-2xl p-8 border border-[#D9A646]/20 text-center">
        <h3 className="text-xl font-semibold mb-2">No Interview Plan Found</h3>
        <p className="text-[#F5EFE6]/70">The current session does not have a generated interview plan. Try running a new analysis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mb-6 flex items-center gap-2">
        <AlertCircle className="w-6 h-6 text-[#D9A646]" />
        <h2 className="text-xl font-bold">Interactive Interview Practice</h2>
      </div>
      <p className="text-[#F5EFE6]/70 mb-6">
        Here are {questions.length} custom interview questions based on the candidate's profile and job description. 
        Answer them to get real-time AI feedback.
      </p>
      
      {questions.map((q, idx) => (
        <QuestionCard 
          key={idx} 
          question={q} 
          currentSessionId={currentSessionId} 
          history={history} 
          onNewSubmission={fetchHistory}
        />
      ))}
    </div>
  );
}
