import { useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import { Sparkles, MessageSquare } from "lucide-react";

export function ChatArea({ messages, isLoading, onSpeak, onQuickPrompt, user }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const getRolePrompts = () => {
    switch (user?.role) {
      case "student":
        return [
          { text: "What is my overall attendance percentage?", icon: "📊" },
          { text: "Check my attendance records for this month", icon: "📅" },
          { text: "I want to speak with my class teacher", icon: "👨‍🏫" },
        ];
      case "parent":
        return [
          { text: "How is Jeevan's attendance this term?", icon: "📈" },
          { text: "Request a callback from the class teacher", icon: "📞" },
          { text: "Show me recent attendance breakdown", icon: "📋" },
        ];
      case "teacher":
        return [
          { text: "Mark Jeevan absent for today", icon: "📝" },
          { text: "Mark Aarav present today", icon: "✅" },
          { text: "Show attendance summary for Class 1A", icon: "👥" },
        ];
      case "principal":
        return [
          { text: "School-wide attendance overview", icon: "📊" },
          { text: "Section-wise attendance breakdown", icon: "🏫" },
          { text: "Which classes have attendance below 85%?", icon: "⚠️" },
        ];
      default:
        return [
          { text: "What can you help me with?", icon: "💡" },
          { text: "Check attendance records", icon: "📊" },
        ];
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-4">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-fade-in">
          {/* Hero */}
          <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center mb-5">
            <Sparkles className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            How can I help you today?
          </h2>
          <p className="text-sm text-text-secondary max-w-sm mb-8">
            Ask about attendance, mark records, request callbacks, or explore school analytics.
          </p>

          {/* Suggested Prompts */}
          <div className="w-full max-w-lg text-left">
            <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3 px-1">
              Suggestions for {user?.name || "you"}
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {getRolePrompts().map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onQuickPrompt && onQuickPrompt(p.text)}
                  className="flex items-center gap-3.5 p-4 card-interactive text-left group"
                >
                  <span className="text-lg shrink-0">{p.icon}</span>
                  <span className="flex-1 text-sm text-text-primary group-hover:text-accent transition-colors">
                    {p.text}
                  </span>
                  <span className="text-xs text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Ask →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {messages.map((m, i) => (
            <ChatMessage
              key={m.id || i}
              message={m}
              onSpeak={onSpeak}
              onQuickAction={onQuickPrompt}
            />
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 my-4 animate-fade-in">
              <div className="w-9 h-9 rounded-xl bg-accent-light flex items-center justify-center shrink-0">
                <Sparkles className="w-4.5 h-4.5 text-accent" />
              </div>
              <div className="card px-5 py-3.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-dot-pulse" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-accent animate-dot-pulse" style={{ animationDelay: "200ms" }} />
                <span className="w-2 h-2 rounded-full bg-accent animate-dot-pulse" style={{ animationDelay: "400ms" }} />
                <span className="text-xs text-text-tertiary ml-2">Thinking...</span>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
