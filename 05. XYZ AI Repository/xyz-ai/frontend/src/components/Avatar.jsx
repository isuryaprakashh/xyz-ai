import { useState, useEffect } from "react";
import { Sparkles, Mic, Brain, Volume2 } from "lucide-react";

export function Avatar({ state = "idle", isSpeaking = false }) {
  const [mouthPhase, setMouthPhase] = useState(0);
  const [blink, setBlink] = useState(false);

  const effectiveState = isSpeaking ? "talking" : state;

  // Mouth viseme animation during speech
  useEffect(() => {
    if (effectiveState === "talking") {
      const interval = setInterval(() => {
        setMouthPhase((prev) => (prev + 1) % 4);
      }, 120);
      return () => clearInterval(interval);
    } else {
      setMouthPhase(0);
    }
  }, [effectiveState]);

  // Natural blink cycle
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 180);
    }, 4000);
    return () => clearInterval(blinkInterval);
  }, []);

  const stateConfig = {
    idle: {
      color: "from-[#ec4899] to-[#f472b6]",
      label: "AI Ready",
      icon: Sparkles,
      badge: "badge-pink",
    },
    listening: {
      color: "from-[#f43f5e] to-[#fb7185]",
      label: "Listening...",
      icon: Mic,
      badge: "badge-warning",
    },
    thinking: {
      color: "from-[#db2777] to-[#ec4899]",
      label: "Reasoning...",
      icon: Brain,
      badge: "badge-pink",
    },
    talking: {
      color: "from-[#ec4899] to-[#f43f5e]",
      label: "Speaking...",
      icon: Volume2,
      badge: "badge-pink",
    },
  };

  const current = stateConfig[effectiveState] || stateConfig.idle;
  const StateIcon = current.icon;

  const getMouthD = () => {
    if (effectiveState === "talking") {
      switch (mouthPhase) {
        case 0:
          return "M 38 68 Q 50 80 62 68 Q 50 72 38 68";
        case 1:
          return "M 36 68 Q 50 76 64 68 Q 50 82 36 68";
        case 2:
          return "M 37 69 Q 50 74 63 69 Q 50 72 37 69";
        case 3:
          return "M 36 68 Q 50 78 64 68 Q 50 70 36 68";
        default:
          return "M 38 68 Q 50 76 62 68";
      }
    }
    if (effectiveState === "thinking") {
      return "M 42 70 Q 50 68 58 70";
    }
    return "M 36 68 Q 50 76 64 68";
  };

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Soft Pink Background Glow */}
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-tr ${current.color} opacity-25 blur-xl transition-all duration-500 ${
            effectiveState !== "idle" ? "scale-110 opacity-45" : ""
          }`}
        />

        {/* Orbiting Ring for Thinking */}
        {effectiveState === "thinking" && (
          <div
            className="absolute inset-[-6px] rounded-full border-2 border-dashed border-[#ec4899] animate-spin pointer-events-none opacity-70"
            style={{ animationDuration: "6s" }}
          />
        )}

        {/* Assistant Orb */}
        <div className="relative w-24 h-24 rounded-full bg-white border-2 border-[#f472b6] shadow-pink flex items-center justify-center overflow-hidden transition-colors">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="pinkLoomGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* Base Interior */}
            <circle cx="50" cy="50" r="44" className="fill-[#fdf2f8]" />

            {/* Forehead Brand Indicator */}
            <circle cx="50" cy="24" r="3" fill="#ec4899">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
            </circle>

            {/* Left Eye */}
            <g transform="translate(34, 44)">
              {blink ? (
                <line x1="-7" y1="0" x2="7" y2="0" stroke="#db2777" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <>
                  <ellipse cx="0" cy="0" rx="6" ry="7" className="fill-[#241022]" />
                  <ellipse cx="0" cy="0" rx="4" ry="5" fill="#ec4899" />
                  <circle cx="-1.5" cy="-1.5" r="1.5" fill="#ffffff" />
                </>
              )}
            </g>

            {/* Right Eye */}
            <g transform="translate(66, 44)">
              {blink ? (
                <line x1="-7" y1="0" x2="7" y2="0" stroke="#db2777" strokeWidth="2.5" strokeLinecap="round" />
              ) : (
                <>
                  <ellipse cx="0" cy="0" rx="6" ry="7" className="fill-[#241022]" />
                  <ellipse cx="0" cy="0" rx="4" ry="5" fill="#ec4899" />
                  <circle cx="-1.5" cy="-1.5" r="1.5" fill="#ffffff" />
                </>
              )}
            </g>

            {/* Rosy Cheeks */}
            <circle cx="28" cy="54" r="3.5" fill="#f472b6" opacity="0.4" />
            <circle cx="72" cy="54" r="3.5" fill="#f472b6" opacity="0.4" />

            {/* Mouth */}
            <path
              d={getMouthD()}
              stroke="#241022"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill={effectiveState === "talking" ? "#f43f5e" : "none"}
              className="transition-all duration-75"
            />
          </svg>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`mt-2 ${current.badge} shadow-sm`}>
        <StateIcon className={`w-3.5 h-3.5 ${effectiveState === "thinking" ? "animate-spin" : ""}`} />
        <span>{current.label}</span>
      </div>
    </div>
  );
}
