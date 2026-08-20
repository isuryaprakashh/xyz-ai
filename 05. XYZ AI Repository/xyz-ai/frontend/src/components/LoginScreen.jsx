import { useState } from "react";
import { Sparkles, LogIn, UserPlus, GraduationCap, BookOpen, Users, Crown, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PERSONAS = [
  {
    u: "jeevan",
    label: "Jeevan",
    role: "Student",
    desc: "View attendance & academic progress",
    icon: GraduationCap,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    u: "surya",
    label: "Surya Prakash",
    role: "Teacher",
    desc: "Mark attendance & manage classes",
    icon: BookOpen,
    color: "bg-emerald-500",
    lightColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    u: "yashwanth",
    label: "Yashwanth",
    role: "Parent",
    desc: "Track child's attendance & callbacks",
    icon: Users,
    color: "bg-amber-500",
    lightColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    u: "akhil",
    label: "Akhil",
    role: "Principal",
    desc: "School-wide analytics & audit logs",
    icon: Crown,
    color: "bg-purple-500",
    lightColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

export function LoginScreen({ onLogin, onNavigateDemo }) {
  const { register } = useAuth();
  const [authMode, setAuthMode] = useState("signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("student");
  const [regClassId, setRegClassId] = useState("c1");
  const [regStudentId, setRegStudentId] = useState("jeevan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError("");
    try {
      await onLogin(username.trim(), password);
    } catch (err) {
      setError(err.message || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regUsername.trim() || !regPassword) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register({
        name: regName.trim(),
        username: regUsername.trim(),
        email: regEmail.trim() || `${regUsername.toLowerCase()}@school.edu`,
        password: regPassword,
        role: regRole,
        classId: regRole === "student" ? regClassId : null,
        studentIds: regRole === "parent" ? [regStudentId] : [],
        classIds: regRole === "teacher" ? ["c1", "c2"] : [],
      });
      setSuccessMsg("Account registered! Signing you in...");
    } catch (err) {
      setError(err.message || "Registration failed. Username may already be taken.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoQuickLogin = (uname) => {
    setUsername(uname);
    setPassword(uname);
    onLogin(uname, uname);
  };

  return (
    <div className="min-h-screen bg-body flex flex-col">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-border bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[15px] text-text-primary">XYZ AI</span>
        </div>
        <button onClick={onNavigateDemo} className="btn-secondary text-sm">
          <span>Interactive Demo</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[1040px] grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Hero + Persona Cards */}
          <div className="space-y-6 animate-fade-in">
            <div>
              <div className="badge-green mb-3 inline-flex">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI School Assistant</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight text-balance">
                Your intelligent school companion, built for everyone.
              </h1>
              <p className="text-text-secondary text-[15px] mt-3 max-w-md leading-relaxed">
                Conversational attendance, voice operations, and smart faculty communication — powered by AI.
              </p>
            </div>

            {/* Quick Login Persona Cards */}
            <div>
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                Quick sign-in
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PERSONAS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.u}
                      onClick={() => handleDemoQuickLogin(p.u)}
                      className="card-interactive p-4 text-left group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-10 h-10 rounded-xl ${p.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-text-primary">{p.label}</p>
                          <p className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${p.lightColor} inline-block`}>
                            {p.role}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-text-tertiary">{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Auth Card */}
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="card p-6 sm:p-8 max-w-md mx-auto">
              {/* Mode Switcher */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => { setAuthMode("signin"); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    authMode === "signin"
                      ? "bg-white text-text-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => { setAuthMode("signup"); setError(""); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    authMode === "signup"
                      ? "bg-white text-text-primary shadow-sm"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-danger-light border border-red-200 text-danger text-sm mb-4">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-lg bg-accent-light border border-emerald-200 text-accent-dark text-sm mb-4">
                  {successMsg}
                </div>
              )}

              {authMode === "signin" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-text-primary block mb-1.5">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. jeevan, surya, akhil"
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-primary block mb-1.5">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input"
                      required
                    />
                    <p className="text-xs text-text-tertiary mt-1.5">
                      Hint: password is the same as your username
                    </p>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-text-primary block mb-1">Full Name</label>
                    <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="e.g. Surya Prakash" className="input" required />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-text-primary block mb-1">Username</label>
                      <input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} placeholder="surya" className="input" required />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-primary block mb-1">Role</label>
                      <select value={regRole} onChange={(e) => setRegRole(e.target.value)} className="select">
                        <option value="student">Student</option>
                        <option value="parent">Parent</option>
                        <option value="teacher">Teacher</option>
                        <option value="principal">Principal</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-primary block mb-1">Password</label>
                    <input type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="••••••••" className="input" required />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                    {loading ? "Creating account..." : "Create Account"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-text-tertiary border-t border-border bg-white">
        XYZ AI — School ERP Assistant • MongoDB Atlas • Gemini NLU
      </footer>
    </div>
  );
}
