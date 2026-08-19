import { Globe } from "lucide-react";
import { LANGUAGE_OPTIONS } from "../utils/speech";

export function LanguageSelector({ value = "en", onChange }) {
  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-2 bg-[#FFFFFF] dark:bg-[#161D27] border border-[#E9F2FE] dark:border-white/10 hover:border-[#8FB8F6] dark:hover:border-white/25 rounded-full px-3.5 py-2 text-sm shadow-loom-small transition-all">
        <Globe className="w-4 h-4 text-[#1868DB] dark:text-[#58A6FF]" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Select Assistant Language"
          className="bg-transparent text-[#292A2E] dark:text-[#F0F6FC] text-sm font-sans font-normal focus:outline-none cursor-pointer pr-1"
        >
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-[#FFFFFF] dark:bg-[#161D27] text-[#292A2E] dark:text-[#F0F6FC]">
              {lang.flag} {lang.label} ({lang.native})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
