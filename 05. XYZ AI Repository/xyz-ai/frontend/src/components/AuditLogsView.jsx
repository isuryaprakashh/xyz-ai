import { useState, useEffect } from "react";
import { api } from "../utils/api";
import { ShieldCheck, RefreshCw, CheckCircle, XCircle, Search } from "lucide-react";

export function AuditLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = searchTerm
    ? logs.filter(
        (l) =>
          l.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.role?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : logs;

  return (
    <div className="flex-1 overflow-y-auto p-5 sm:p-8 max-w-6xl mx-auto w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <div>
            <h2 className="text-lg font-bold text-text-primary">Audit Trail</h2>
            <p className="text-sm text-text-tertiary">Security and RBAC verification records</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search logs..."
              className="input pl-9 w-48"
            />
          </div>
          <button onClick={fetchLogs} className="btn-secondary">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-body/50">
                <th className="table-cell table-header">Timestamp</th>
                <th className="table-cell table-header">Actor</th>
                <th className="table-cell table-header">Action</th>
                <th className="table-cell table-header">Target</th>
                <th className="table-cell table-header">Result</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-sm text-text-tertiary">
                    {searchTerm
                      ? "No logs match your search."
                      : "No audit entries yet. Interact with the AI to generate records."}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, i) => (
                  <tr key={i} className="table-row border-b border-border/50 last:border-0">
                    <td className="table-cell text-text-tertiary text-xs">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="table-cell">
                      <span className="font-medium text-text-primary">{log.userId}</span>
                      <span className="badge-gray ml-2 text-[10px] uppercase">{log.role}</span>
                    </td>
                    <td className="table-cell text-text-secondary">{log.action}</td>
                    <td className="table-cell text-text-tertiary">{log.target || "—"}</td>
                    <td className="table-cell">
                      {log.success ? (
                        <span className="badge-green">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Authorized
                        </span>
                      ) : (
                        <span className="badge-red">
                          <XCircle className="w-3.5 h-3.5" />
                          Forbidden
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
