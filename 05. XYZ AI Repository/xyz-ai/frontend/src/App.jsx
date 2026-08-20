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
  Sun,
  Moon,
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
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("xyz_theme") || "light";
    }
    return "light";
  });

  const prevUserIdRef = useRef(null);

  // Apply dark mode class to root HTML
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("xyz_theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

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
  });

  // Welcome message from AI when user changes
  useEffect(() => {
    const currentUserId = user?.userId || user?.id;
    if (user && currentUserId !== prevUserIdRef.current) {
      prevUserIdRef.current = currentUserId;
      setMessages([]);
      setSessionId(null);

      const initGreeting = async () => {
        setIsLoading(true);
        try {
          const res = await api.sendChat({
            message: "Hello",
            language,
            userId: currentUserId,
          });
          setSessionId(res.sessionId);
          if (res.reply) {
            setMessages([
              {
                role: "assistant",
                content: res.reply,
                toolResult: res.toolResult,
                timestamp: new Date().toISOString(),
              },
            ]);
          }
        } catch (e) {
          setMessages([
            {
              role: "assistant",
              content: `Hello ${user.name}! I am XYZ AI, your school assistant. How can I assist you today?`,
              timestamp: new Date().toISOString(),
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      };
      initGreeting();
    }
  }, [user?.id, user?.userId, language, user]);

  const handleSendMessage = useCallback(
    async (e, overrideText = null) => {
      if (e) e.preventDefault();
      const text = (overrideText !== null ? overrideText : inputValue).trim();
      if (!text || isLoading) return;

      const userMsg = {
        role: "user",
        content: text,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsLoading(true);
      setAvatarState("thinking");

      try {
        const data = await api.sendChat({
          message: text,
          sessionId,
          language,
          userId: user?.userId || user?.id,
        });

        const replyContent = data.reply || "I am processing your request.";
        const assistantMsg = {
          role: "assistant",
          content: replyContent,
          toolResult: data.toolResult,
          intent: data.intent,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setSessionId(data.sessionId);

        if (autoVoiceReply && replyContent) {
          setAvatarState("talking");
          speak(replyContent, () => setAvatarState("idle"));
        } else {
          setAvatarState("idle");
        }
      } catch (err) {
        console.error("Chat error:", err);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "⚠️ I encountered an error communicating with the server. Please try again.",
            timestamp: new Date().toISOString(),
          },
        ]);
        setAvatarState("idle");
      } finally {
        setIsLoading(false);
      }
    },
    [inputValue, isLoading, sessionId, language, user, autoVoiceReply, speak]
  );

  const handleSpeakMessage = useCallback(
    (text) => {
      setAvatarState("talking");
      speak(text, () => setAvatarState("idle"));
    },
    [speak]
  );

  // Unauthenticated routing
  if (!user) {
    if (currentPath === "/demo") {
      return (
        <DemoPage
          onLogin={login}
          onNavigateHome={() => navigateTo("/")}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      );
    }
    return (
      <LoginScreen
        onLogin={login}
        onNavigateDemo={() => navigateTo("/demo")}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const tabs = [
    { id: "chat", label: "AI Assistant", icon: MessageSquare },
    { id: "dashboard", label: "Workspace", icon: LayoutDashboard },
    { id: "escalations", label: "Escalations", icon: PhoneCall },
    { id: "audit", label: "Audit Log", icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#FFFFFF] dark:bg-[#0A0D12] text-[#292A2E] dark:text-[#F0F6FC] transition-colors">
      {/* Header: 90px height, 36px padding */}
      <header className="h-[90px] px-4 sm:px-9 bg-[#FFFFFF] dark:bg-[#0D1117] border-b border-[#E9F2FE] dark:border-white/10 shadow-loom-header flex items-center justify-between z-20 shrink-0">
        {/* Brand & Tabs */}
        <div className="flex items-center gap-4 sm:gap-10 h-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1868DB] flex items-center justify-center text-white shadow-loom-medium shrink-0">
              <span className="font-display text-xl font-bold">X</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-2xl text-[#292A2E] dark:text-[#F0F6FC] tracking-tight block leading-none">
                XYZ AI
              </span>
              <span className="text-[10px] text-[#7D818A] dark:text-[#8B949E] font-semibold uppercase tracking-wider">
                School Ecosystem
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-3 h-full">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`h-full flex items-center gap-2 px-3 sm:px-4 text-sm font-sans transition-all relative ${
                    isActive
                      ? "text-[#1868DB] dark:text-[#58A6FF] font-bold border-b-[3px] border-[#1868DB] dark:border-[#58A6FF]"
                      : "text-[#292A2E] dark:text-[#8B949E] hover:text-[#1868DB] dark:hover:text-white font-normal"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <LanguageSelector value={language} onChange={setLanguage} />

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-[#E9F2FE] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#161D27] text-[#292A2E] dark:text-[#F0F6FC] flex items-center justify-center transition-all shadow-loom-small hover:border-[#8FB8F6] dark:hover:border-white/25"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[#FFA900]" />
            ) : (
              <Moon className="w-4 h-4 text-[#1868DB]" />
            )}
          </button>

          {/* Voice Toggle */}
          <button
            onClick={() => setAutoVoiceReply(!autoVoiceReply)}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
              autoVoiceReply
                ? "bg-[#E9F2FE] dark:bg-[#162744] text-[#1868DB] dark:text-[#58A6FF] border-[#8FB8F6] dark:border-[#388BFD]/40"
                : "bg-[#FFFFFF] dark:bg-[#161D27] text-[#7D818A] dark:text-[#8B949E] border-[#E9F2FE] dark:border-white/10"
            }`}
            title={autoVoiceReply ? "Voice enabled" : "Voice muted"}
          >
            {autoVoiceReply ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* User Profile Chip & Persona Switcher */}
          <div className="relative group">
            <button
              aria-label="User profile & persona options"
              className="h-10 px-3.5 bg-[#FFFFFF] dark:bg-[#161D27] border border-[#E9F2FE] dark:border-white/10 hover:border-[#8FB8F6] dark:hover:border-white/25 rounded-full shadow-loom-small flex items-center gap-2.5 transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#1868DB] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC] block leading-tight truncate max-w-[110px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-[#6C6F77] dark:text-[#8B949E] capitalize leading-none block">
                  {user.role}
                </span>
              </div>
            </button>

            {/* Dropdown Menu on Hover / Focus */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#FFFFFF] dark:bg-[#161D27] border border-[#E9F2FE] dark:border-white/10 rounded-[24px] shadow-loom-large p-4 space-y-3 hidden group-hover:block group-focus-within:block z-30 animate-fade-in text-[#292A2E] dark:text-[#F0F6FC]">
              <div className="pb-2.5 border-b border-[#E9F2FE] dark:border-white/10">
                <p className="text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC]">{user.name}</p>
                <p className="text-[11px] text-[#7D818A] dark:text-[#8B949E]">@{user.username} • <span className="capitalize text-[#1868DB] dark:text-[#58A6FF] font-semibold">{user.role}</span></p>
                {user.classId && <p className="text-[11px] text-[#6C6F77] dark:text-[#8B949E] mt-0.5">Class: {user.classId.toUpperCase()}</p>}
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#7D818A] dark:text-[#8B949E] uppercase tracking-wider mb-2">
                  Switch Demo Persona:
                </p>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { u: "Rahul", label: "Rahul Sharma", role: "Student" },
                    { u: "Meera", label: "Meera Sharma", role: "Parent" },
                    { u: "AnanyaS", label: "Ananya Sharma", role: "Teacher" },
                    { u: "Rajesh", label: "Rajesh Kumar", role: "Principal" },
                  ].map((p) => (
                    <button
                      key={p.u}
                      onClick={() => switchRole(p.u)}
                      className={`w-full text-left px-3 py-1.5 rounded-[12px] text-xs transition-colors flex items-center justify-between ${
                        user.username === p.u
                          ? "bg-[#E9F2FE] dark:bg-[#162744] text-[#1868DB] dark:text-[#58A6FF] font-bold"
                          : "hover:bg-[#E9F2FE]/60 dark:hover:bg-white/5 text-[#292A2E] dark:text-[#F0F6FC]"
                      }`}
                    >
                      <span>{p.label}</span>
                      <span className="text-[10px] text-[#7D818A] dark:text-[#8B949E] capitalize">({p.role})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E9F2FE] dark:border-white/10">
                <button
                  onClick={logout}
                  className="w-full py-1.5 px-3 rounded-[12px] bg-[#F8EEFE] dark:bg-[#2B153D] hover:bg-[#FF613D] text-[#FF613D] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out ({user.name.split(" ")[0]})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden bg-[#EFF0FF]/40 dark:bg-[#0A0D12]">
        {activeTab === "chat" && (
          <>
            <section className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF] dark:bg-[#0D1117]">
              <ChatArea
                messages={messages}
                isLoading={isLoading}
                onSpeak={handleSpeakMessage}
                onQuickPrompt={(p) => handleSendMessage(null, p)}
                user={user}
              />
              <InputForm
                value={inputValue}
                onChange={setInputValue}
                onSubmit={handleSendMessage}
                isLoading={isLoading}
                isListening={isListening}
                onVoiceClick={isListening ? stopVoice : startVoice}
                placeholder={`Ask XYZ AI as ${user.name} (${user.role})...`}
              />
            </section>
            <AvatarSection
              avatarState={avatarState}
              isSpeaking={isSpeaking}
              user={user}
            />
          </>
        )}

        {activeTab === "dashboard" && (
          <Dashboard user={user} onNavigateToChat={() => setActiveTab("chat")} />
        )}

        {activeTab === "escalations" && <EscalationsView user={user} />}

        {activeTab === "audit" && <AuditLogsView />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden h-16 bg-[#FFFFFF] dark:bg-[#0D1117] border-t border-[#E9F2FE] dark:border-white/10 shadow-lg flex items-center justify-around z-20 shrink-0 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 text-[11px] font-sans transition-all ${
                isActive ? "text-[#1868DB] dark:text-[#58A6FF] font-bold" : "text-[#7D818A] dark:text-[#8B949E]"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#1868DB] dark:text-[#58A6FF]" : "text-[#7D818A] dark:text-[#8B949E]"}`} />
              <span>{tab.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
