import { useState } from "react";
import { Sparkles, ShieldCheck, UserPlus, LogIn, CheckCircle2, Sun, Moon, ArrowRight, Play, Cpu, Lock, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function LoginScreen({ onLogin, onNavigateDemo, theme = "light", onToggleTheme }) {
  const { register } = useAuth();
  const [authMode, setAuthMode] = useState("signin"); // 'signin' | 'signup'
  
  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("demo");
  
  // Register state
  const [regName, setRegName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("student");
  const [regClassId, setRegClassId] = useState("c1");
  const [regStudentId, setRegStudentId] = useState("s1");
  
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

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#0A0D12] text-[#292A2E] dark:text-[#F0F6FC] flex flex-col justify-between p-6 sm:p-9 max-w-7xl mx-auto w-full transition-colors">
      {/* Header */}
      <header className="flex items-center justify-between pb-6 border-b border-[#E9F2FE] dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1868DB] flex items-center justify-center text-white shadow-loom-medium">
            <span className="font-display text-xl font-bold">X</span>
          </div>
          <span className="font-display font-bold text-2xl text-[#292A2E] dark:text-[#F0F6FC]">XYZ AI</span>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Live Demo Button in Header */}
          <button
            onClick={onNavigateDemo}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-md bg-[#1868DB] hover:bg-[#1455B3]"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Interactive Demo</span>
          </button>

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-10 h-10 rounded-full border border-[#E9F2FE] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#161D27] text-[#292A2E] dark:text-[#F0F6FC] flex items-center justify-center shadow-sm hover:border-[#8FB8F6] transition-all"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-[#FFA900]" /> : <Moon className="w-4 h-4 text-[#1868DB]" />}
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Hero & Enterprise SaaS Value Proposition */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E9F2FE] dark:bg-[#162744] border border-[#8FB8F6] dark:border-[#388BFD]/40 text-[#1868DB] dark:text-[#58A6FF] text-xs font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-[#1868DB] dark:text-[#58A6FF]" />
            <span>AI School Assistant • Multilingual • Zero-Trust RBAC</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-[#292A2E] dark:text-[#F0F6FC] leading-tight">
            Next-generation AI for the modern school ecosystem.
          </h1>

          <p className="text-base sm:text-lg text-[#6C6F77] dark:text-[#8B949E] leading-relaxed max-w-xl">
            Conversational attendance lookup, automated faculty rosters, parent communication hubs, and executive analytics powered by Google Gemini NLU and MongoDB Atlas.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-xl">
            <div className="p-4 rounded-[20px] bg-[#E9F2FE]/50 dark:bg-[#121E31] border border-[#8FB8F6]/30 dark:border-[#388BFD]/20 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-[#1868DB] dark:text-[#58A6FF]">
                <Cpu className="w-4 h-4" />
                <span>Multilingual Voice AI</span>
              </div>
              <p className="text-xs text-[#6C6F77] dark:text-[#8B949E]">
                Native voice interactions across 11 Indian and global languages.
              </p>
            </div>

            <div className="p-4 rounded-[20px] bg-[#F8EEFE]/60 dark:bg-[#20142B] border border-[#BF63F3]/20 dark:border-[#BF63F3]/20 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-[#48245D] dark:text-[#E2B7FF]">
                <Lock className="w-4 h-4 text-[#BF63F3]" />
                <span>Zero-Trust RBAC</span>
              </div>
              <p className="text-xs text-[#6C6F77] dark:text-[#8B949E]">
                Strict server-side authorization boundaries for students, parents, teachers, and principals.
              </p>
            </div>
          </div>

          {/* Demo Callout Banner */}
          <div className="p-5 rounded-[24px] bg-[#CFE1FD]/40 dark:bg-[#162744] border border-[#8FB8F6] dark:border-[#388BFD]/40 flex items-center justify-between gap-4 max-w-xl">
            <div>
              <p className="text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC]">
                Want to test XYZ AI without creating an account?
              </p>
              <p className="text-xs text-[#6C6F77] dark:text-[#8B949E]">
                Explore live preloaded personas in our interactive demo sandbox.
              </p>
            </div>
            <button
              onClick={onNavigateDemo}
              className="btn-primary text-xs shrink-0 py-2 px-4 flex items-center gap-1"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Authentication Card (44px card container) */}
        <div className="lg:col-span-5">
          <div className="card-standard border border-[#E9F2FE] dark:border-white/10 p-8 sm:p-9 shadow-loom-large">
            {/* Tabs */}
            <div className="flex bg-[#E9F2FE] dark:bg-[#0D1117] p-1 rounded-full mb-6">
              <button
                type="button"
                onClick={() => { setAuthMode("signin"); setError(""); }}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  authMode === "signin"
                    ? "bg-[#1868DB] text-white shadow-loom-small"
                    : "text-[#292A2E] dark:text-[#8B949E] hover:text-[#1868DB] dark:hover:text-white"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("signup"); setError(""); }}
                className={`flex-1 py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  authMode === "signup"
                    ? "bg-[#1868DB] text-white shadow-loom-small"
                    : "text-[#292A2E] dark:text-[#8B949E] hover:text-[#1868DB] dark:hover:text-white"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>

            {error && (
              <div className="p-3.5 mb-4 rounded-[14px] bg-[#F8EEFE] dark:bg-[#2B153D] border border-[#FF613D]/40 text-[#FF613D] text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 mb-4 rounded-[14px] bg-[#E9F2FE] dark:bg-[#162744] border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Sign In Form */}
            {authMode === "signin" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC] mb-1.5">Username or Email</label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full input-loom text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC] mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full input-loom text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !username.trim()}
                  className="btn-primary w-full text-sm mt-2 py-3"
                >
                  {loading ? "Authenticating..." : "Sign In to School Workspace"}
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {authMode === "signup" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC] mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Maya Patel"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    className="w-full input-loom text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC] mb-1">Username</label>
                    <input
                      type="text"
                      placeholder="mayap"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      required
                      className="w-full input-loom text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC] mb-1">Role</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full input-loom text-xs"
                    >
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                      <option value="teacher">Teacher</option>
                      <option value="principal">Principal</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC] mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="maya@school.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full input-loom text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC] mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="Create secure password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    className="w-full input-loom text-xs"
                  />
                </div>

                {regRole === "student" && (
                  <div>
                    <label className="block text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC] mb-1">Classroom</label>
                    <select
                      value={regClassId}
                      onChange={(e) => setRegClassId(e.target.value)}
                      className="w-full input-loom text-xs"
                    >
                      <option value="c1">Class 8A</option>
                      <option value="c2">Class 9B</option>
                    </select>
                  </div>
                )}

                {regRole === "parent" && (
                  <div>
                    <label className="block text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC] mb-1">Linked Child</label>
                    <select
                      value={regStudentId}
                      onChange={(e) => setRegStudentId(e.target.value)}
                      className="w-full input-loom text-xs"
                    >
                      <option value="s1">Rahul Sharma (Class 8A)</option>
                      <option value="s2">Priya Patel (Class 8A)</option>
                      <option value="s3">Aarav Singh (Class 9B)</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !regName.trim() || !regUsername.trim()}
                  className="btn-primary w-full text-xs mt-2 py-3"
                >
                  {loading ? "Registering..." : "Create Account in MongoDB"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#7D818A] dark:text-[#8B949E] pt-6 border-t border-[#E9F2FE] dark:border-white/10 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#1868DB] dark:text-[#58A6FF]" />
        <span>Enterprise Grade • Google Gemini NLU & MongoDB Atlas • SOC2 & RBAC Compliant</span>
      </footer>
    </div>
  );
}
