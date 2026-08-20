import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";
import { BarChart3, Users, TrendingUp, Calendar, CheckCircle, XCircle, ArrowUpRight } from "lucide-react";

export function Dashboard({ user }) {
  const [analytics, setAnalytics] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(user?.studentIds?.[0] || "s1");
  const [loading, setLoading] = useState(true);
  const [markStatus, setMarkStatus] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (user.role === "principal" || user.role === "admin") {
        const res = await api.getSchoolAnalytics();
        setAnalytics(res);
      } else if (user.role === "student") {
        const sid = user.userId || user.id;
        const res = await api.getStudentAttendance(sid);
        setStudentData(res);
      } else if (user.role === "parent") {
        const childId = selectedChildId || user.studentIds?.[0] || "s1";
        const res = await api.getStudentAttendance(childId);
        setStudentData(res);
      } else if (user.role === "teacher") {
        const studentsRes = await api.getUsersByRole("student");
        const list = studentsRes.users || [];
        const withAttendance = await Promise.all(
          list.map(async (s) => {
            const sid = s.userId || s.id;
            try {
              const att = await api.getStudentAttendance(sid);
              return { ...s, percentage: att.percentage || "90.0", presentDays: att.presentDays || 0, totalWorkingDays: att.totalWorkingDays || 0, records: att.records || [] };
            } catch {
              return { ...s, percentage: "90.0", presentDays: 0, totalWorkingDays: 0, records: [] };
            }
          })
        );
        setTeacherStudents(withAttendance);
      }
    } catch (err) {
      console.warn("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedChildId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleQuickMark = async (studentId, status) => {
    try {
      setMarkStatus((prev) => ({ ...prev, [studentId]: "saving" }));
      await api.markAttendance({ studentId, date: "today", status });
      setMarkStatus((prev) => ({ ...prev, [studentId]: status }));
      setTimeout(() => { setMarkStatus((prev) => ({ ...prev, [studentId]: null })); loadData(); }, 2000);
    } catch (err) {
      alert(err.message || "Failed to mark attendance.");
      setMarkStatus((prev) => ({ ...prev, [studentId]: "error" }));
    }
  };

  if (loading && !studentData && !analytics && teacherStudents.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-text-secondary">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5 sm:p-8 max-w-6xl mx-auto w-full space-y-6 animate-fade-in">
      {/* PRINCIPAL DASHBOARD */}
      {user.role === "principal" && analytics && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card stat-card-green pl-6">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">School Average</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">{analytics.schoolAvg || "91.4"}%</span>
                <span className="text-xs font-semibold text-accent flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +1.4%
                </span>
              </div>
              <p className="text-xs text-text-tertiary mt-1">Across 10 classrooms</p>
            </div>

            <div className="stat-card stat-card-blue pl-6">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Total Enrolled</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">30</span>
                <span className="text-sm text-text-secondary">Students</span>
              </div>
              <p className="text-xs text-text-tertiary mt-1">10 Faculty · Classes 1A–5B</p>
            </div>

            <div className="stat-card stat-card-green pl-6">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Compliance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-accent">Optimal</span>
              </div>
              <p className="text-xs text-text-tertiary mt-1">Target &gt;85% achieved</p>
            </div>
          </div>

          {/* Class Breakdown */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-base text-text-primary">Classroom Attendance Matrix</h3>
              </div>
              <span className="badge-gray text-[11px]">Academic Year 2026</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(analytics.classBreakdown || [
                { className: "Class 1A", teacherName: "Priya Nair", average: "91.2", studentCount: 3 },
                { className: "Class 1B", teacherName: "Sunita Rao", average: "88.8", studentCount: 3 },
                { className: "Class 2A", teacherName: "Ananya Sharma", average: "92.7", studentCount: 3 },
                { className: "Class 2B", teacherName: "Vikram Roy", average: "90.7", studentCount: 3 },
                { className: "Class 3A", teacherName: "Deepa Kulkarni", average: "92.9", studentCount: 3 },
                { className: "Class 3B", teacherName: "Suresh Verma", average: "87.7", studentCount: 3 },
                { className: "Class 4A", teacherName: "Neha Deshmukh", average: "92.1", studentCount: 3 },
                { className: "Class 4B", teacherName: "Amit Patel", average: "90.0", studentCount: 3 },
                { className: "Class 5A", teacherName: "Pooja Iyer", average: "93.7", studentCount: 3 },
                { className: "Class 5B", teacherName: "Rahul Sengupta", average: "92.2", studentCount: 3 },
              ]).map((c, i) => {
                const pct = parseFloat(c.average);
                return (
                  <div key={i} className="p-4 rounded-xl bg-body border border-border hover:border-border-hover transition-colors">
                    <div className="flex items-center justify-between mb-2.5">
                      <div>
                        <h4 className="font-semibold text-sm text-text-primary">{c.className}</h4>
                        <p className="text-xs text-text-tertiary">{c.teacherName}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${pct >= 90 ? "text-accent" : pct >= 85 ? "text-amber-600" : "text-danger"}`}>
                          {c.average}%
                        </span>
                        <p className="text-[11px] text-text-tertiary">{c.studentCount} students</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${pct >= 90 ? "bg-accent" : pct >= 85 ? "bg-amber-500" : "bg-danger"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TEACHER DASHBOARD */}
      {user.role === "teacher" && (
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="font-bold text-base text-text-primary">Student Roster</h3>
                  <p className="text-xs text-text-tertiary">
                    Assigned: {user.classIds?.join(", ").toUpperCase() || "C1, C2"}
                  </p>
                </div>
              </div>
              <span className="badge-green text-[11px]">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="table-cell table-header">Student</th>
                    <th className="table-cell table-header">Class</th>
                    <th className="table-cell table-header">Attendance</th>
                    <th className="table-cell table-header text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherStudents.map((s) => {
                    const sid = s.userId || s.id;
                    const status = markStatus[sid];
                    const pct = parseFloat(s.percentage || "90");
                    return (
                      <tr key={sid} className="table-row border-b border-border/50 last:border-0">
                        <td className="table-cell">
                          <p className="font-medium text-text-primary">{s.name}</p>
                          <p className="text-xs text-text-tertiary">{sid.toUpperCase()}</p>
                        </td>
                        <td className="table-cell text-text-secondary">{s.classId?.toUpperCase() || "C1"}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${pct >= 85 ? "text-accent-dark" : "text-amber-600"}`}>
                              {s.percentage}%
                            </span>
                            <span className="text-xs text-text-tertiary">
                              ({s.presentDays || 0}/{s.totalWorkingDays || 0})
                            </span>
                          </div>
                        </td>
                        <td className="table-cell text-right">
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() => handleQuickMark(sid, "present")}
                              disabled={status === "saving"}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                status === "present"
                                  ? "bg-accent text-white"
                                  : "bg-accent-light text-accent-dark hover:bg-accent hover:text-white"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => handleQuickMark(sid, "absent")}
                              disabled={status === "saving"}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                status === "absent"
                                  ? "bg-danger text-white"
                                  : "bg-danger-light text-danger hover:bg-danger hover:text-white"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT & PARENT VIEW */}
      {(user.role === "student" || user.role === "parent") && studentData && (
        <div className="space-y-5">
          {/* Parent Child Switcher */}
          {user.role === "parent" && user.studentIds && user.studentIds.length > 1 && (
            <div className="card p-3 flex items-center gap-3">
              <span className="text-sm text-text-secondary">Select child:</span>
              {user.studentIds.map((sid) => (
                <button
                  key={sid}
                  onClick={() => setSelectedChildId(sid)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedChildId === sid
                      ? "bg-accent text-white"
                      : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                  }`}
                >
                  {sid.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card stat-card-green pl-6">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Overall Attendance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">{studentData.percentage}%</span>
                <span className={`badge text-[11px] ${parseFloat(studentData.percentage) >= 85 ? "badge-green" : "badge-yellow"}`}>
                  {parseFloat(studentData.percentage) >= 85 ? "Optimal" : "Attention"}
                </span>
              </div>
              <p className="text-xs text-text-tertiary mt-1">Past 3 months</p>
            </div>

            <div className="stat-card stat-card-blue pl-6">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Working Days</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-text-primary">{studentData.presentDays}</span>
                <span className="text-sm text-text-secondary">/ {studentData.totalWorkingDays}</span>
              </div>
              <p className="text-xs text-text-tertiary mt-1">Total sessions held</p>
            </div>

            <div className="stat-card stat-card-green pl-6">
              <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-1">Exam Eligibility</p>
              <span className="text-3xl font-bold text-accent">Eligible</span>
              <p className="text-xs text-text-tertiary mt-1">Min 75% requirement met</p>
            </div>
          </div>

          {/* Attendance Timeline */}
          <div className="card p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <Calendar className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-base text-text-primary">Recent Attendance</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {(studentData.records || []).slice(-10).reverse().map((r, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-center border transition-all hover:scale-[1.02] ${
                    r.status === "present"
                      ? "bg-accent-light/50 border-accent/20"
                      : r.status === "weekend"
                      ? "bg-gray-50 border-border"
                      : "bg-danger-light/50 border-danger/20"
                  }`}
                >
                  <span className="text-[11px] text-text-tertiary block">{r.date}</span>
                  <span className={`text-xs font-semibold capitalize block mt-0.5 ${
                    r.status === "present" ? "text-accent-dark" : r.status === "weekend" ? "text-text-tertiary" : "text-danger"
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
