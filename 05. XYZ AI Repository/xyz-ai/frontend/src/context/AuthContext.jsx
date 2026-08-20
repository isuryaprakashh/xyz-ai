import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("xyz_token") || null);
  const [loading, setLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState([]);

  // Load registered demo users
  const loadDemoUsers = useCallback(async () => {
    try {
      const res = await api.getDemoUsers();
      setDemoUsers(res.users || []);
    } catch (e) {
      console.warn("Failed to fetch registered users:", e);
    }
  }, []);

  useEffect(() => {
    loadDemoUsers();
  }, [loadDemoUsers]);

  // Restore authenticated session on page reload
  useEffect(() => {
    async function restoreSession() {
      const storedToken = localStorage.getItem("xyz_token");
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (e) {
          console.warn("Session restore failed, logging out:", e.message);
          logout();
        }
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  const login = useCallback(async (username, password = "demo") => {
    setLoading(true);
    try {
      const res = await api.login(username, password);
      if (res.token && res.user) {
        localStorage.setItem("xyz_token", res.token);
        localStorage.setItem("xyz_user", JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      if (res.token && res.user) {
        localStorage.setItem("xyz_token", res.token);
        localStorage.setItem("xyz_user", JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        await loadDemoUsers();
        return res.user;
      }
    } catch (err) {
      console.error("Registration failed:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadDemoUsers]);

  const switchRole = useCallback(async (username) => {
    return await login(username, "demo");
  }, [login]);

  const updateProfile = useCallback(async (data) => {
    try {
      const res = await api.updateProfile(data);
      if (res.user) {
        setUser((prev) => ({ ...prev, ...res.user }));
      }
      return res;
    } catch (err) {
      console.error("Update profile failed:", err);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("xyz_token");
    localStorage.removeItem("xyz_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoUsers,
        login,
        register,
        switchRole,
        updateProfile,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
