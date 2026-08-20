import { useRef } from "react";
import { Send, Mic } from "lucide-react";

export function InputForm({
  value,
  onChange,
  onSubmit,
  isLoading,
  isListening,
  onVoiceClick,
  userRole = "student",
  userName = "",
}) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit(e);
  };

  const getPlaceholder = () => {
    if (isListening) return "Listening to your microphone...";
    switch (userRole) {
      case "student":
        return `Ask about your attendance, streak, or subject schedule...`;
      case "parent":
        return `Ask about your child's attendance or request teacher callback...`;
      case "teacher":
        return `E.g., "Mark Aarav present today" or "Show Class 1A summary"...`;
      case "principal":
        return `Query institutional compliance, class averages, or risk flags...`;
      default:
        return `Type an inquiry or instruction...`;
    }
  };

  return (
    <div className="p-3 bg-[#121212] border-t border-[#2E2E2E]">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={onVoiceClick}
          disabled={isLoading}
          className={`h-9 px-3 rounded-[6px] transition-all duration-150 shrink-0 flex items-center justify-center gap-1.5 text-xs font-semibold ${
            isListening
              ? "bg-[#DC7B18] text-white animate-pulse"
              : "bg-[#1C1C1C] text-[#3FCF8E] border border-[#2E2E2E] hover:border-[#3FCF8E]/50 hover:bg-[#242424]"
          }`}
          title={isListening ? "Listening... Click to stop" : "Speak with Voice"}
        >
          <Mic className={`w-3.5 h-3.5 ${isListening ? "text-white" : "text-[#3FCF8E]"}`} />
          <span className="hidden sm:inline">
            {isListening ? "Listening..." : "Voice"}
          </span>
        </button>

        {/* Input Text Box */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={isLoading}
            className="w-full h-9 rounded-[6px] px-3 bg-[#1C1C1C] text-[#FFFFFF] border border-[#2E2E2E] text-xs placeholder:text-[#808080] focus:outline-none focus:border-[#3FCF8E] focus:ring-1 focus:ring-[#3FCF8E]/30 transition-all font-sans"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="btn-primary h-9 px-4 rounded-[6px] shrink-0 flex items-center gap-1.5 text-xs font-semibold"
          title="Send query"
        >
          <span>Send</span>
          <Send className="w-3 h-3" />
        </button>
      </form>
      <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] font-mono text-[#808080]">
        <span>AI School Copilot • 11 Languages • Server-Verified RBAC</span>
        <span>Press Enter ↵ to send</span>
      </div>
    </div>
  );
}
