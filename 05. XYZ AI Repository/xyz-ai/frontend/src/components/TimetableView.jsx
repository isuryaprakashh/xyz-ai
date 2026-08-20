import { useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Filter,
  Plus,
  Edit2,
  X,
  Sparkles,
} from "lucide-react";

export function TimetableView({ user, onNavigateToAttendance }) {
  const [timetableData, setTimetableData] = useState(null);
  const [allClasses, setAllClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("c1");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [allTeachers, setAllTeachers] = useState([]);
  const [selectedDay, setSelectedDay] = useState(() => {
    const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const valid = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    return valid.includes(todayName) ? todayName : "Monday";
  });
  const [selectedChildId, setSelectedChildId] = useState(
    (user.studentIds && user.studentIds[0]) || "jeevan"
  );
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("class"); // 'class' | 'teacher' for principal

  // Attendance quick-mark modal from timetable (for teachers)
  const [markingClassId, setMarkingClassId] = useState(null);
  const [classRoster, setClassRoster] = useState([]);
  const [rosterStatuses, setRosterStatuses] = useState({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const loadTimetable = useCallback(async () => {
    setLoading(true);
    try {
      if (user.role === "student") {
        const res = await api.getMyTimetable();
        setTimetableData(res.timetable);
      } else if (user.role === "parent") {
        const res = await api.getMyTimetable({ studentId: selectedChildId });
        setTimetableData(res.timetable);
      } else if (user.role === "teacher") {
        const res = await api.getMyTimetable();
        setTimetableData(res.teacherSchedule);
      } else if (user.role === "principal" || user.role === "admin") {
        const [clsRes, tchRes] = await Promise.all([
          api.getAllClasses(),
          api.getUsersByRole("teacher"),
        ]);
        setAllClasses(clsRes.classes || []);
        setAllTeachers(tchRes.users || []);

        if (viewMode === "teacher" && selectedTeacherId) {
          const res = await api.getTeacherTimetable(selectedTeacherId);
          setTimetableData(res.teacherSchedule);
        } else {
          const res = await api.getClassTimetable(selectedClassId);
          setTimetableData(res.timetable);
        }
      }
    } catch (err) {
      console.warn("Failed to load timetable:", err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedChildId, selectedClassId, selectedTeacherId, viewMode]);

  useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  // Open Quick Class Attendance from Timetable
  const openClassAttendance = async (classId) => {
    try {
      setMarkingClassId(classId);
      const res = await api.getClassRoster(classId);
      setClassRoster(res.roster || []);
      const initial = {};
      (res.roster || []).forEach((s) => {
        initial[s.id || s.userId] = "present";
      });
      setRosterStatuses(initial);
    } catch (err) {
      alert("Failed to load class roster: " + err.message);
      setMarkingClassId(null);
    }
  };

  const handleSaveClassAttendance = async () => {
    if (!markingClassId) return;
    setSavingAttendance(true);
    try {
      const studentStatuses = Object.entries(rosterStatuses).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      await api.markClassAttendance({
        classId: markingClassId,
        date: "today",
        studentStatuses,
      });
      setSuccessToast(`Attendance for ${markingClassId.toUpperCase()} saved successfully!`);
      setTimeout(() => setSuccessToast(""), 3000);
      setMarkingClassId(null);
    } catch (err) {
      alert("Failed to save attendance: " + err.message);
    } finally {
      setSavingAttendance(false);
    }
  };

  const activePeriods = (() => {
    if (!timetableData?.schedule) return [];
    const daySchedule = timetableData.schedule.find((s) => s.day === selectedDay);
    return daySchedule?.periods || [];
  })();

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="flex-1 overflow-y-auto p-5 sm:p-8 max-w-6xl mx-auto w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-bold text-text-primary">
              {user.role === "teacher"
                ? "My Teaching Schedule"
                : user.role === "principal"
                ? "School Master Timetable"
                : "Class Timetable"}
            </h2>
          </div>
          <p className="text-sm text-text-tertiary mt-0.5">
            {user.role === "teacher"
              ? "View your assigned classes, subject periods, and mark classroom attendance."
              : user.role === "principal"
              ? "Inspect and manage weekly class schedules and teacher assignments across Grades 1–5."
              : user.role === "parent"
              ? "Track your child's daily class schedule, faculty leads, and classroom rooms."
              : "View your daily class periods, subject teachers, and classroom locations."}
          </p>
        </div>

        {/* Parent Child Switcher */}
        {user.role === "parent" && user.studentIds && user.studentIds.length > 1 && (
          <div className="flex items-center gap-2 card p-1.5 self-start sm:self-center">
            <span className="text-xs text-text-tertiary px-2">Child:</span>
            {user.studentIds.map((sid) => (
              <button
                key={sid}
                onClick={() => setSelectedChildId(sid)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase transition-all ${
                  selectedChildId === sid
                    ? "bg-accent text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {sid}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-accent-light border border-emerald-200 text-accent-dark text-sm flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span className="font-semibold">{successToast}</span>
        </div>
      )}

      {/* Principal Selectors */}
      {(user.role === "principal" || user.role === "admin") && (
        <div className="card p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              Filter By:
            </span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("class")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === "class"
                    ? "bg-white text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Classroom
              </button>
              <button
                onClick={() => {
                  setViewMode("teacher");
                  if (!selectedTeacherId && allTeachers.length > 0) {
                    setSelectedTeacherId(allTeachers[0].userId || allTeachers[0].id);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  viewMode === "teacher"
                    ? "bg-white text-text-primary shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Teacher
              </button>
            </div>
          </div>

          {viewMode === "class" ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">Class:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="select py-1.5 px-3 text-xs w-44"
              >
                {allClasses.map((c) => (
                  <option key={c.classId || c.id} value={c.classId || c.id}>
                    {c.name} ({c.grade})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">Teacher:</span>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="select py-1.5 px-3 text-xs w-52"
              >
                {allTeachers.map((t) => (
                  <option key={t.userId || t.id} value={t.userId || t.id}>
                    {t.name} ({t.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {days.map((day) => {
          const isToday = day === todayName;
          const isSelected = day === selectedDay;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 flex items-center gap-2 ${
                isSelected
                  ? "bg-text-primary text-white shadow-sm"
                  : "card-hover text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>{day}</span>
              {isToday && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    isSelected ? "bg-accent text-white" : "badge-green"
                  }`}
                >
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Timetable Period List */}
      {loading ? (
        <div className="card p-12 flex items-center justify-center gap-2.5 text-text-secondary text-sm">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span>Loading schedule...</span>
        </div>
      ) : activePeriods.length === 0 ? (
        <div className="card p-10 text-center text-sm text-text-tertiary">
          No periods scheduled for {selectedDay}.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {activePeriods.map((p, idx) => (
            <div
              key={idx}
              className="card-hover p-4.5 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Top Row: Period Badge & Time */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-accent-light text-accent-dark font-bold text-xs flex items-center justify-center">
                    P{p.periodNumber}
                  </span>
                  <span className="text-xs font-semibold text-text-primary">{p.subject}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-text-tertiary">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{p.time}</span>
                </div>
              </div>

              {/* Middle Row: Faculty & Classroom */}
              <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-border/60">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-accent" />
                  <span>{p.teacherName || "Faculty"}</span>
                  {p.className && (
                    <span className="badge-gray ml-1 text-[10px] font-semibold">
                      {p.className}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-text-tertiary">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{p.room || "Room 101"}</span>
                </div>
              </div>

              {/* Teacher Quick Attendance Button */}
              {user.role === "teacher" && p.classId && (
                <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] text-text-tertiary">
                    Class: <strong className="text-text-primary">{p.className || p.classId.toUpperCase()}</strong>
                  </span>
                  <button
                    onClick={() => openClassAttendance(p.classId)}
                    className="btn-primary text-xs h-7 px-3 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Post Class Attendance</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Mark Class Attendance Modal */}
      {markingClassId && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-border rounded-2xl p-6 max-w-lg w-full shadow-modal animate-scale-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-base text-text-primary">
                  Post Attendance: {markingClassId.toUpperCase()}
                </h3>
                <p className="text-xs text-text-tertiary">
                  Date: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <button
                onClick={() => setMarkingClassId(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-border">
              <span className="text-text-secondary font-medium">Quick Preset:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const allPresent = {};
                    classRoster.forEach((s) => (allPresent[s.id || s.userId] = "present"));
                    setRosterStatuses(allPresent);
                  }}
                  className="px-2.5 py-1 rounded-md bg-accent-light text-accent-dark font-semibold text-xs hover:bg-accent hover:text-white transition-colors"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const allAbsent = {};
                    classRoster.forEach((s) => (allAbsent[s.id || s.userId] = "absent"));
                    setRosterStatuses(allAbsent);
                  }}
                  className="px-2.5 py-1 rounded-md bg-danger-light text-danger font-semibold text-xs hover:bg-danger hover:text-white transition-colors"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            {/* Student Roster List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
              {classRoster.map((s) => {
                const sid = s.id || s.userId;
                const status = rosterStatuses[sid] || "present";
                return (
                  <div key={sid} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{s.name}</p>
                      <p className="text-[11px] text-text-tertiary">ID: {sid.toUpperCase()}</p>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setRosterStatuses((prev) => ({ ...prev, [sid]: "present" }))}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          status === "present"
                            ? "bg-accent text-white shadow-sm"
                            : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setRosterStatuses((prev) => ({ ...prev, [sid]: "absent" }))}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          status === "absent"
                            ? "bg-danger text-white shadow-sm"
                            : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setMarkingClassId(null)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveClassAttendance}
                disabled={savingAttendance}
                className="btn-primary"
              >
                {savingAttendance ? "Saving..." : "Submit Class Attendance"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
