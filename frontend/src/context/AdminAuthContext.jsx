import { createContext, useContext, useEffect, useState } from "react";
import { adminLogin, adminMe, getToken, setToken } from "../lib/adminApi";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    adminMe()
      .then(setAdmin)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const result = await adminLogin(email, password);
    setToken(result.access_token);
    setAdmin(result.admin);
    return result;
  }

  function logout() {
    setToken(null);
    setAdmin(null);
  }

  const value = { admin, loading, login, logout, setAdmin, isAuthenticated: !!admin };
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
