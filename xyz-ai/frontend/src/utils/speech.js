export const SPEECH_CODES = {
  en: "en-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  bn: "bn-IN",
  gu: "gu-IN",
  pa: "pa-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  ur: "ur-IN",
};

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English", native: "English", flag: "🌐" },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { code: "bn", label: "Bengali", native: "বাংলা", flag: "🇮🇳" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { code: "ur", label: "Urdu", native: "اردو", flag: "🇮🇳" },
];

export function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isSpeechSupported() {
  return !!getSpeechRecognition();
}

export function createSpeechRecognition(lang, onResult, onEnd, onError) {
  const SpeechRecognition = getSpeechRecognition();
  if (!SpeechRecognition) return null;

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_CODES[lang] || "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const results = Array.from(e.results);
      const transcript = results.map((r) => r[0].transcript).join("");
      const isFinal = results[0]?.isFinal;
      onResult(transcript, isFinal);
    };

    recognition.onend = onEnd;
    recognition.onerror = (e) => {
      console.warn("Speech recognition error:", e.error);
      if (onError) onError(e);
    };

    return recognition;
  } catch (err) {
    console.error("Speech recognition instantiation error:", err);
    return null;
  }
}

export function speakText(text, lang = "en", onStart, onEnd) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Clean markdown symbols before speaking
  const cleanText = text
    .replace(/[#*_`~[\]()]/g, "")
    .replace(/✅|📊|⚠️|•/g, "")
    .slice(0, 350); // limit speech chunk for responsiveness

  try {
    window.speechSynthesis.cancel(); // cancel any previous utterance
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = SPEECH_CODES[lang] || "en-IN";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = (e) => {
      console.warn("TTS error:", e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("Speech synthesis failed:", e);
    if (onEnd) onEnd();
  }
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
