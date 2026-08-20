import { useState, useCallback, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginScreen } from "./components/LoginScreen";
import { DemoPage } from "./components/DemoPage";
import { ChatArea } from "./components/ChatArea";
import { InputForm } from "./components/InputForm";
import { AvatarSection } from "./components/AvatarSection";
import { LanguageSelector } from "./components/LanguageSelector";
import { Dashboard } from "./components/Dashboard";
import { EscalationsView } from "./components/EscalationsView";
import { AuditLogsView } from "./components/AuditLogsView";
import { useVoice } from "./hooks/useVoice";
import { api } from "./utils/api";
import {
  MessageSquare,
  LayoutDashboard,
  PhoneCall,
  ShieldCheck,
  LogOut,
  Volume2,
  VolumeX,
  Play,
} from "lucide-react";

function MainApp() {
  const { user, login, switchRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' | 'dashboard' | 'escalations' | 'audit'
  const [language, setLanguage] = useState(user?.language || "en");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarState, setAvatarState] = useState("idle");
  const [autoVoiceReply, setAutoVoiceReply] = useState(true);

  // Client-side URL route state ('/' or '/demo')
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname || "/";
    }
    return "/";
  });

  const navigateTo = useCallback((path) => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
      setCurrentPath(path);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const prevUserIdRef = useRef(null);

  // Sync language with user profile preference
  useEffect(() => {
    if (user?.language) setLanguage(user.language);
  }, [user]);

  // Voice hook
  const { isListening, isSpeaking, start: startVoice, stop: stopVoice, speak } = useVoice({
    language,
    onTranscript: (transcript, isFinal) => {
      setInputValue(transcript);
      if (isFinal && transcript.trim()) {
        handleSendMessage(null, transcript);
      }
    },
    onStart: () => setAvatarState("listening"),
    onEnd: () => setAvatarState("idle"),
    onError: (err) => {
      console.warn("Voice input notice:", err);
      setAvatarState("idle");
    },
  });

  // Handle avatar lip-sync / state during voice synthesis
  useEffect(() => {
    if (isSpeaking) {
      setAvatarState("speaking");
    } else if (!isListening && !isLoading) {
      setAvatarState("idle");
    }
  }, [isSpeaking, isListening, isLoading]);

  // Persona Initial Greetings
  const getInitialGreeting = useCallback((u) => {
    if (!u) return "Welcome to XYZ AI. How may I assist you today?";
    switch (u.role) {
      case "student":
        return `Hello ${u.name}! 👋 I am your friendly Academic Assistant. You can ask me about your daily attendance, term progress, or subject schedules!`;
      case "parent":
        return `Namaste ${u.name}. 🙏 I am your Parent Support Assistant. I can help you monitor your child's attendance and connect with faculty.`;
      case "teacher":
        return `Good day, ${u.name}. 👩‍🏫 I am your Teaching Assistant. You can tell me to mark attendance (e.g. "Mark Aarav present today") or view class compliance.`;
      case "principal":
        return `Greetings, Dr. ${u.name.replace(/^Dr\.\s*/, "")}. 🏛️ I am your Executive Management Assistant. I can generate institutional attendance analytics and highlight risk alerts.`;
      default:
        return `Welcome ${u.name}! How may I help you today?`;
    }
  }, []);

  // Initialize or reset session on user change
  useEffect(() => {
    if (!user) return;

    if (prevUserIdRef.current !== user.id) {
      prevUserIdRef.current = user.id;
      setSessionId(null);

      setMessages([
        {
          id: `greet_${Date.now()}`,
          sender: "ai",
          text: getInitialGreeting(user),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          role: user.role,
        },
      ]);
    }
  }, [user, getInitialGreeting]);

  // Main message dispatch handler
  const handleSendMessage = async (e, directText = null) => {
    if (e) e.preventDefault();
    const textToSend = directText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      role: user.role,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);
    setAvatarState("thinking");

    try {
      const res = await api.sendMessage({
        userId: user.id,
        message: textToSend.trim(),
        language,
        sessionId,
      });

      if (res.sessionId) setSessionId(res.sessionId);

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: "ai",
        text: res.reply || "I have processed your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        role: user.role,
        actionExecuted: res.actionExecuted,
        requiresConfirmation: res.requiresConfirmation,
        ticketCreated: res.ticketCreated,
        error: res.error,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Trigger text-to-speech if voice is enabled
      if (autoVoiceReply && res.reply) {
        speak(res.reply, language);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "ai",
          text: "⚠️ Communication notice: Unable to reach the server. Please verify your connection.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      if (!autoVoiceReply) setAvatarState("idle");
    }
  };

  // If user is not logged in, show Supabase-themed Login Screen
  if (!user) {
    if (currentPath === "/demo") {
      return <DemoPage onNavigateBack={() => navigateTo("/")} />;
    }
    return (
      <LoginScreen
        onLogin={login}
        onNavigateDemo={() => navigateTo("/demo")}
      />
    );
  }

  // Navigation tab items
  const tabs = [
    { id: "chat", label: "AI Assistant", icon: MessageSquare },
    { id: "dashboard", label: "Workspace", icon: LayoutDashboard },
    { id: "escalations", label: "Escalations", icon: PhoneCall },
    { id: "audit", label: "Audit Log", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-[#EDEDED] flex flex-col justify-between font-sans selection:bg-[#3FCF8E]/30 selection:text-[#3FCF8E]">
      {/* Supabase Developer Navbar */}
      <header className="sticky top-0 z-40 bg-[#121212]/95 border-b border-[#2E2E2E] backdrop-blur-md px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6 h-full">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[4px] bg-[#3FCF8E] flex items-center justify-center text-[#000000] font-display font-extrabold text-sm shadow-sm shrink-0">
              ⚡
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-base text-[#FFFFFF] tracking-tight">
                XYZ AI
              </span>
              <span className="text-[11px] font-mono text-[#808080] hidden sm:inline">
                school.erp.v2
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 h-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-full flex items-center gap-1.5 px-3 text-xs font-medium transition-all relative ${
                    isActive
                      ? "text-[#3FCF8E] border-b-2 border-[#3FCF8E]"
                      : "text-[#808080] hover:text-[#EDEDED]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          {/* Interactive Demo Link */}
          <button
            onClick={() => navigateTo("/demo")}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-xs font-medium text-[#EDEDED] bg-[#1C1C1C] border border-[#2E2E2E] hover:border-[#3FCF8E]/50 hover:bg-[#242424] transition-all"
          >
            <Play className="w-3 h-3 text-[#3FCF8E] fill-[#3FCF8E]" />
            <span>Demo Mode</span>
          </button>

          {/* Language Selector */}
          <LanguageSelector value={language} onChange={setLanguage} />

          {/* Voice Toggle */}
          <button
            onClick={() => setAutoVoiceReply(!autoVoiceReply)}
            className={`w-8 h-8 rounded-[4px] border flex items-center justify-center transition-all ${
              autoVoiceReply
                ? "bg-[#3FCF8E]/10 text-[#3FCF8E] border-[#3FCF8E]/40"
                : "bg-[#1C1C1C] text-[#808080] border-[#2E2E2E]"
            }`}
            title={autoVoiceReply ? "Voice enabled" : "Voice muted"}
          >
            {autoVoiceReply ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* User Profile Chip & Persona Switcher */}
          <div className="relative group">
            <button
              aria-label="User profile options"
              className="h-8 px-2.5 bg-[#1C1C1C] border border-[#2E2E2E] hover:border-[#3FCF8E]/40 rounded-[4px] flex items-center gap-2 transition-all cursor-pointer"
            >
              <div className="w-5 h-5 rounded-[3px] bg-[#3FCF8E]/20 text-[#3FCF8E] font-bold flex items-center justify-center text-[10px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block leading-tight">
                <span className="text-xs font-medium text-[#EDEDED] block truncate max-w-[100px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-[#808080] capitalize font-mono block">
                  {user.role}
                </span>
              </div>
            </button>

            {/* Dropdown Menu on Hover / Focus */}
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-[#1C1C1C] border border-[#2E2E2E] rounded-[6px] shadow-supabase p-3 space-y-2.5 hidden group-hover:block group-focus-within:block z-30 animate-fade-in text-[#EDEDED]">
              <div className="pb-2 border-b border-[#2E2E2E]">
                <p className="text-xs font-semibold text-[#FFFFFF]">{user.name}</p>
                <p className="text-[11px] font-mono text-[#808080]">@{user.username} • <span className="capitalize text-[#3FCF8E]">{user.role}</span></p>
                {user.classId && <p className="text-[11px] text-[#808080] mt-0.5">Class: {user.classId.toUpperCase()}</p>}
              </div>

              <div>
                <p className="text-[10px] font-semibold text-[#808080] uppercase tracking-wider mb-1.5">
                  Quick Switch Persona:
                </p>
                <div className="space-y-1">
                  {[
                    { u: "AaravN", label: "Aarav Nair", role: "Student (1A)" },
                    { u: "MeeraS", label: "Meera Sharma", role: "Parent (Aditya 2A)" },
                    { u: "PriyaN", label: "Priya Nair", role: "Teacher (Class 1A)" },
                    { u: "AnanyaS", label: "Ananya Sharma", role: "Teacher (Class 2A)" },
                    { u: "Rajesh", label: "Dr. Rajesh Menon", role: "Principal" },
                  ].map((p) => (
                    <button
                      key={p.u}
                      onClick={() => switchRole(p.u)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-xs transition-colors flex items-center justify-between ${
                        user.username === p.u
                          ? "bg-[#3FCF8E]/15 text-[#3FCF8E] font-semibold"
                          : "hover:bg-white/5 text-[#EDEDED]"
                      }`}
                    >
                      <span className="truncate max-w-[140px]">{p.label}</span>
                      <span className="text-[10px] text-[#808080]">({p.role.split(" ")[0]})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#2E2E2E]">
                <button
                  onClick={logout}
                  className="w-full py-1 px-2.5 rounded-[4px] bg-[#DC7B18]/10 hover:bg-[#DC7B18] text-[#F3BA63] hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Interactive Body */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-3 sm:p-5">
        {activeTab === "chat" && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[calc(100vh-140px)]">
            {/* Left: Conversational Stream (8 Cols) */}
            <div className="lg:col-span-8 flex flex-col bg-[#1C1C1C] border border-[#2E2E2E] rounded-[8px] overflow-hidden">
              <ChatArea
                messages={messages}
                userRole={user.role}
                userName={user.name}
                isLoading={isLoading}
                onQuickPrompt={(prompt) => handleSendMessage(null, prompt)}
              />

              <InputForm
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSendMessage}
                onVoiceClick={isListening ? stopVoice : startVoice}
                isListening={isListening}
                isLoading={isLoading}
                userRole={user.role}
                userName={user.name}
              />
            </div>

            {/* Right: Holographic AI Avatar & RBAC Telemetry (4 Cols) */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <AvatarSection
                avatarState={avatarState}
                userRole={user.role}
                userName={user.name}
                isListening={isListening}
                isSpeaking={isSpeaking}
                onMicToggle={isListening ? stopVoice : startVoice}
              />
            </div>
          </div>
        )}

        {activeTab === "dashboard" && <Dashboard user={user} />}
        {activeTab === "escalations" && <EscalationsView user={user} />}
        {activeTab === "audit" && <AuditLogsView />}
      </main>

      {/* Supabase Footer */}
      <footer className="border-t border-[#2E2E2E] py-2.5 px-4 text-center text-xs text-[#808080] font-mono">
        XYZ AI • Classes 1–5 MongoDB Atlas Connected • Gemini 2.5 Flash NLU • Zero-Trust RBAC
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
