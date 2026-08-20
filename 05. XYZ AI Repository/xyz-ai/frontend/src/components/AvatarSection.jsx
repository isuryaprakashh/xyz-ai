import { Avatar } from "./Avatar";
import { ShieldCheck, Cpu, Database, Mic, MicOff } from "lucide-react";

export function AvatarSection({ avatarState, userRole, userName, isListening, isSpeaking, onMicToggle }) {
  const stateColors = {
    speaking: "badge-pink",
    listening: "badge-yellow",
    thinking: "badge-pink",
    idle: "badge-gray",
  };

  return (
    <div className="flex flex-col gap-4 p-5 h-full">
      {/* Avatar Card */}
      <div className="card p-5 flex flex-col items-center text-center">
        {/* Status */}
        <div className="w-full flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-text-tertiary">AI Avatar</span>
          <span className={`badge ${stateColors[avatarState] || "badge-gray"} capitalize`}>
            {avatarState}
          </span>
        </div>

        {/* Avatar Display */}
        <div className="py-4">
          <Avatar state={avatarState} isSpeaking={isSpeaking} />
        </div>

        {/* Mic Button */}
        <button
          onClick={onMicToggle}
          className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
            isListening
              ? "bg-danger text-white animate-pulse"
              : "bg-pink-50 hover:bg-pink-100 text-accent-dark border border-pink-200"
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-accent" />}
          <span>{isListening ? "Listening... Click to stop" : "Speak with Avatar"}</span>
        </button>
      </div>

      {/* Context Card */}
      <div className="card p-5 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-text-primary">{userName}</span>
          <span className="badge-pink capitalize text-[11px]">{userRole}</span>
        </div>

        <div className="p-3 rounded-xl bg-pink-50/50 border border-pink-200/60 space-y-1.5 text-xs text-text-secondary">
          <div className="flex items-center gap-2 text-accent font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>RBAC Guard Active</span>
          </div>
          <p className="leading-relaxed">
            All actions verified against JWT credentials and MongoDB access tables.
          </p>
        </div>

        {/* System Info */}
        <div className="space-y-2 text-xs text-text-tertiary">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-accent" />
              NLU Engine
            </span>
            <span className="text-text-secondary font-medium">Gemini 2.5 Flash</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-accent" />
              Database
            </span>
            <span className="text-accent font-medium">MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
