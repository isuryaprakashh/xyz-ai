import { useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "./ChatMessage";
import { Sparkles } from "lucide-react";

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
          { text: "How is Rahul's attendance this term?", icon: "📈" },
          { text: "Request a callback from Rahul's class teacher", icon: "📞" },
          { text: "Show me Priya's recent attendance breakdown", icon: "📋" },
        ];
      case "teacher":
        return [
          { text: "Mark Rahul absent for today", icon: "📝" },
          { text: "Mark Priya present today", icon: "✅" },
          { text: "Show attendance summary for Class 8A", icon: "👥" },
        ];
      case "principal":
        return [
          { text: "Give me the school-wide attendance overview", icon: "📊" },
          { text: "Show section-wise attendance breakdown", icon: "🏫" },
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
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-4 max-w-4xl mx-auto w-full">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-12">
          {/* Hero Icon */}
          <div className="w-16 h-16 rounded-[44px] bg-[#E9F2FE] dark:bg-[#162744] border-2 border-[#8FB8F6] dark:border-[#388BFD]/60 flex items-center justify-center shadow-loom-small mb-4">
            <Sparkles className="w-8 h-8 text-[#1868DB] dark:text-[#58A6FF]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#292A2E] dark:text-[#F0F6FC] mb-2">
            XYZ AI Assistant
          </h2>
          <p className="text-sm text-[#6C6F77] dark:text-[#8B949E] max-w-md mb-8">
            Your conversational school assistant for instant attendance lookup, voice operations, and faculty communication.
          </p>

          {/* Suggested Prompts Cards */}
          <div className="w-full max-w-lg text-left">
            <p className="text-xs font-bold text-[#7D818A] dark:text-[#8B949E] uppercase tracking-wider mb-3 px-1">
              Suggested for {user?.name || "you"}:
            </p>
            <div className="grid grid-cols-1 gap-2.5">
              {getRolePrompts().map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => onQuickPrompt && onQuickPrompt(p.text)}
                  className="flex items-center gap-3 p-4 bg-[#FFFFFF] dark:bg-[#161D27] border border-[#E9F2FE] dark:border-white/10 hover:border-[#1868DB] dark:hover:border-[#388BFD] hover:bg-[#E9F2FE]/50 dark:hover:bg-[#1C2433] rounded-[14px] text-left text-sm text-[#292A2E] dark:text-[#F0F6FC] shadow-loom-small transition-all group"
                >
                  <span className="text-lg">{p.icon}</span>
                  <span className="flex-1 font-sans font-normal text-sm group-hover:text-[#1868DB] dark:group-hover:text-[#58A6FF]">{p.text}</span>
                  <span className="text-xs text-[#1868DB] dark:text-[#58A6FF] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Ask →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {messages.map((m, i) => (
            <ChatMessage
              key={i}
              message={m}
              onSpeak={onSpeak}
              onQuickAction={onQuickPrompt}
            />
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3.5 my-4 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-[#FFFFFF] dark:bg-[#161D27] border border-[#8FB8F6] dark:border-white/10 text-[#1868DB] dark:text-[#58A6FF] flex items-center justify-center shrink-0 shadow-loom-small">
                <Sparkles className="w-5 h-5 animate-pulse text-[#1868DB] dark:text-[#58A6FF]" />
              </div>
              <div className="bg-[#FFFFFF] dark:bg-[#161D27] border border-[#E9F2FE] dark:border-white/10 rounded-[28px] rounded-tl-none p-5 shadow-loom-small flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1868DB] dark:bg-[#388BFD] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#1868DB] dark:bg-[#388BFD] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-[#1868DB] dark:bg-[#388BFD] animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-xs text-[#6C6F77] dark:text-[#8B949E] ml-2 font-sans font-normal">XYZ is reasoning...</span>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
