import { Globe } from "lucide-react";
import { LANGUAGE_OPTIONS } from "../utils/speech";

export function LanguageSelector({ value = "en", onChange }) {
  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-1.5 bg-[#1C1C1C] border border-[#2E2E2E] hover:border-[#3FCF8E]/40 rounded-[4px] px-2.5 py-1 text-xs transition-all">
        <Globe className="w-3.5 h-3.5 text-[#3FCF8E]" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Select Assistant Language"
          className="bg-transparent text-[#EDEDED] text-xs font-sans focus:outline-none cursor-pointer pr-1"
        >
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-[#1C1C1C] text-[#EDEDED]">
              {lang.flag} {lang.label} ({lang.native})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
