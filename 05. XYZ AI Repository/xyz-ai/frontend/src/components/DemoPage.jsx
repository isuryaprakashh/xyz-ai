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
  Cpu,
  Database,
  Globe,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function DemoPage({ onNavigateBack }) {
  const { login } = useAuth();
  const [selectedPersona, setSelectedPersona] = useState("s1");
  const [loadingPersona, setLoadingPersona] = useState(null);

  const personas = [
    {
      id: "s1",
      name: "Aarav Nair",
      role: "student",
      username: "AaravN",
      class: "Class 1A (Grade 1)",
      icon: GraduationCap,
      headline: "Student Academic Copilot",
      desc: "Instant attendance checks, 3-month history logs, streak tracking, and teacher escalation.",
      sampleQueries: [
        "What is my overall attendance percentage?",
        "Check my recent attendance records",
        "I want to request a callback from Priya Ma'am",
      ],
      capabilities: [
        "View personal attendance percentage & working days (94.5%)",
        "Natural multi-lingual voice queries (11 languages)",
        "Request teacher / management callbacks",
      ],
    },
    {
      id: "p7",
      name: "Meera Sharma",
      role: "parent",
      username: "MeeraS",
      class: "Parent of Aditya (2A)",
      icon: Users,
      headline: "Parent Monitoring & Faculty Hub",
      desc: "Child attendance monitoring, threshold warnings, and official callback ticket generation.",
      sampleQueries: [
        "How is Aditya's attendance this term?",
        "Why was Aditya marked absent on Friday?",
        "Connect me with Aditya's class teacher Ananya Sharma",
      ],
      capabilities: [
        "Secure linked-child attendance lookup",
        "Zero-trust RBAC barrier preventing unauthorized child snooping",
        "1-Click human faculty escalation tickets",
      ],
    },
    {
      id: "t1",
      name: "Priya Nair",
      role: "teacher",
      username: "PriyaN",
      class: "Class 1A Lead Faculty",
      icon: BookOpen,
      headline: "Teacher Classroom Operations Desk",
      desc: "Voice & text attendance marking, classroom rosters, and parent callback resolution.",
      sampleQueries: [
        "Mark Aarav present today",
        "Mark Diya absent today",
        "Show attendance summary for Class 1A",
      ],
      capabilities: [
        "Voice-driven or 1-click attendance marking",
        "Access restricted to assigned classrooms (Class 1A)",
        "Resolution desk for parent tickets",
      ],
    },
    {
      id: "m1",
      name: "Dr. Rajesh Menon",
      role: "principal",
      username: "Rajesh",
      class: "Institutional Leadership",
      icon: Building2,
      headline: "Executive Principal Command Center",
      desc: "School-wide attendance matrix across Classes 1-5, section comparisons, and AI telemetry.",
      sampleQueries: [
        "What is the overall school attendance percentage?",
        "Which classes have attendance below 85%?",
        "Show all pending escalation tickets across the school",
      ],
      capabilities: [
        "School-wide aggregated metrics across 10 classrooms",
        "Class-by-class comparison and compliance matrix",
        "Full institutional oversight and RBAC telemetry",
      ],
    },
  ];

  const handleLaunchSession = async (uname) => {
    setLoadingPersona(uname);
    try {
      await login(uname, "demo");
      if (onNavigateBack) onNavigateBack();
    } catch (e) {
      alert("Failed to launch session: " + e.message);
    } finally {
      setLoadingPersona(null);
    }
  };

  const active = personas.find((p) => p.id === selectedPersona) || personas[0];
  const Icon = active.icon;

  return (
    <div className="min-h-screen bg-body text-text-primary flex flex-col justify-between p-4 sm:p-8 max-w-7xl mx-auto w-full font-sans">
      {/* Top Bar */}
      <header className="flex items-center justify-between pb-4 border-b border-border">
        <button
          onClick={onNavigateBack}
          className="btn-secondary text-xs flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Main App</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-xs shadow-pink">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-text-primary">Interactive Demo Hub</span>
        </div>
      </header>

      {/* Main Showcase */}
      <main className="py-8 space-y-8 animate-fade-in">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-pink-100 border border-pink-200 text-accent-dark text-xs font-semibold">
            4 Role Personas • Classes 1–5 • Real MongoDB Data
          </span>
          <h1 className="text-3xl font-bold text-text-primary">
            Experience Role-Based AI Copilots
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Select any persona to launch an instant live session with dedicated server-side RBAC boundaries and contextual memory.
          </p>
        </div>

        {/* 4 Persona Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {personas.map((p) => {
            const PIcon = p.icon;
            const isSelected = selectedPersona === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPersona(p.id)}
                className={`card p-4 cursor-pointer transition-all duration-150 relative ${
                  isSelected
                    ? "border-accent shadow-card-hover ring-2 ring-pink-300"
                    : "border-pink-100 hover:border-pink-300"
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-pink-100 border border-pink-200 flex items-center justify-center text-accent mb-3 shadow-pink">
                  <PIcon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-text-primary">{p.name}</h3>
                <p className="text-[11px] text-text-tertiary capitalize">{p.role} • {p.class}</p>
                <p className="text-xs text-text-secondary mt-2 line-clamp-2 leading-relaxed">{p.desc}</p>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLaunchSession(p.username);
                  }}
                  disabled={loadingPersona === p.username}
                  className="btn-primary w-full mt-4 text-xs"
                >
                  {loadingPersona === p.username ? "Connecting..." : `Launch as ${p.name.split(" ")[0]}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Active Selected Persona Deep Dive */}
        <div className="card p-6 space-y-4 border-pink-100 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-pink-100 border border-pink-200 flex items-center justify-center text-accent shadow-pink">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">{active.headline}</h2>
                <p className="text-xs text-text-tertiary">Username: @{active.username} • Role: {active.role.toUpperCase()}</p>
              </div>
            </div>
            <button
              onClick={() => handleLaunchSession(active.username)}
              disabled={loadingPersona === active.username}
              className="btn-primary flex items-center gap-1.5 self-start sm:self-center"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>Launch Live Session ({active.name})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Capabilities */}
            <div className="bg-pink-50/50 border border-pink-200/60 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-accent-dark uppercase tracking-wider">
                RBAC & System Capabilities
              </h4>
              <ul className="space-y-1.5 text-xs text-text-secondary">
                {active.capabilities.map((cap, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sample Queries */}
            <div className="bg-pink-50/50 border border-pink-200/60 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-accent-dark uppercase tracking-wider">
                Sample Voice & Text Prompts
              </h4>
              <div className="space-y-1.5">
                {active.sampleQueries.map((q, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-white border border-pink-100 text-xs text-text-primary font-medium"
                  >
                    "{q}"
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-text-tertiary">
        XYZ AI • Classes 1–5 MongoDB Connected • Production Grade
      </footer>
    </div>
  );
}
