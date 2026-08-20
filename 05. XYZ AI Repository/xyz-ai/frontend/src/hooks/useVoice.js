import { useState, useRef, useCallback, useEffect } from "react";
import { createSpeechRecognition, speakText, stopSpeaking, isSpeechSupported } from "../utils/speech";

export function useVoice({ language = "en", onTranscript, onStart, onEnd }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setSupported(isSpeechSupported());
  }, []);

  const start = useCallback(() => {
    if (!isSpeechSupported()) {
      alert("Voice input is supported in Google Chrome, Microsoft Edge, and modern browsers.");
      return;
    }

    // Stop speaking if assistant is currently talking
    stopSpeaking();
    setIsSpeaking(false);

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = createSpeechRecognition(
        language,
        (transcript, isFinal) => {
          if (onTranscript) onTranscript(transcript, isFinal);
        },
        () => {
          setIsListening(false);
          if (onEnd) onEnd();
        },
        (err) => {
          console.warn("Speech error:", err);
          setIsListening(false);
          if (onEnd) onEnd();
        }
      );

      if (recognition) {
        recognitionRef.current = recognition;
        setIsListening(true);
        if (onStart) onStart();
        recognition.start();
      }
    } catch (err) {
      console.error("Failed to start voice recognition:", err);
      setIsListening(false);
      if (onEnd) onEnd();
    }
  }, [language, onTranscript, onStart, onEnd]);

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (onEnd) onEnd();
  }, [onEnd]);

  const speak = useCallback(
    (text, onDone) => {
      if (!text) return;
      setIsSpeaking(true);
      speakText(
        text,
        language,
        () => setIsSpeaking(true),
        () => {
          setIsSpeaking(false);
          if (onDone) onDone();
        }
      );
    },
    [language]
  );

  const stopAll = useCallback(() => {
    stop();
    stopSpeaking();
    setIsSpeaking(false);
  }, [stop]);

  return {
    isListening,
    isSpeaking,
    supported,
    start,
    stop,
    speak,
    stopAll,
  };
}
