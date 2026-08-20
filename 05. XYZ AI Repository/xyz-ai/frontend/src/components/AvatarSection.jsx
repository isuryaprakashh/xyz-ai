import { Avatar } from "./Avatar";
import { ShieldCheck, Database, Cpu, Mic } from "lucide-react";

export function AvatarSection({ avatarState, userRole, userName, isListening, isSpeaking, onMicToggle }) {
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Avatar Display Card */}
      <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-[8px] p-4 flex flex-col items-center justify-between text-center relative overflow-hidden">
        {/* State Indicator */}
        <div className="w-full flex items-center justify-between text-[11px] font-mono pb-2 border-b border-[#2E2E2E]">
          <span className="text-[#808080]">Avatar Visemes</span>
          <span
            className={`px-2 py-0.5 rounded-[4px] font-semibold uppercase ${
              avatarState === "speaking"
                ? "bg-[#3FCF8E]/20 text-[#3FCF8E] border border-[#3FCF8E]/40 animate-pulse"
                : avatarState === "listening"
                ? "bg-[#DC7B18]/20 text-[#F3BA63] border border-[#DC7B18]/40 animate-pulse"
                : avatarState === "thinking"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "bg-white/5 text-[#808080]"
            }`}
          >
            ● {avatarState}
          </span>
        </div>

        {/* Dynamic Holographic Avatar */}
        <div className="py-4 my-auto flex items-center justify-center">
          <Avatar state={avatarState} isSpeaking={isSpeaking} />
        </div>

        {/* Mic Action Button */}
        <button
          onClick={onMicToggle}
          className={`w-full py-2 px-3 rounded-[6px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            isListening
              ? "bg-[#DC7B18] text-white animate-pulse"
              : "bg-[#242424] hover:bg-[#2E2E2E] text-[#EDEDED] border border-[#2E2E2E] hover:border-[#3FCF8E]/50"
          }`}
        >
          <Mic className={`w-3.5 h-3.5 ${isListening ? "text-white" : "text-[#3FCF8E]"}`} />
          <span>{isListening ? "Listening... Click to Stop" : "Click to Speak with Avatar"}</span>
        </button>
      </div>

      {/* Persona Context Card */}
      <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-[8px] p-4 text-xs space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#2E2E2E]">
          <span className="font-semibold text-[#FFFFFF]">{userName}</span>
          <span className="px-2 py-0.5 rounded-[4px] font-mono text-[10px] font-bold bg-[#3FCF8E]/10 border border-[#3FCF8E]/30 text-[#3FCF8E] uppercase">
            {userRole}
          </span>
        </div>

        <div className="p-2.5 rounded-[6px] bg-[#121212] border border-[#2E2E2E] space-y-1 text-[11px] text-[#808080]">
          <div className="flex items-center gap-1.5 text-[#3FCF8E] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Trust RBAC Guard Active</span>
          </div>
          <p className="leading-tight">
            Queries and actions are verified against JWT credentials and MongoDB relationship tables.
          </p>
        </div>

        {/* System Telemetry Specs */}
        <div className="space-y-1.5 pt-1 text-[11px] font-mono text-[#808080]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-[#3FCF8E]" />
              <span>NLU Engine:</span>
            </span>
            <span className="text-[#EDEDED]">Gemini 2.5 Flash</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3 text-[#3FCF8E]" />
              <span>Database:</span>
            </span>
            <span className="text-[#3FCF8E]">MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
