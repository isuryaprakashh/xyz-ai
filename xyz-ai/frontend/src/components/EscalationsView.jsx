import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";
import { PhoneCall, Plus, Clock, CheckCircle2 } from "lucide-react";

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
    if (filter === "pending") return t.status === "pending" || t.status === "in_progress";
    if (filter === "resolved") return t.status === "resolved";
    return true;
  });

  const isStaff = user.role === "teacher" || user.role === "principal" || user.role === "admin";

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-9 max-w-5xl mx-auto w-full space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-[#292A2E] dark:text-[#F0F6FC] flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-[#1868DB] dark:text-[#58A6FF]" />
            <span>Escalation & Callback Desk</span>
          </h2>
          <p className="text-sm text-[#6C6F77] dark:text-[#8B949E] mt-1">
            Human-in-the-loop callback tickets raised for faculty and school leadership.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {(user.role === "student" || user.role === "parent") && (
            <button onClick={() => setShowModal(true)} className="btn-primary self-start sm:self-center">
              <Plus className="w-4 h-4" />
              <span>Raise Callback Ticket</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E9F2FE] dark:border-white/10 pb-3">
        {[
          { id: "all", label: `All Tickets (${tickets.length})` },
          { id: "pending", label: `Active (${tickets.filter((t) => t.status !== "resolved").length})` },
          { id: "resolved", label: `Resolved (${tickets.filter((t) => t.status === "resolved").length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === tab.id
                ? "bg-[#1868DB] text-white shadow-sm"
                : "bg-[#FFFFFF] dark:bg-[#161D27] text-[#6C6F77] dark:text-[#8B949E] hover:text-[#1868DB] dark:hover:text-white hover:bg-[#E9F2FE] dark:hover:bg-[#1E293B]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-[#6C6F77] dark:text-[#8B949E] text-sm">
          <div className="w-5 h-5 border-2 border-[#1868DB] dark:border-[#58A6FF] border-t-transparent rounded-full animate-spin mr-2" />
          <span>Loading active tickets...</span>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="card-standard p-12 text-center text-[#6C6F77] dark:text-[#8B949E]">
          <Clock className="w-10 h-10 mx-auto text-[#7D818A] dark:text-[#8B949E] mb-3" />
          <p className="font-bold text-[#292A2E] dark:text-[#F0F6FC] text-base">No {filter !== "all" ? filter : ""} callback tickets</p>
          <p className="text-xs text-[#7D818A] dark:text-[#8B949E] mt-1">
            When parents or students request teacher or management contact via AI chat or this desk, tickets will be listed here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTickets.map((t) => (
            <div
              key={t.ticketId || t.id}
              className={`card-standard p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all ${
                t.status === "resolved" ? "opacity-75 bg-[#F8FAFC] dark:bg-[#111722]" : ""
              }`}
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#1868DB] dark:text-[#58A6FF]">#{t.ticketId || t.id}</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-[12px] ${
                      t.status === "resolved"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700"
                        : t.status === "in_progress"
                        ? "bg-[#E9F2FE] dark:bg-[#162744] text-[#1868DB] dark:text-[#58A6FF] border border-[#8FB8F6] dark:border-[#388BFD]/40"
                        : "bg-[#FFF4E5] dark:bg-[#2C1C0D] text-[#FFA900] border border-[#FFA900]/40"
                    }`}
                  >
                    {t.status.toUpperCase()}
                  </span>
                  <span className="text-xs text-[#6C6F77] dark:text-[#8B949E]">
                    Target: <strong className="text-[#292A2E] dark:text-[#F0F6FC] capitalize">{t.targetRole}</strong>
                  </span>
                  {t.studentName && (
                    <span className="text-xs text-[#6C6F77] dark:text-[#8B949E]">
                      Student: <strong className="text-[#292A2E] dark:text-[#F0F6FC]">{t.studentName}</strong>
                    </span>
                  )}
                </div>

                <p className="text-base text-[#292A2E] dark:text-[#F0F6FC] font-semibold">{t.reason}</p>
                <p className="text-xs text-[#7D818A] dark:text-[#8B949E]">
                  Raised by {t.requesterName || t.requesterId} ({t.role}) • {new Date(t.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Action Buttons for Staff */}
              <div className="shrink-0 flex items-center gap-2">
                {isStaff ? (
                  <div className="flex gap-2">
                    {t.status !== "resolved" ? (
                      <button
                        onClick={() => handleStatusChange(t.ticketId || t.id, "resolved")}
                        disabled={updatingId === (t.ticketId || t.id)}
                        className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(t.ticketId || t.id, "pending")}
                        disabled={updatingId === (t.ticketId || t.id)}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        <span>Reopen</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="badge-secondary text-xs px-3 py-1.5">
                    {t.status === "resolved" ? "Resolved by Staff" : "Under Faculty Review"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#161D27] border border-[#E9F2FE] dark:border-white/10 rounded-[44px] shadow-loom-large max-w-md w-full p-8 space-y-5 text-[#292A2E] dark:text-[#F0F6FC]">
            <h3 className="text-xl font-display font-bold text-[#292A2E] dark:text-[#F0F6FC]">Raise Callback Ticket</h3>
            <p className="text-xs text-[#6C6F77] dark:text-[#8B949E]">
              Submit an official request for a dedicated callback from a teacher or administrative management.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC] mb-1.5">Target Department</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full input-loom text-xs"
                >
                  <option value="teacher">Class Teacher</option>
                  <option value="management">School Management / Principal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC] mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full input-loom text-xs"
                >
                  <option value="low">Low - General Question</option>
                  <option value="medium">Medium - Standard Inquiry</option>
                  <option value="high">High - Urgent Attendance / Medical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#292A2E] dark:text-[#F0F6FC] mb-1.5">Concern / Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your inquiry or reason for callback..."
                  rows={3}
                  required
                  className="w-full rounded-[14px] p-3 bg-[#FFFFFF] dark:bg-[#0D1117] border border-[#7D818A] dark:border-white/15 text-xs text-[#292A2E] dark:text-[#F0F6FC] focus:outline-none focus:border-[#1868DB] dark:focus:border-[#388BFD] focus:border-2 focus:ring-4 focus:ring-[#1868DB]/10 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !reason.trim()}
                  className="btn-primary text-xs"
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
