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
  // Auth
  login: (username, password = "demo") =>
    apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  register: (payload) =>
    apiRequest("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => apiRequest("/api/auth/me"),
  updateProfile: (profile) =>
    apiRequest("/api/auth/profile", { method: "PUT", body: JSON.stringify(profile) }),
  getDemoUsers: () => apiRequest("/api/auth/demo-users"),
  getUsersByRole: (role) => apiRequest(`/api/users?role=${role}`),

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

  // Attendance
  getStudentAttendance: (studentId) => apiRequest(`/api/attendance/student/${studentId}`),
  getSchoolAnalytics: () => apiRequest("/api/attendance/analytics"),
  markAttendance: ({ studentId, date = "today", status = "present" }) =>
    apiRequest("/api/attendance/mark", {
      method: "POST",
      body: JSON.stringify({ studentId, date, status }),
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

  // Audit Logs
  getAuditLogs: () => apiRequest("/api/audit/logs"),

  // Health
  getHealth: () => apiRequest("/api/health"),
};
