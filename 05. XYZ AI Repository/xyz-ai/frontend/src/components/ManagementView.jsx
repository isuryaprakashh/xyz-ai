import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";
import {
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  Shield,
  X,
  RefreshCw,
} from "lucide-react";

export function ManagementView({ user }) {
  const [activeSubTab, setActiveSubTab] = useState("students"); // 'students' | 'faculty' | 'classes'
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  // Modals
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Form states
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formClassId, setFormClassId] = useState("c1");
  const [formClassIds, setFormClassIds] = useState(["c1"]);
  const [formPassword, setFormPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [stuRes, facRes, clsRes] = await Promise.all([
        api.getUsersByRole("student"),
        api.getUsersByRole("teacher"),
        api.getAllClasses(),
      ]);
      setStudents(stuRes.users || []);
      setFaculty(facRes.users || []);
      setClasses(clsRes.classes || []);
    } catch (err) {
      console.warn("Failed to load management data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const resetForm = () => {
    setFormName("");
    setFormUsername("");
    setFormEmail("");
    setFormClassId("c1");
    setFormClassIds(["c1"]);
    setFormPassword("");
  };

  // Add Student
  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formUsername.trim()) return;
    setSubmitting(true);
    try {
      await api.createUser({
        name: formName.trim(),
        username: formUsername.trim().toLowerCase(),
        email: formEmail.trim() || `${formUsername.trim().toLowerCase()}@school.edu`,
        role: "student",
        classId: formClassId,
        password: formPassword || formUsername.trim().toLowerCase(),
      });
      showToast(`Student ${formName} added to ${formClassId.toUpperCase()}!`);
      setShowAddStudent(false);
      resetForm();
      await loadAll();
    } catch (err) {
      alert(err.message || "Failed to create student.");
    } finally {
      setSubmitting(false);
    }
  };

  // Add Faculty
  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formUsername.trim()) return;
    setSubmitting(true);
    try {
      await api.createUser({
        name: formName.trim(),
        username: formUsername.trim().toLowerCase(),
        email: formEmail.trim() || `${formUsername.trim().toLowerCase()}@school.edu`,
        role: "teacher",
        classIds: formClassIds,
        password: formPassword || formUsername.trim().toLowerCase(),
      });
      showToast(`Faculty member ${formName} registered successfully!`);
      setShowAddFaculty(false);
      resetForm();
      await loadAll();
    } catch (err) {
      alert(err.message || "Failed to create faculty.");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit User
  const startEdit = (targetUser) => {
    setEditingUser(targetUser);
    setFormName(targetUser.name || "");
    setFormEmail(targetUser.email || "");
    setFormClassId(targetUser.classId || "c1");
    setFormClassIds(targetUser.classIds || ["c1"]);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const updatePayload = {
        name: formName.trim(),
        email: formEmail.trim(),
      };
      if (editingUser.role === "student") {
        updatePayload.classId = formClassId;
      } else if (editingUser.role === "teacher") {
        updatePayload.classIds = formClassIds;
      }
      await api.updateUser(editingUser.userId || editingUser.id, updatePayload);
      showToast(`Updated profile for ${editingUser.name}!`);
      setEditingUser(null);
      await loadAll();
    } catch (err) {
      alert(err.message || "Failed to update user.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setSubmitting(true);
    try {
      await api.deleteUser(deletingUser.userId || deletingUser.id);
      showToast(`Deleted ${deletingUser.name} from directory.`);
      setDeletingUser(null);
      await loadAll();
    } catch (err) {
      alert(err.message || "Failed to delete user.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "all" || s.classId === classFilter;
    return matchesSearch && matchesClass;
  });

  // Filter faculty
  const filteredFaculty = faculty.filter((f) => {
    return (
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex-1 overflow-y-auto p-5 sm:p-8 max-w-6xl mx-auto w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-text-primary">Institutional Administration Hub</h2>
          </div>
          <p className="text-sm text-text-tertiary mt-0.5">
            Principal & Management CRUD operations for Students, Faculty, and Classrooms.
          </p>
        </div>

        <button onClick={loadAll} className="btn-secondary self-start sm:self-center">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-pink-50 border border-pink-200 text-accent-dark text-sm flex items-center gap-2 animate-slide-up shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("students")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeSubTab === "students"
                ? "bg-accent text-white shadow-pink"
                : "card-hover text-text-secondary hover:text-accent-dark"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Students ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("faculty")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeSubTab === "faculty"
                ? "bg-accent text-white shadow-pink"
                : "card-hover text-text-secondary hover:text-accent-dark"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Faculty ({faculty.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("classes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeSubTab === "classes"
                ? "bg-accent text-white shadow-pink"
                : "card-hover text-text-secondary hover:text-accent-dark"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Classrooms ({classes.length})</span>
          </button>
        </div>

        {/* Action Button based on sub-tab */}
        {activeSubTab === "students" && (
          <button
            onClick={() => {
              resetForm();
              setShowAddStudent(true);
            }}
            className="btn-primary self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        )}

        {activeSubTab === "faculty" && (
          <button
            onClick={() => {
              resetForm();
              setShowAddFaculty(true);
            }}
            className="btn-primary self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Faculty Member</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      {activeSubTab !== "classes" && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeSubTab} by name or username...`}
              className="input pl-9"
            />
          </div>

          {activeSubTab === "students" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">Class:</span>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="select py-2 px-3 text-xs w-36"
              >
                <option value="all">All Classes</option>
                {classes.map((c) => (
                  <option key={c.classId || c.id} value={c.classId || c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* ─── STUDENTS TAB ─── */}
      {activeSubTab === "students" && (
        <div className="card overflow-hidden border-pink-100 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-pink-50/40">
                  <th className="table-cell table-header">Student</th>
                  <th className="table-cell table-header">Username</th>
                  <th className="table-cell table-header">Classroom</th>
                  <th className="table-cell table-header">Email</th>
                  <th className="table-cell table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-sm text-text-tertiary">
                      No students found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.userId || s.id} className="table-row border-b border-border/50 last:border-0">
                      <td className="table-cell">
                        <p className="font-semibold text-sm text-text-primary">{s.name}</p>
                        <p className="text-xs text-text-tertiary">ID: {(s.userId || s.id).toUpperCase()}</p>
                      </td>
                      <td className="table-cell font-mono text-xs text-text-secondary">@{s.username}</td>
                      <td className="table-cell">
                        <span className="badge-pink text-xs font-semibold uppercase">
                          {s.classId || "Class 1A"}
                        </span>
                      </td>
                      <td className="table-cell text-xs text-text-secondary">{s.email || "—"}</td>
                      <td className="table-cell text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => startEdit(s)}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-accent-dark hover:bg-pink-50 transition-colors"
                            title="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingUser(s)}
                            className="p-1.5 rounded-lg text-danger hover:bg-danger-light transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── FACULTY TAB ─── */}
      {activeSubTab === "faculty" && (
        <div className="card overflow-hidden border-pink-100 shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-pink-50/40">
                  <th className="table-cell table-header">Faculty Lead</th>
                  <th className="table-cell table-header">Username</th>
                  <th className="table-cell table-header">Assigned Classrooms</th>
                  <th className="table-cell table-header">Email</th>
                  <th className="table-cell table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-sm text-text-tertiary">
                      No faculty members found.
                    </td>
                  </tr>
                ) : (
                  filteredFaculty.map((f) => (
                    <tr key={f.userId || f.id} className="table-row border-b border-border/50 last:border-0">
                      <td className="table-cell">
                        <p className="font-semibold text-sm text-text-primary">{f.name}</p>
                        <p className="text-xs text-text-tertiary">Faculty ID: {(f.userId || f.id).toUpperCase()}</p>
                      </td>
                      <td className="table-cell font-mono text-xs text-text-secondary">@{f.username}</td>
                      <td className="table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(f.classIds || ["c1"]).map((cid) => (
                            <span key={cid} className="badge-pink text-[11px] font-semibold uppercase">
                              {cid}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="table-cell text-xs text-text-secondary">{f.email || "—"}</td>
                      <td className="table-cell text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => startEdit(f)}
                            className="p-1.5 rounded-lg text-text-secondary hover:text-accent-dark hover:bg-pink-50 transition-colors"
                            title="Edit Faculty"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingUser(f)}
                            className="p-1.5 rounded-lg text-danger hover:bg-danger-light transition-colors"
                            title="Delete Faculty"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── CLASSROOMS TAB ─── */}
      {activeSubTab === "classes" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {classes.map((c) => (
            <div key={c.classId || c.id} className="card p-5 space-y-3 border-pink-100 shadow-card">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base text-text-primary">{c.name}</h4>
                <span className="badge-pink text-xs font-semibold">{c.grade}</span>
              </div>

              <div className="space-y-1.5 text-xs text-text-secondary">
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Faculty Lead:</span>
                  <span className="font-medium text-text-primary">{c.teacherName || "Assigned Faculty"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Enrolled Students:</span>
                  <span className="font-bold text-accent">{(c.studentIds || []).length} Students</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Location:</span>
                  <span className="text-text-secondary">{c.roomNumber || "Room 101"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ MODAL: ADD STUDENT ═══ */}
      {showAddStudent && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-pink-200 rounded-2xl p-6 max-w-md w-full shadow-modal animate-scale-in space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100">
              <h3 className="font-bold text-base text-text-primary">Add New Student</h3>
              <button onClick={() => setShowAddStudent(false)} className="p-1 rounded-lg hover:bg-pink-50 text-text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1">Username</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="alex"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1">Classroom</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="select"
                  >
                    {classes.map((c) => (
                      <option key={c.classId || c.id} value={c.classId || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="alex@school.edu"
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Initial Password</label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Leave blank to match username"
                  className="input"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
                <button type="button" onClick={() => setShowAddStudent(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? "Adding..." : "Add Student to Roster"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: ADD FACULTY ═══ */}
      {showAddFaculty && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-pink-200 rounded-2xl p-6 max-w-md w-full shadow-modal animate-scale-in space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100">
              <h3 className="font-bold text-base text-text-primary">Add Faculty Member</h3>
              <button onClick={() => setShowAddFaculty(false)} className="p-1 rounded-lg hover:bg-pink-50 text-text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFaculty} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Faculty Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Dr. Kavita Raman"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Username</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="kavita"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Assigned Classroom</label>
                <select
                  value={formClassId}
                  onChange={(e) => {
                    setFormClassId(e.target.value);
                    setFormClassIds([e.target.value]);
                  }}
                  className="select"
                >
                  {classes.map((c) => (
                    <option key={c.classId || c.id} value={c.classId || c.id}>
                      {c.name} ({c.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="kavita@school.edu"
                  className="input"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
                <button type="button" onClick={() => setShowAddFaculty(false)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? "Registering..." : "Register Faculty Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: EDIT USER ═══ */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-pink-200 rounded-2xl p-6 max-w-md w-full shadow-modal animate-scale-in space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100">
              <h3 className="font-bold text-base text-text-primary">
                Edit {editingUser.role === "student" ? "Student" : "Faculty"} Profile
              </h3>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded-lg hover:bg-pink-50 text-text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input"
                  required
                />
              </div>

              {editingUser.role === "student" ? (
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1">Reassign Classroom</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    className="select"
                  >
                    {classes.map((c) => (
                      <option key={c.classId || c.id} value={c.classId || c.id}>
                        {c.name} ({c.grade})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-text-primary block mb-1">Primary Classroom</label>
                  <select
                    value={formClassIds[0] || "c1"}
                    onChange={(e) => setFormClassIds([e.target.value])}
                    className="select"
                  >
                    {classes.map((c) => (
                      <option key={c.classId || c.id} value={c.classId || c.id}>
                        {c.name} ({c.grade})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="input"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
                <button type="button" onClick={() => setEditingUser(null)} className="btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ MODAL: DELETE CONFIRMATION ═══ */}
      {deletingUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-pink-200 rounded-2xl p-6 max-w-md w-full shadow-modal animate-scale-in space-y-4">
            <div className="flex items-center gap-3 text-danger">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-bold text-base text-text-primary">Confirm Deletion</h3>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed">
              Are you sure you want to permanently remove <strong>{deletingUser.name}</strong> (@{deletingUser.username}) from the institutional directory? All associated attendance and session records will be deleted.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-pink-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={submitting}
                className="btn-primary bg-danger hover:bg-red-700"
              >
                {submitting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
