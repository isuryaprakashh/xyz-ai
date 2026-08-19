import { useState } from "react";
import {
  GraduationCap,
  Users,
  BookOpen,
  Building2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Play,
  Sun,
  Moon,
  MessageSquare,
  Cpu,
  Database,
  Globe,
} from "lucide-react";

export function DemoPage({ onLogin, onNavigateHome, theme = "light", onToggleTheme }) {
  const [selectedPersona, setSelectedPersona] = useState("s1");
  const [loadingPersona, setLoadingPersona] = useState(null);

  const personas = [
    {
      id: "s1",
      name: "Rahul Sharma",
      role: "student",
      username: "Rahul",
      class: "Class 8A",
      icon: GraduationCap,
      cardClass: "card-blue",
      headline: "Student Academic Copilot",
      desc: "Instant attendance checks, daily timetable insights, homework guidelines, and teacher escalation.",
      badge: "badge-secondary",
      sampleQueries: [
        "What is my overall attendance percentage?",
        "Check my attendance records for this month",
        "I want to request a callback from my class teacher",
      ],
      capabilities: [
        "View personal attendance percentage & working days",
        "Natural multi-lingual voice queries (11 languages)",
        "Request teacher / management callbacks",
      ],
    },
    {
      id: "p1",
      name: "Meera Sharma",
      role: "parent",
      username: "Meera",
      class: "Parent of Rahul (8A)",
      icon: Users,
      cardClass: "card-purple",
      headline: "Parent Monitoring & Faculty Hub",
      desc: "Transparent access to child attendance records, academic alerts, and official callback requests.",
      badge: "badge-primary",
      sampleQueries: [
        "How is Rahul's attendance this term?",
        "Request a callback from Rahul's class teacher",
        "Show me Priya's recent attendance breakdown",
      ],
      capabilities: [
        "Monitor linked child attendance records",
        "Switch between multiple enrolled children",
        "Direct human-in-the-loop faculty escalations",
      ],
    },
    {
      id: "t1",
      name: "Ananya Sharma",
      role: "teacher",
      username: "AnanyaS",
      class: "Faculty Lead (8A, 9B)",
      icon: BookOpen,
      cardClass: "card-featured",
      headline: "Teacher 1-Click Operations Desk",
      desc: "Real-time classroom student rosters, 1-click voice attendance marking, and escalation resolutions.",
      badge: "badge-purple",
      sampleQueries: [
        "Mark Rahul absent for today",
        "Mark Priya present today",
        "Show attendance summary for Class 8A",
      ],
      capabilities: [
        "1-click daily attendance marking (Voice / UI)",
        "Review and resolve parent callback tickets",
        "Classroom-level compliance telemetry",
      ],
    },
    {
      id: "m1",
      name: "Rajesh Kumar",
      role: "principal",
      username: "Rajesh",
      class: "School Leadership / Principal",
      icon: Building2,
      cardClass: "card-standard",
      headline: "Executive Institutional Intelligence",
      desc: "School-wide attendance telemetry, section-by-section comparisons, and security audit logs.",
      badge: "badge-warning",
      sampleQueries: [
        "Give me the school-wide attendance overview",
        "Show section-wise attendance breakdown",
        "Which classes have attendance below 85%?",
      ],
      capabilities: [
        "Live school-wide attendance metrics",
        "Class comparisons & risk flags (<85%)",
        "Full immutable security RBAC audit trail",
      ],
    },
  ];

  const active = personas.find((p) => p.id === selectedPersona) || personas[0];
  const ActiveIcon = active.icon;

  const handleLaunch = async (username) => {
    setLoadingPersona(username);
    try {
      await onLogin(username, "demo");
    } catch (e) {
      alert("Failed to launch demo persona.");
    } finally {
      setLoadingPersona(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#0A0D12] text-[#292A2E] dark:text-[#F0F6FC] flex flex-col justify-between p-6 sm:p-9 max-w-7xl mx-auto w-full transition-colors">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 border-b border-[#E9F2FE] dark:border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateHome}
            className="btn-secondary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1868DB] flex items-center justify-center text-white shadow-loom-medium shrink-0">
              <span className="font-display text-xl font-bold">X</span>
            </div>
            <div>
              <span className="font-display font-bold text-2xl text-[#292A2E] dark:text-[#F0F6FC] leading-none block">
                XYZ AI
              </span>
              <span className="text-[10px] text-[#7D818A] dark:text-[#8B949E] font-semibold uppercase tracking-wider">
                Live Interactive Sandbox
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-10 h-10 rounded-full border border-[#E9F2FE] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#161D27] text-[#292A2E] dark:text-[#F0F6FC] flex items-center justify-center shadow-sm hover:border-[#8FB8F6] transition-all"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#FFA900]" /> : <Moon className="w-4 h-4 text-[#1868DB]" />}
            </button>
          )}
          <span className="badge-secondary text-xs">
            Demo Environment • Preloaded Personas
          </span>
        </div>
      </header>

      {/* Main Showcase Section */}
      <main className="py-10 space-y-10">
        {/* Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E9F2FE] dark:bg-[#162744] border border-[#8FB8F6] dark:border-[#388BFD]/40 text-[#1868DB] dark:text-[#58A6FF] text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-[#1868DB] dark:text-[#58A6FF]" />
            <span>Interactive Multi-Persona Demo</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#292A2E] dark:text-[#F0F6FC]">
            Experience XYZ AI from any perspective
          </h1>
          <p className="text-sm text-[#6C6F77] dark:text-[#8B949E]">
            Select a role to preview its capabilities and sample voice queries, or launch directly into the live workspace.
          </p>
        </div>

        {/* 4 Persona Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {personas.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPersona === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPersona(p.id)}
                className={`p-6 rounded-[44px] cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[220px] ${
                  isSelected
                    ? "ring-3 ring-[#1868DB] dark:ring-[#388BFD] shadow-loom-large " + p.cardClass
                    : "bg-[#FFFFFF] dark:bg-[#161D27] border border-[#E9F2FE] dark:border-white/10 hover:border-[#8FB8F6] shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFFFFF] dark:bg-[#161D27] border border-[#8FB8F6] dark:border-white/10 flex items-center justify-center text-[#1868DB] dark:text-[#58A6FF] shadow-loom-small">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`${p.badge} text-[10px] capitalize`}>
                      {p.role}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-[#292A2E] dark:text-[#F0F6FC]">
                    {p.name}
                  </h3>
                  <span className="text-xs text-[#7D818A] dark:text-[#8B949E] block mb-2">{p.class}</span>
                  <p className="text-xs text-[#6C6F77] dark:text-[#8B949E] leading-relaxed line-clamp-2">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#8FB8F6]/30 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1868DB] dark:text-[#58A6FF]">
                    {isSelected ? "Active Selection" : "Click to Inspect"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunch(p.username);
                    }}
                    disabled={loadingPersona === p.username}
                    className="btn-primary text-xs py-1 px-3"
                  >
                    {loadingPersona === p.username ? "Loading..." : "Launch"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Persona Deep Dive Preview Card (44px radius) */}
        <div className="card-featured border-[3px] border-[#8FB8F6] dark:border-[#388BFD]/60 p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#8FB8F6]/40 dark:border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FFFFFF] dark:bg-[#161D27] border-2 border-[#8FB8F6] dark:border-[#388BFD] flex items-center justify-center text-2xl shadow-loom-small">
                <ActiveIcon className="w-7 h-7 text-[#1868DB] dark:text-[#58A6FF]" />
              </div>
              <div>
                <span className="badge-primary text-xs capitalize mb-1 inline-block">
                  {active.role} Persona
                </span>
                <h2 className="text-2xl font-display font-bold text-[#292A2E] dark:text-[#F0F6FC]">
                  {active.name} — {active.headline}
                </h2>
                <p className="text-xs text-[#6C6F77] dark:text-[#8B949E]">
                  {active.class} • Authenticated with role-restricted RBAC access
                </p>
              </div>
            </div>

            <button
              onClick={() => handleLaunch(active.username)}
              disabled={loadingPersona === active.username}
              className="btn-primary py-3 px-6 text-sm shrink-0 self-start sm:self-center flex items-center gap-2 shadow-lg"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{loadingPersona === active.username ? "Launching..." : `Launch Workspace as ${active.name.split(" ")[0]}`}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sample Inquiries to try */}
            <div className="p-6 rounded-[28px] bg-[#FFFFFF] dark:bg-[#161D27] border border-[#E9F2FE] dark:border-white/10 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-sm text-[#292A2E] dark:text-[#F0F6FC] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#1868DB] dark:text-[#58A6FF]" />
                <span>Sample Prompts for {active.role.toUpperCase()}</span>
              </h4>
              <div className="space-y-2.5">
                {active.sampleQueries.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-[14px] bg-[#E9F2FE]/50 dark:bg-[#101C2E] border border-[#8FB8F6]/30 dark:border-[#388BFD]/20 text-xs text-[#292A2E] dark:text-[#F0F6FC] font-sans flex items-center justify-between"
                  >
                    <span>&ldquo;{q}&rdquo;</span>
                    <span className="text-[10px] text-[#1868DB] dark:text-[#58A6FF] font-semibold">Try in Chat</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Role Capabilities & RBAC Scope */}
            <div className="p-6 rounded-[28px] bg-[#FFFFFF] dark:bg-[#161D27] border border-[#E9F2FE] dark:border-white/10 shadow-sm space-y-4">
              <h4 className="font-display font-bold text-sm text-[#292A2E] dark:text-[#F0F6FC] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Authorized Capabilities & RBAC Scope</span>
              </h4>
              <ul className="space-y-2.5 text-xs text-[#6C6F77] dark:text-[#8B949E]">
                {active.capabilities.map((cap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[#292A2E] dark:text-[#F0F6FC]">{cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#7D818A] dark:text-[#8B949E] pt-6 border-t border-[#E9F2FE] dark:border-white/10 flex flex-wrap items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#1868DB] dark:text-[#58A6FF]" />
          <span>11 Languages</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#1868DB] dark:text-[#58A6FF]" />
          <span>Gemini 2.0 / 3.6</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>MongoDB Atlas Connected</span>
        </div>
      </footer>
    </div>
  );
}
