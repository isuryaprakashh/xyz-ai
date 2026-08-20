import { useState, useCallback, useEffect, useRef } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginScreen } from "./components/LoginScreen";
import { DemoPage } from "./components/DemoPage";
import { ChatArea } from "./components/ChatArea";
import { InputForm } from "./components/InputForm";
import { AvatarSection } from "./components/AvatarSection";
import { LanguageSelector } from "./components/LanguageSelector";
import { Dashboard } from "./components/Dashboard";
import { TimetableView } from "./components/TimetableView";
import { ManagementView } from "./components/ManagementView";
import { EscalationsView } from "./components/EscalationsView";
import { AuditLogsView } from "./components/AuditLogsView";
import { useVoice } from "./hooks/useVoice";
import { api } from "./utils/api";
import {
  MessageSquare,
  LayoutDashboard,
  Calendar,
  Building,
  PhoneCall,
  ShieldCheck,
  LogOut,
  Volume2,
  VolumeX,
  Play,
  Globe,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Bot,
} from "lucide-react";

function MainApp() {
  const { user, login, switchRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");
  const [language, setLanguage] = useState(user?.language || "en");
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarState, setAvatarState] = useState("idle");
  const [autoVoiceReply, setAutoVoiceReply] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== "undefined") return window.location.pathname || "/";
    return "/";
  });

  const navigateTo = useCallback((path) => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
      setCurrentPath(path);
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname || "/");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const prevUserIdRef = useRef(null);

  // If user role changes and they are not principal/admin, don't stay on audit or management tab
  useEffect(() => {
    if ((activeTab === "audit" || activeTab === "management") && user?.role !== "principal" && user?.role !== "admin") {
      setActiveTab("chat");
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user?.language) setLanguage(user.language);
  }, [user]);

  const { isListening, isSpeaking, start: startVoice, stop: stopVoice, speak } = useVoice({
    language,
    onTranscript: (transcript, isFinal) => {
      setInputValue(transcript);
      if (isFinal && transcript.trim()) handleSendMessage(null, transcript);
    },
    onStart: () => setAvatarState("listening"),
    onEnd: () => setAvatarState("idle"),
    onError: () => setAvatarState("idle"),
  });

  useEffect(() => {
    if (isSpeaking) setAvatarState("speaking");
    else if (!isListening && !isLoading) setAvatarState("idle");
  }, [isSpeaking, isListening, isLoading]);

  const getInitialGreeting = useCallback((u) => {
    if (!u) return "Welcome to XYZ AI. How may I assist you today?";
    switch (u.role) {
      case "student":
        return `Hello ${u.name}! 👋 I'm your Academic Assistant. Ask me about your attendance, timetable, or connect with your class teachers!`;
      case "parent":
        return `Namaste ${u.name} 🙏 I'm your Parent Support Assistant. I can help you check your child's attendance & timetable, and schedule teacher callbacks.`;
      case "teacher":
        return `Good day, ${u.name} 👩‍🏫 I'm your Teaching Assistant. View your weekly schedule, mark class attendance, or review student requests.`;
      case "principal":
        return `Welcome, ${u.name} 🏛️ I'm your Executive Assistant. Manage students & faculty, view school-wide analytics, inspect timetables, and monitor audit logs.`;
      default:
        return `Welcome ${u.name}! How may I help you today?`;
    }
  }, []);

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
      if (autoVoiceReply && res.reply) speak(res.reply, language);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "ai",
          text: "⚠️ Unable to reach the server. Please check your connection.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      if (!autoVoiceReply) setAvatarState("idle");
    }
  };

  if (!user) {
    if (currentPath === "/demo") return <DemoPage onNavigateBack={() => navigateTo("/")} />;
    return <LoginScreen onLogin={login} onNavigateDemo={() => navigateTo("/demo")} />;
  }

  const isPrincipalOrAdmin = user.role === "principal" || user.role === "admin";

  const navItems = [
    { id: "chat", label: "AI Assistant", icon: MessageSquare },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "timetable", label: "Timetable", icon: Calendar },
    { id: "escalations", label: "Escalations", icon: PhoneCall },
    ...(isPrincipalOrAdmin
      ? [
          { id: "management", label: "Management", icon: Building },
          { id: "audit", label: "Audit Log", icon: ShieldCheck },
        ]
      : []),
  ];

  const personas = [
    { u: "jeevan", label: "Jeevan", role: "Student" },
    { u: "surya", label: "Surya Prakash", role: "Teacher" },
    { u: "yashwanth", label: "Yashwanth", role: "Parent" },
    { u: "akhil", label: "Akhil", role: "Principal" },
  ];

  const roleColor = {
    student: "bg-blue-100 text-blue-700",
    teacher: "bg-emerald-100 text-emerald-700",
    parent: "bg-amber-100 text-amber-700",
    principal: "bg-purple-100 text-purple-700",
    admin: "bg-purple-100 text-purple-700",
  };

  const roleInitialBg = {
    student: "bg-blue-500",
    teacher: "bg-emerald-500",
    parent: "bg-amber-500",
    principal: "bg-purple-500",
    admin: "bg-purple-500",
  };

  return (
    <div className="h-screen flex bg-body overflow-hidden">
      {/* ═══ Mobile Sidebar Overlay ═══ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-white border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-sm">
              <Bot className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-[15px] text-text-primary block">XYZ AI</span>
              <span className="text-[11px] text-text-tertiary">School ERP Ecosystem</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
            Main
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full ${isActive ? "nav-item-active" : "nav-item"}`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4">
            <p className="px-3 mb-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
              Settings & Tools
            </p>
            <button
              onClick={() => setAutoVoiceReply(!autoVoiceReply)}
              className="w-full nav-item"
            >
              {autoVoiceReply ? (
                <Volume2 className="w-[18px] h-[18px] shrink-0 text-accent" />
              ) : (
                <VolumeX className="w-[18px] h-[18px] shrink-0" />
              )}
              <span>Voice Reply</span>
              <span
                className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  autoVoiceReply ? "bg-accent-light text-accent-dark" : "bg-gray-100 text-text-tertiary"
                }`}
              >
                {autoVoiceReply ? "On" : "Off"}
              </span>
            </button>

            <div className="nav-item cursor-default">
              <Globe className="w-[18px] h-[18px] shrink-0 text-text-secondary" />
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>

            <button
              onClick={() => navigateTo("/demo")}
              className="w-full nav-item"
            >
              <Play className="w-[18px] h-[18px] shrink-0" />
              <span>Demo Mode</span>
            </button>
          </div>
        </nav>

        {/* User Profile Card (Bottom) */}
        <div className="border-t border-border p-3 shrink-0">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                className={`w-9 h-9 rounded-lg ${roleInitialBg[user.role] || "bg-gray-400"} text-white font-bold text-sm flex items-center justify-center shrink-0`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
                <p className="text-[11px] text-text-tertiary capitalize">{user.role}</p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-border rounded-xl shadow-modal p-2 animate-scale-in z-30">
                <p className="px-2.5 py-1.5 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
                  Switch User
                </p>
                {personas.map((p) => (
                  <button
                    key={p.u}
                    onClick={() => {
                      switchRole(p.u);
                      setUserMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                      user.username === p.u || user.username === p.label.toLowerCase()
                        ? "bg-accent-light/60 text-accent-dark font-semibold"
                        : "text-text-primary hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex-1 text-left">{p.label}</span>
                    <span className="text-[11px] text-text-tertiary">{p.role}</span>
                  </button>
                ))}
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-danger hover:bg-danger-light transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-border px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg font-bold text-text-primary">
                {activeTab === "chat"
                  ? `Hello, ${user.name} 👋`
                  : activeTab === "dashboard"
                  ? "Dashboard & Attendance"
                  : activeTab === "timetable"
                  ? "Academic Timetable"
                  : activeTab === "management"
                  ? "Institutional Management"
                  : activeTab === "escalations"
                  ? "Escalation Hub"
                  : "Security Audit Log"}
              </h1>
              <p className="text-[12px] text-text-tertiary hidden sm:block">
                {activeTab === "chat"
                  ? "Your AI school assistant is ready to help."
                  : activeTab === "dashboard"
                  ? "Classroom rosters and institutional attendance analytics."
                  : activeTab === "timetable"
                  ? "Class schedules, period timings, and faculty assignments."
                  : activeTab === "management"
                  ? "Administrative CRUD for Students, Faculty, and Classrooms."
                  : activeTab === "escalations"
                  ? "Support tickets and teacher callbacks."
                  : "Zero-Trust RBAC and security audit trail."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`badge ${roleColor[user.role] || "badge-gray"} hidden sm:inline-flex`}>
              <span className="capitalize">{user.role}</span>
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "chat" && (
            <div className="h-full flex flex-col lg:flex-row">
              {/* Chat Panel */}
              <div className="flex-1 flex flex-col min-w-0">
                <ChatArea
                  messages={messages}
                  userRole={user.role}
                  userName={user.name}
                  isLoading={isLoading}
                  onQuickPrompt={(prompt) => handleSendMessage(null, prompt)}
                  user={user}
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

              {/* Avatar Sidebar (Desktop) */}
              <div className="hidden lg:block w-[320px] border-l border-border">
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
          {activeTab === "timetable" && (
            <TimetableView
              user={user}
              onNavigateToAttendance={() => setActiveTab("dashboard")}
            />
          )}
          {activeTab === "management" && isPrincipalOrAdmin && (
            <ManagementView user={user} />
          )}
          {activeTab === "escalations" && <EscalationsView user={user} />}
          {activeTab === "audit" && isPrincipalOrAdmin && <AuditLogsView />}
        </main>
      </div>
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
