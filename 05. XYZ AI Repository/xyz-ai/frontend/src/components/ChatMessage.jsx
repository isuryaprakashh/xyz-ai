import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User, Volume2, Copy, Check, CheckCircle2, XCircle } from "lucide-react";

export function ChatMessage({ message, onSpeak, onQuickAction }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === "user" || message.role === "user";
  const textContent = message.text || message.content || "";

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 my-3 animate-fade-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar Icon */}
      <div
        className={`w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0 text-xs font-bold ${
          isUser
            ? "bg-[#3FCF8E] text-[#000000]"
            : "bg-[#1C1C1C] border border-[#2E2E2E] text-[#3FCF8E]"
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-[#3FCF8E]" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Author Label & Time */}
        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-mono text-[#808080]">
          <span className="font-medium text-[#EDEDED]">{isUser ? "You" : "XYZ AI Assistant"}</span>
          <span>•</span>
          <span>{message.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>

        {/* Bubble */}
        <div
          className={`p-3.5 rounded-[6px] text-xs leading-relaxed ${
            isUser
              ? "bg-[#3FCF8E] text-[#000000] font-medium shadow-sm"
              : "bg-[#1C1C1C] border border-[#2E2E2E] text-[#EDEDED] shadow-sm"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{textContent}</p>
          ) : (
            <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-1.5">
              <ReactMarkdown>{textContent}</ReactMarkdown>
            </div>
          )}

          {/* Action Confirmation Chip */}
          {!isUser && message.requiresConfirmation && (
            <div className="mt-2.5 pt-2.5 border-t border-[#2E2E2E] flex items-center gap-2">
              <button
                onClick={() => onQuickAction && onQuickAction("Yes, submit call request now.")}
                className="px-2.5 py-1 rounded-[4px] bg-[#3FCF8E] text-[#000000] font-semibold text-[11px] hover:bg-[#16B674] transition-all"
              >
                Confirm & Request
              </button>
              <button
                onClick={() => onQuickAction && onQuickAction("Cancel")}
                className="px-2.5 py-1 rounded-[4px] bg-[#121212] border border-[#2E2E2E] text-[#808080] hover:text-[#FFFFFF] text-[11px] transition-all"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Structured Ticket Badge */}
          {!isUser && message.ticketCreated && (
            <div className="mt-2 pt-2 border-t border-[#2E2E2E] flex items-center gap-2 text-[11px] font-mono text-[#3FCF8E]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ticket #{message.ticketCreated.ticketId || "TKT-2001"} Logged in Database</span>
            </div>
          )}
        </div>

        {/* Bubble Actions */}
        {!isUser && (
          <div className="flex items-center gap-1.5 mt-1 px-1">
            <button
              onClick={handleCopy}
              className="p-1 text-[#808080] hover:text-[#EDEDED] rounded transition-colors"
              title="Copy response"
            >
              {copied ? <Check className="w-3 h-3 text-[#3FCF8E]" /> : <Copy className="w-3 h-3" />}
            </button>
            {onSpeak && (
              <button
                onClick={() => onSpeak(textContent)}
                className="p-1 text-[#808080] hover:text-[#3FCF8E] rounded transition-colors"
                title="Listen voice"
              >
                <Volume2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
