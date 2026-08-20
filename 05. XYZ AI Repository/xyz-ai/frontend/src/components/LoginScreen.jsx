import { useState } from "react";
import { Sparkles, ShieldCheck, UserPlus, LogIn, CheckCircle2, Play, Cpu, Lock, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginScreen({ onLogin, onNavigateDemo }) {
  const { register } = useAuth();
  const [authMode, setAuthMode] = useState("signin"); // 'signin' | 'signup'
  
  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  // Register state
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

  const handleDemoQuickLogin = (uname, pwd = uname) => {
    setUsername(uname);
    setPassword(pwd);
    onLogin(uname, pwd);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#EDEDED] flex flex-col justify-between p-4 sm:p-8 max-w-7xl mx-auto w-full font-sans">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b border-[#2E2E2E]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[4px] bg-[#3FCF8E] flex items-center justify-center text-[#000000] font-display font-extrabold text-sm shadow-sm">
            ⚡
          </div>
          <span className="font-display font-bold text-lg text-[#FFFFFF]">XYZ AI</span>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button
            onClick={onNavigateDemo}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 fill-[#000000]" />
            <span>Interactive Demo</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero */}
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#3FCF8E]/10 border border-[#3FCF8E]/30 text-[#3FCF8E] text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>School ERP Copilot • MongoDB Atlas Live • Gemini 2.5 NLU</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#FFFFFF] leading-tight">
            Human-like AI Assistant for the Modern School ERP.
          </h1>

          <p className="text-xs sm:text-sm text-[#808080] leading-relaxed max-w-xl">
            Conversational attendance lookup, automated faculty rosters, parent communication hubs, and executive analytics powered by Google Gemini NLU and MongoDB Atlas.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-xl">
            <div className="p-3.5 rounded-[6px] bg-[#1C1C1C] border border-[#2E2E2E] space-y-1">
              <div className="flex items-center gap-2 font-semibold text-xs text-[#3FCF8E]">
                <Cpu className="w-3.5 h-3.5" />
                <span>Multilingual Voice AI</span>
              </div>
              <p className="text-[11px] text-[#808080]">
                Native voice recognition and speech across 11 Indian and global languages.
              </p>
            </div>

            <div className="p-3.5 rounded-[6px] bg-[#1C1C1C] border border-[#2E2E2E] space-y-1">
              <div className="flex items-center gap-2 font-semibold text-xs text-[#3FCF8E]">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero-Trust Server-Side RBAC</span>
              </div>
              <p className="text-[11px] text-[#808080]">
                Strict role authorization boundaries with Principal-only audit logs.
              </p>
            </div>
          </div>

          {/* Quick Demo Selectors */}
          <div className="pt-2">
            <p className="text-[11px] font-mono text-[#808080] uppercase tracking-wider mb-2">
              1-Click Instant Persona Sign-In:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl">
              {[
                { u: "jeevan", label: "jeevan", role: "Student (Class 1A)" },
                { u: "surya", label: "surya prakash", role: "Faculty / Teacher" },
                { u: "yashwanth", label: "yashwanth", role: "Parent (Jeevan)" },
                { u: "akhil", label: "akhil", role: "Principal (Admin)" },
              ].map((p) => (
                <button
                  key={p.u}
                  onClick={() => handleDemoQuickLogin(p.u)}
                  className="p-3 rounded-[6px] bg-[#1C1C1C] border border-[#2E2E2E] hover:border-[#3FCF8E] text-left transition-all group cursor-pointer"
                >
                  <span className="font-semibold text-xs text-[#FFFFFF] group-hover:text-[#3FCF8E] block truncate font-mono">
                    {p.label}
                  </span>
                  <span className="text-[10px] font-mono text-[#808080] block mt-0.5">
                    {p.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="lg:col-span-5">
          <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-[8px] p-6 shadow-supabase">
            {/* Mode Switcher */}
            <div className="flex border-b border-[#2E2E2E] pb-3 mb-4">
              <button
                onClick={() => setAuthMode("signin")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-[4px] transition-all flex items-center justify-center gap-1.5 ${
                  authMode === "signin"
                    ? "bg-[#3FCF8E]/15 text-[#3FCF8E] border border-[#3FCF8E]/30"
                    : "text-[#808080] hover:text-[#EDEDED]"
                }`}
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-[4px] transition-all flex items-center justify-center gap-1.5 ${
                  authMode === "signup"
                    ? "bg-[#3FCF8E]/15 text-[#3FCF8E] border border-[#3FCF8E]/30"
                    : "text-[#808080] hover:text-[#EDEDED]"
                }`}
              >
                <UserPlus className="w-3 h-3" />
                <span>Register Account</span>
              </button>
            </div>

            {error && (
              <div className="p-2.5 rounded-[4px] bg-[#DC7B18]/10 border border-[#DC7B18]/30 text-[#F3BA63] text-xs mb-3">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 rounded-[4px] bg-[#3FCF8E]/10 border border-[#3FCF8E]/30 text-[#3FCF8E] text-xs mb-3">
                {successMsg}
              </div>
            )}

            {authMode === "signin" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-mono text-[#808080] block mb-1">Username:</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. jeevan, surya, yashwanth, akhil"
                    className="input-supabase w-full"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#808080] block mb-1">Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-supabase w-full"
                    required
                  />
                  <span className="text-[10px] font-mono text-[#808080] mt-1 block">Credentials: username & password are identical</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2"
                >
                  {loading ? "Authenticating..." : "Sign In to ERP Portal"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
                <div>
                  <label className="text-[11px] font-mono text-[#808080] block mb-0.5">Full Name:</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Surya Prakash"
                    className="input-supabase w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-mono text-[#808080] block mb-0.5">Username:</label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="surya"
                      className="input-supabase w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-[#808080] block mb-0.5">Role:</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="input-supabase w-full"
                    >
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                      <option value="teacher">Teacher</option>
                      <option value="principal">Principal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-[#808080] block mb-0.5">Password:</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-supabase w-full"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-2"
                >
                  {loading ? "Registering..." : "Create Account"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2E2E2E] py-3 text-center text-xs font-mono text-[#808080]">
        XYZ AI • Classes 1–5 MongoDB Connected • Production Ready
      </footer>
    </div>
  );
}
