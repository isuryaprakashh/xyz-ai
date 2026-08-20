import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";
import { PhoneCall, Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export function EscalationsView({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [targetRole, setTargetRole] = useState("teacher");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'resolved'
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getEscalations();
      setTickets(res.tickets || []);
    } catch (e) {
      console.warn("Failed to load escalations:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await api.createEscalation({
        targetRole,
        reason,
        priority,
        studentId: user.role === "student" ? (user.userId || user.id) : user.studentIds?.[0],
      });
      setReason("");
      setShowModal(false);
      await loadTickets();
    } catch (err) {
      alert("Failed to submit escalation request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      setUpdatingId(ticketId);
      await api.updateEscalationStatus(ticketId, newStatus);
      await loadTickets();
    } catch (err) {
      alert("Failed to update ticket status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "all") return true;
    if (filter === "pending") return t.status === "pending" || t.status === "in-progress";
    if (filter === "resolved") return t.status === "resolved";
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-[#FFFFFF] flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-[#3FCF8E]" />
            <span>Human-In-The-Loop Escalation Hub</span>
          </h2>
          <p className="text-xs text-[#808080] mt-0.5">
            Official teacher callback bookings and school management support tickets.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-1.5 self-start sm:self-center"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2E2E2E] pb-2">
        {["all", "pending", "resolved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-[4px] text-xs font-medium capitalize transition-all ${
              filter === f
                ? "bg-[#3FCF8E]/15 text-[#3FCF8E] font-semibold border border-[#3FCF8E]/30"
                : "text-[#808080] hover:text-[#EDEDED]"
            }`}
          >
            {f} ({tickets.filter((t) => (f === "all" ? true : f === "pending" ? t.status !== "resolved" : t.status === "resolved")).length})
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-xs text-[#808080] font-mono">
          Loading ticket queue...
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-[8px] p-8 text-center text-xs text-[#808080]">
          No escalation tickets matching this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((t) => (
            <div
              key={t.ticketId}
              className="bg-[#1C1C1C] border border-[#2E2E2E] hover:border-[#3FCF8E]/40 rounded-[8px] p-4 transition-all duration-150"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-[#FFFFFF]">#{t.ticketId}</span>
                  <span className="text-xs text-[#808080]">•</span>
                  <span className="text-xs font-semibold text-[#EDEDED]">{t.requesterName || "Requester"}</span>
                  <span className="text-[10px] font-mono text-[#808080]">({t.role})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-semibold uppercase ${
                      t.priority === "high"
                        ? "bg-[#DC7B18]/20 text-[#F3BA63] border border-[#DC7B18]/40"
                        : "bg-white/5 text-[#808080]"
                    }`}
                  >
                    {t.priority}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-semibold uppercase ${
                      t.status === "resolved"
                        ? "bg-[#3FCF8E]/20 text-[#3FCF8E] border border-[#3FCF8E]/40"
                        : t.status === "in-progress"
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                        : "bg-[#DC7B18]/20 text-[#F3BA63] border border-[#DC7B18]/40"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#EDEDED] mt-1.5 leading-relaxed">{t.reason}</p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-3 border-t border-[#2E2E2E] text-[11px] font-mono text-[#808080]">
                <div className="flex items-center gap-3">
                  <span>Target: <strong className="text-[#EDEDED] capitalize">{t.targetRole}</strong></span>
                  {t.studentName && <span>Student: <strong className="text-[#EDEDED]">{t.studentName}</strong></span>}
                </div>

                {/* Status action for Teachers & Principals */}
                {(user.role === "teacher" || user.role === "principal" || user.role === "admin") && t.status !== "resolved" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(t.ticketId, "in-progress")}
                      disabled={updatingId === t.ticketId}
                      className="px-2 py-1 bg-[#121212] border border-[#2E2E2E] hover:border-[#3FCF8E]/50 rounded-[4px] text-[11px] text-[#EDEDED]"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange(t.ticketId, "resolved")}
                      disabled={updatingId === t.ticketId}
                      className="px-2 py-1 bg-[#3FCF8E] text-[#000000] font-semibold rounded-[4px] text-[11px] hover:bg-[#16B674]"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating New Ticket */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-[8px] p-5 max-w-md w-full shadow-supabase space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#2E2E2E]">
              <h3 className="font-display font-bold text-sm text-[#FFFFFF]">Create Faculty Support Ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-[#808080] hover:text-[#FFFFFF] text-sm">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-[#808080] block mb-1">Target Department:</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="input-supabase w-full"
                >
                  <option value="teacher">Class Teacher / Subject Faculty</option>
                  <option value="management">School Principal & Management</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#808080] block mb-1">Priority Level:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input-supabase w-full"
                >
                  <option value="low">Low (General Inquiry)</option>
                  <option value="medium">Medium (Standard Academic Matter)</option>
                  <option value="high">High (Medical Absence / Threshold Regularisation)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#808080] block mb-1">Reason / Description:</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain reason for callback or inquiry..."
                  rows={3}
                  className="input-supabase w-full resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2E2E2E]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded-[4px] text-xs text-[#808080] hover:text-[#FFFFFF] bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
