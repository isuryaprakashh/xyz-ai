export function VoiceButton({ isListening, onClick, disabled }) {
  return (
    <button 
      className={`btn-tertiary ${isListening ? "bg-primary/10 text-primary" : ""}`} 
      onClick={onClick} 
      disabled={disabled}
    >
      {isListening ? "🔴 Listening..." : "🎤 Voice"}
    </button>
  );
}
