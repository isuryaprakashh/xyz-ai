import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { ShieldCheck, RefreshCw, CheckCircle, XCircle } from "lucide-react";

export function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs();
      setLogs((res.logs || []).reverse());
    } catch (e) {
      console.warn("Failed to fetch audit logs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-[#FFFFFF] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#3FCF8E]" />
            <span>Security & Zero-Trust RBAC Audit Trail</span>
          </h2>
          <p className="text-xs text-[#808080] mt-0.5">
            Immutable system records logging actor, tool action, authorization verification, and target entity.
          </p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#121212] text-[#808080] font-mono uppercase border-b border-[#2E2E2E]">
              <tr>
                <th className="p-3.5 font-medium">Timestamp</th>
                <th className="p-3.5 font-medium">Actor (Role)</th>
                <th className="p-3.5 font-medium">Tool Action</th>
                <th className="p-3.5 font-medium">Target</th>
                <th className="p-3.5 font-medium">RBAC Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2E2E2E]/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#808080] font-mono">
                    No security audit entries recorded yet. Interact with the chat to trigger verified tool actions.
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-mono text-[#808080]">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="p-3.5 font-medium text-[#FFFFFF]">
                      <span>{log.userId}</span>
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-[3px] text-[10px] font-mono uppercase bg-white/5 text-[#808080]">
                        {log.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[#EDEDED]">{log.action}</td>
                    <td className="p-3.5 font-mono text-[#808080]">{log.target || "---"}</td>
                    <td className="p-3.5">
                      {log.success ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-semibold bg-[#3FCF8E]/10 border border-[#3FCF8E]/30 text-[#3FCF8E]">
                          <CheckCircle className="w-3 h-3" />
                          <span>AUTHORIZED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-semibold bg-[#DC7B18]/10 border border-[#DC7B18]/30 text-[#F3BA63]">
                          <XCircle className="w-3 h-3" />
                          <span>403 FORBIDDEN</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
