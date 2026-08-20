import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";
import { PhoneCall, Plus, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";

export function EscalationsView({ user }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [targetRole, setTargetRole] = useState("teacher");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
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

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await api.createEscalation({
        targetRole, reason, priority,
        studentId: user.role === "student" ? (user.userId || user.id) : user.studentIds?.[0],
      });
      setReason("");
      setShowModal(false);
      await loadTickets();
    } catch {
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
    } catch {
      alert("Failed to update ticket status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === "all") return true;
    if (filter === "pending") return t.status === "pending" || t.status === "in_review";
    if (filter === "resolved") return t.status === "resolved";
    return true;
  });

  const statusBadge = (status) => {
    switch (status) {
      case "resolved": return "badge-green";
      case "in_review": return "badge-blue";
      default: return "badge-yellow";
    }
  };

  const priorityBadge = (p) => {
    switch (p) {
      case "high": case "urgent": return "badge-red";
      case "medium": return "badge-yellow";
      default: return "badge-gray";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 sm:p-8 max-w-5xl mx-auto w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <PhoneCall className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-text-primary">Escalation Hub</h2>
          </div>
          <p className="text-sm text-text-tertiary mt-0.5">
            Teacher callbacks and support tickets
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary self-start sm:self-center">
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {["all", "pending", "resolved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
              filter === f
                ? "bg-white text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {f}
            <span className="ml-1 text-xs text-text-tertiary">
              ({tickets.filter((t) =>
                f === "all" ? true : f === "pending" ? t.status !== "resolved" : t.status === "resolved"
              ).length})
            </span>
          </button>
        ))}
      </div>

      {/* Tickets */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-sm text-text-secondary">
          Loading tickets...
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="card p-10 text-center text-sm text-text-tertiary">
          No tickets match this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((t) => (
            <div key={t.ticketId} className="card-hover p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-text-primary">#{t.ticketId}</span>
                  <span className="text-text-tertiary">·</span>
                  <span className="text-sm font-medium text-text-primary">{t.requesterName || "Requester"}</span>
                  <span className="text-xs text-text-tertiary capitalize">({t.role})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${priorityBadge(t.priority)} capitalize`}>{t.priority}</span>
                  <span className={`badge ${statusBadge(t.status)} capitalize`}>{t.status.replace("_", " ")}</span>
                </div>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed">{t.reason}</p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-3 border-t border-border text-xs text-text-tertiary">
                <div className="flex items-center gap-3">
                  <span>Target: <strong className="text-text-primary capitalize">{t.targetRole}</strong></span>
                  {t.studentName && <span>Student: <strong className="text-text-primary">{t.studentName}</strong></span>}
                </div>

                {(user.role === "teacher" || user.role === "principal" || user.role === "admin") && t.status !== "resolved" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(t.ticketId, "in_review")}
                      disabled={updatingId === t.ticketId}
                      className="btn-secondary text-xs h-7 px-3"
                    >
                      In Review
                    </button>
                    <button
                      onClick={() => handleStatusChange(t.ticketId, "resolved")}
                      disabled={updatingId === t.ticketId}
                      className="btn-primary text-xs h-7 px-3"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-border rounded-2xl p-6 max-w-md w-full shadow-modal animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-base text-text-primary">New Support Ticket</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1.5">Department</label>
                <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="select">
                  <option value="teacher">Class Teacher / Faculty</option>
                  <option value="management">Principal & Management</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1.5">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="select">
                  <option value="low">Low — General Inquiry</option>
                  <option value="medium">Medium — Standard Matter</option>
                  <option value="high">High — Medical / Threshold</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1.5">Description</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain your request..."
                  rows={3}
                  className="input resize-none"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
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
