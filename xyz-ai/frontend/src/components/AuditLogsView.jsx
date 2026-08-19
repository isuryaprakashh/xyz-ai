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
    <div className="flex-1 overflow-y-auto p-6 sm:p-9 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-[#292A2E] dark:text-[#F0F6FC] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#1868DB] dark:text-[#58A6FF]" />
            <span>Security & RBAC Audit Trail</span>
          </h2>
          <p className="text-sm text-[#6C6F77] dark:text-[#8B949E] mt-1">
            Immutable system logs recording actor role, tool action, authorization verification, and target entity.
          </p>
        </div>
        <button onClick={fetchLogs} className="btn-secondary text-xs">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="card-standard p-0 overflow-hidden border border-[#E9F2FE] dark:border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#E9F2FE] dark:bg-[#101C2E] text-[#292A2E] dark:text-[#F0F6FC] border-b border-[#8FB8F6]/30 dark:border-white/10">
              <tr>
                <th className="p-4 font-bold">Timestamp</th>
                <th className="p-4 font-bold">Actor (Role)</th>
                <th className="p-4 font-bold">Tool Action</th>
                <th className="p-4 font-bold">Target</th>
                <th className="p-4 font-bold">RBAC Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9F2FE] dark:divide-white/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#7D818A] dark:text-[#8B949E]">
                    No tool audit entries recorded yet. Interact with the chat or dashboard to trigger actions.
                  </td>
                </tr>
              ) : (
                logs.map((l, i) => (
                  <tr key={i} className="hover:bg-[#E9F2FE]/40 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-[#6C6F77] dark:text-[#8B949E]">
                      {new Date(l.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-4">
                      <strong className="text-[#292A2E] dark:text-[#F0F6FC]">{l.userId}</strong>{" "}
                      <span className="text-[#6C6F77] dark:text-[#8B949E] capitalize">({l.role})</span>
                    </td>
                    <td className="p-4 font-mono text-[#1868DB] dark:text-[#58A6FF] font-semibold">{l.action}</td>
                    <td className="p-4 text-[#292A2E] dark:text-[#F0F6FC]">{l.target || "—"}</td>
                    <td className="p-4">
                      {l.success ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#FF613D] font-bold">
                          <XCircle className="w-3.5 h-3.5" /> Denied (403)
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
