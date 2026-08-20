import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User, Volume2, Copy, Check, CheckCircle2, Sparkles } from "lucide-react";

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
    <div className={`flex gap-3 animate-fade-in ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-text-primary text-white"
            : "bg-accent-light text-accent"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[80%] sm:max-w-[72%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Author + Time */}
        <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-text-tertiary">
          <span className="font-medium text-text-secondary">{isUser ? "You" : "XYZ AI"}</span>
          <span>·</span>
          <span>{message.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>

        {/* Bubble */}
        <div
          className={`px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-text-primary text-white rounded-2xl rounded-tr-md"
              : "card rounded-2xl rounded-tl-md"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{textContent}</p>
          ) : (
            <div className="prose prose-sm max-w-none text-text-primary space-y-1.5 [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&_strong]:text-text-primary [&_a]:text-accent">
              <ReactMarkdown>{textContent}</ReactMarkdown>
            </div>
          )}

          {/* Confirmation Actions */}
          {!isUser && message.requiresConfirmation && (
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
              <button
                onClick={() => onQuickAction && onQuickAction("Yes, submit call request now.")}
                className="btn-primary text-xs h-8 px-3"
              >
                Confirm & Request
              </button>
              <button
                onClick={() => onQuickAction && onQuickAction("Cancel")}
                className="btn-secondary text-xs h-8 px-3"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Ticket Badge */}
          {!isUser && message.ticketCreated && (
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span className="font-medium text-accent-dark">
                Ticket #{message.ticketCreated.ticketId || "TKT-2001"} created
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1.5 text-text-tertiary hover:text-text-primary rounded-md hover:bg-gray-100 transition-colors"
              title="Copy response"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {onSpeak && (
              <button
                onClick={() => onSpeak(textContent)}
                className="p-1.5 text-text-tertiary hover:text-accent rounded-md hover:bg-gray-100 transition-colors"
                title="Listen"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
