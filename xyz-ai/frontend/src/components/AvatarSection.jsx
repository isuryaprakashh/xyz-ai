import { Avatar } from "./Avatar";
import { ShieldCheck, Database, Cpu } from "lucide-react";

export function AvatarSection({ avatarState, isSpeaking, user }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case "student":
        return "badge-secondary";
      case "parent":
        return "badge-primary";
      case "teacher":
        return "badge-purple";
      case "principal":
        return "badge-warning";
      default:
        return "badge-secondary";
    }
  };

  return (
    <aside className="w-80 flex-shrink-0 p-6 border-l border-[#E9F2FE] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#0D1117] flex flex-col justify-between hidden lg:flex shadow-loom-small">
      <div>
        {/* Assistant Header */}
        <div className="text-center mb-6">
          <h3 className="font-display text-xl font-bold text-[#292A2E] dark:text-[#F0F6FC]">XYZ Assistant</h3>
          <p className="text-xs text-[#6C6F77] dark:text-[#8B949E] mt-0.5">School AI Copilot</p>
        </div>

        {/* Dynamic Avatar */}
        <div className="py-3 flex justify-center">
          <Avatar state={avatarState} isSpeaking={isSpeaking} />
        </div>

        {/* Current Active Persona Card (44px border radius) */}
        <div className="mt-8 p-6 rounded-[44px] bg-[#E9F2FE] dark:bg-[#131F32] border border-[#8FB8F6]/60 dark:border-[#388BFD]/30 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#FFFFFF] dark:bg-[#161D27] border border-[#8FB8F6] dark:border-white/10 flex items-center justify-center text-lg shadow-loom-small">
              {user?.role === "student" ? "🎓" : user?.role === "parent" ? "👨‍👩‍👧" : user?.role === "teacher" ? "👩‍🏫" : "🏢"}
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#292A2E] dark:text-[#F0F6FC]">{user?.name}</h4>
              <span className={`${getRoleBadge(user?.role)} mt-0.5 capitalize`}>
                {user?.role || "Student"}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-[#6C6F77] dark:text-[#8B949E] pt-3 border-t border-[#8FB8F6]/40 dark:border-white/10">
            {user?.classId && (
              <div className="flex justify-between">
                <span>Classroom:</span>
                <strong className="text-[#292A2E] dark:text-[#F0F6FC]">{user.classId.toUpperCase()}</strong>
              </div>
            )}
            {user?.studentIds?.length > 0 && (
              <div className="flex justify-between">
                <span>Linked Student:</span>
                <strong className="text-[#292A2E] dark:text-[#F0F6FC]">{user.studentIds.join(", ")}</strong>
              </div>
            )}
            {user?.classIds?.length > 0 && (
              <div className="flex justify-between">
                <span>Assigned Classes:</span>
                <strong className="text-[#292A2E] dark:text-[#F0F6FC]">{user.classIds.join(", ")}</strong>
              </div>
            )}
          </div>
        </div>

        {/* RBAC Security Shield Card */}
        <div className="mt-4 p-4 rounded-[20px] bg-[#F8EEFE] dark:bg-[#231433] border border-[#BF63F3]/30 text-xs text-[#48245D] dark:text-[#E2B7FF] space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-[#48245D] dark:text-[#E2B7FF]">
            <ShieldCheck className="w-4 h-4 text-[#BF63F3]" />
            <span>RBAC Guard Active</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#6C6F77] dark:text-[#8B949E]">
            All inquiries and actions are authorized server-side based on your authenticated role.
          </p>
        </div>
      </div>

      {/* Cloud Engine Telemetry */}
      <div className="pt-4 border-t border-[#E9F2FE] dark:border-white/10 space-y-2 text-xs text-[#6C6F77] dark:text-[#8B949E]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#1868DB] dark:text-[#58A6FF]" />
            <span>NLU Engine</span>
          </span>
          <span className="font-semibold text-[#1868DB] dark:text-[#58A6FF]">Gemini 2.0 / 3.6</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Database</span>
          </span>
          <span className="font-semibold text-emerald-700 dark:text-emerald-400">MongoDB Atlas</span>
        </div>
      </div>
    </aside>
  );
}
