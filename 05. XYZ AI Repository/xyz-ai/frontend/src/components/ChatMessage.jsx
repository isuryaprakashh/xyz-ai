import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User, Volume2, Copy, Check, CheckCircle2, XCircle } from "lucide-react";

export function ChatMessage({ message, onSpeak, onQuickAction }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toolResult = message.toolResult;

  return (
    <div className={`flex gap-3.5 my-4 animate-fade-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-loom-small ${
          isUser
            ? "bg-[#1868DB] text-white"
            : "bg-[#FFFFFF] dark:bg-[#161D27] border border-[#8FB8F6] dark:border-white/10 text-[#1868DB] dark:text-[#58A6FF]"
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5 text-[#1868DB] dark:text-[#58A6FF]" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Author Label & Time */}
        <div className="flex items-center gap-2 mb-1.5 px-2 text-xs text-[#7D818A] dark:text-[#8B949E] font-sans">
          <span className="font-semibold text-[#292A2E] dark:text-[#F0F6FC]">{isUser ? "You" : "XYZ AI Assistant"}</span>
          <span>•</span>
          <span>{new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>

        {/* Bubble */}
        <div
          className={`p-5 rounded-[28px] ${
            isUser
              ? "bg-[#1868DB] text-white rounded-tr-none shadow-loom-medium"
              : "bg-[#FFFFFF] dark:bg-[#161D27] border border-[#E9F2FE] dark:border-white/10 text-[#292A2E] dark:text-[#F0F6FC] rounded-tl-none shadow-loom-small"
          }`}
        >
          {isUser ? (
            <p className="text-sm font-normal whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose-loom">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}

          {/* Structured Attendance Tool Result Card */}
          {!isUser && toolResult && toolResult.percentage !== undefined && (
            <div className="mt-4 pt-4 border-t border-[#E9F2FE] dark:border-white/10 bg-[#E9F2FE] dark:bg-[#101C2E] p-4 rounded-[20px] border border-[#8FB8F6]/60 dark:border-[#388BFD]/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC]">Official Attendance Record</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-[12px] ${
                    parseFloat(toolResult.percentage) >= 85
                      ? "bg-[#E9F2FE] dark:bg-[#162744] text-[#1868DB] dark:text-[#58A6FF] border border-[#8FB8F6] dark:border-[#388BFD]/40"
                      : "bg-[#F8EEFE] dark:bg-[#2B153D] text-[#FF613D] border border-[#FF613D]/30"
                  }`}
                >
                  {toolResult.percentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#FFFFFF] dark:bg-[#0D1117] rounded-full h-2.5 overflow-hidden mb-2 border border-[#8FB8F6]/30 dark:border-white/10">
                <div
                  className="bg-[#1868DB] dark:bg-[#388BFD] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(parseFloat(toolResult.percentage), 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#6C6F77] dark:text-[#8B949E]">
                <span>Present: <strong className="text-[#292A2E] dark:text-[#F0F6FC]">{toolResult.presentDays || "—"}</strong> days</span>
                <span>Total Working Days: <strong className="text-[#292A2E] dark:text-[#F0F6FC]">{toolResult.totalWorkingDays || "—"}</strong></span>
              </div>
            </div>
          )}

          {/* Interactive Escalation Confirmation Buttons */}
          {!isUser && toolResult?.pendingConfirmation && (
            <div className="mt-4 pt-3 border-t border-[#E9F2FE] dark:border-white/10 flex flex-wrap gap-2">
              <button
                onClick={() => onQuickAction && onQuickAction("Yes, please proceed with callback request")}
                className="btn-primary text-xs py-1.5 px-4"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Request</span>
              </button>
              <button
                onClick={() => onQuickAction && onQuickAction("No, cancel request")}
                className="btn-secondary text-xs py-1.5 px-4"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}

          {/* Assistant Action Bar */}
          {!isUser && (
            <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-[#E9F2FE] dark:border-white/10 text-[#7D818A] dark:text-[#8B949E]">
              <button
                onClick={() => onSpeak && onSpeak(message.content)}
                aria-label="Listen to response"
                className="p-1 rounded hover:bg-[#E9F2FE] dark:hover:bg-white/10 hover:text-[#1868DB] dark:hover:text-[#58A6FF] transition-colors"
                title="Listen"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                aria-label="Copy response"
                className="p-1 rounded hover:bg-[#E9F2FE] dark:hover:bg-white/10 hover:text-[#1868DB] dark:hover:text-[#58A6FF] transition-colors"
                title="Copy text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
