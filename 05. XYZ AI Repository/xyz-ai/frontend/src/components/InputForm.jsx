import { useRef } from "react";
import { Send, Mic, MicOff } from "lucide-react";

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
    if (isListening) return "Listening...";
    switch (userRole) {
      case "student":
        return "Ask about your attendance, schedule, or teachers...";
      case "parent":
        return "Ask about your child's attendance or request a callback...";
      case "teacher":
        return 'E.g., "Mark Jeevan present today" or "Class 1A summary"';
      case "principal":
        return "Query school analytics, compliance, or risk flags...";
      default:
        return "Type your message...";
    }
  };

  return (
    <div className="p-4 bg-white border-t border-border">
      <form onSubmit={handleSubmit} className="flex items-center gap-2.5">
        {/* Mic Button */}
        <button
          type="button"
          onClick={onVoiceClick}
          disabled={isLoading}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
            isListening
              ? "bg-danger text-white shadow-sm animate-pulse"
              : "bg-gray-100 text-text-secondary hover:bg-gray-200 hover:text-text-primary"
          }`}
          title={isListening ? "Stop listening" : "Voice input"}
        >
          {isListening ? <MicOff className="w-[18px] h-[18px]" /> : <Mic className="w-[18px] h-[18px]" />}
        </button>

        {/* Input */}
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={isLoading}
            className="input pr-4"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center shrink-0 hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          title="Send"
        >
          <Send className="w-[18px] h-[18px]" />
        </button>
      </form>
    </div>
  );
}
