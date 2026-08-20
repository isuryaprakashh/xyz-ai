const API_BASE = "";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("xyz_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || data.error || `HTTP ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // Auth & Profile
  login: (username, password = "demo") =>
    apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  register: (payload) =>
    apiRequest("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => apiRequest("/api/auth/me"),
  updateProfile: (profile) =>
    apiRequest("/api/auth/profile", { method: "PUT", body: JSON.stringify(profile) }),
  getDemoUsers: () => apiRequest("/api/auth/demo-users"),

  // User Management (CRUD for Principal / Admin)
  getUsersByRole: (role) => apiRequest(role ? `/api/users?role=${role}` : "/api/users"),
  getUser: (id) => apiRequest(`/api/users/${id}`),
  createUser: (payload) =>
    apiRequest("/api/users", { method: "POST", body: JSON.stringify(payload) }),
  updateUser: (id, payload) =>
    apiRequest(`/api/users/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteUser: (id) =>
    apiRequest(`/api/users/${id}`, { method: "DELETE" }),
  getAllClasses: () => apiRequest("/api/users/classes/all"),

  // Chat
  sendMessage: ({ message, sessionId, language, userId }) =>
    apiRequest("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, sessionId, language, userId }),
    }),
  sendChat: ({ message, sessionId, language, userId }) =>
    apiRequest("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, sessionId, language, userId }),
    }),

  // Timetables
  getMyTimetable: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/api/timetable/my${q ? `?${q}` : ""}`);
  },
  getClassTimetable: (classId) => apiRequest(`/api/timetable/class/${classId}`),
  getTeacherTimetable: (teacherId) => apiRequest(`/api/timetable/teacher/${teacherId}`),
  getAllTimetables: () => apiRequest("/api/timetable/all"),
  updateClassTimetable: (classId, schedule) =>
    apiRequest(`/api/timetable/class/${classId}`, {
      method: "PUT",
      body: JSON.stringify({ schedule }),
    }),

  // Attendance
  getStudentAttendance: (studentId) => apiRequest(`/api/attendance/student/${studentId}`),
  getSchoolAnalytics: () => apiRequest("/api/attendance/analytics"),
  getClassRoster: (classId) => apiRequest(`/api/attendance/class/${classId}`),
  markAttendance: ({ studentId, date = "today", status = "present" }) =>
    apiRequest("/api/attendance/mark", {
      method: "POST",
      body: JSON.stringify({ studentId, date, status }),
    }),
  markClassAttendance: ({ classId, date = "today", studentStatuses = [] }) =>
    apiRequest("/api/attendance/mark-class", {
      method: "POST",
      body: JSON.stringify({ classId, date, studentStatuses }),
    }),

  // Escalations
  createEscalation: ({ targetRole, studentId, reason, priority = "medium" }) =>
    apiRequest("/api/escalation/request", {
      method: "POST",
      body: JSON.stringify({ targetRole, studentId, reason, priority }),
    }),
  getEscalations: () => apiRequest("/api/escalation/list"),
  updateEscalationStatus: (ticketId, status) =>
    apiRequest(`/api/escalation/${ticketId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Audit Logs (Principal / Admin)
  getAuditLogs: () => apiRequest("/api/audit/logs"),

  // Health
  getHealth: () => apiRequest("/api/health"),
};
