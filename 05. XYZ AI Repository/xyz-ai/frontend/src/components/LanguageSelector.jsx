import { Globe } from "lucide-react";
import { LANGUAGE_OPTIONS } from "../utils/speech";

export function LanguageSelector({ value = "en", onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Select Language"
      className="flex-1 bg-transparent text-sm text-text-primary focus:outline-none cursor-pointer"
    >
      {LANGUAGE_OPTIONS.map((lang) => (
        <option key={lang.code} value={lang.code} className="bg-white text-text-primary">
          {lang.flag} {lang.label}
        </option>
      ))}
    </select>
  );
}
