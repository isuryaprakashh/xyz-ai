import { useRef } from "react";
import { Send, Mic, Sparkles } from "lucide-react";

export function InputForm({
  value,
  onChange,
  onSubmit,
  isLoading,
  isListening,
  onVoiceClick,
  placeholder = "Ask about attendance, analytics, or mark records...",
}) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit(e);
  };

  return (
    <div className="p-4 sm:p-6 bg-[#FFFFFF] dark:bg-[#0D1117] border-t border-[#E9F2FE] dark:border-white/10 shadow-loom-header">
      <form onSubmit={handleSubmit} className="flex items-center gap-3 max-w-4xl mx-auto">
        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={onVoiceClick}
          disabled={isLoading}
          className={`h-12 px-4 rounded-full transition-all duration-200 shrink-0 flex items-center justify-center gap-2 ${
            isListening
              ? "bg-[#FF613D] text-white shadow-loom-medium animate-pulse"
              : "bg-[#FFFFFF] dark:bg-[#161D27] text-[#292A2E] dark:text-[#F0F6FC] border border-[#E9F2FE] dark:border-white/10 hover:bg-[#E9F2FE] dark:hover:bg-[#1E293B] hover:border-[#8FB8F6] dark:hover:border-white/20 shadow-loom-small"
          }`}
          title={isListening ? "Listening... Click to stop" : "Voice Input"}
        >
          <Mic className={`w-5 h-5 ${isListening ? "text-white" : "text-[#1868DB] dark:text-[#58A6FF]"}`} />
          <span className="text-xs font-semibold hidden sm:inline">
            {isListening ? "Listening..." : "Voice"}
          </span>
        </button>

        {/* Input Text Box (48px height, 14px radius) */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isListening ? "Listening to your voice..." : placeholder}
            disabled={isLoading}
            className="w-full h-12 rounded-[14px] px-4 py-3 bg-[#FFFFFF] dark:bg-[#161D27] text-[#292A2E] dark:text-[#F0F6FC] border border-[#7D818A] dark:border-white/15 text-sm placeholder:text-[#8C8F97] dark:placeholder:text-[#6E7681] focus:outline-none focus:border-[#1868DB] dark:focus:border-[#388BFD] focus:border-2 focus:ring-4 focus:ring-[#1868DB]/10 dark:focus:ring-[#388BFD]/20 shadow-sm transition-all"
          />
        </div>

        {/* Send Button (Pill shape) */}
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="btn-primary h-12 px-6 rounded-full shrink-0 flex items-center gap-2"
          title="Send message"
        >
          <span>Send</span>
          {isLoading ? (
            <Sparkles className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4 text-white" />
          )}
        </button>
      </form>

      <div className="text-center mt-2.5">
        <span className="text-xs text-[#7D818A] dark:text-[#8B949E] font-sans font-normal">
          AI School Copilot • 11 Languages • Server-side Verified RBAC
        </span>
      </div>
    </div>
  );
}
