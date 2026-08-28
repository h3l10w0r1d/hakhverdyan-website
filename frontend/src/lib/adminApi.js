const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
const TOKEN_KEY = "hakhverdyan_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    setToken(null);
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.detail || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const adminLogin = (email, password) =>
  request("/api/admin/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const adminMe = () => request("/api/admin/me");
export const adminStats = () => request("/api/admin/stats");

export const adminListProducts = () => request("/api/admin/products");
export const adminCreateProduct = payload =>
  request("/api/admin/products", { method: "POST", body: JSON.stringify(payload) });
export const adminUpdateProduct = (id, payload) =>
  request(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const adminDeleteProduct = id =>
  request(`/api/admin/products/${id}`, { method: "DELETE" });

export const adminListQuotes = () => request("/api/admin/quotes");
export const adminUpdateQuoteStatus = (id, status) =>
  request(`/api/admin/quotes/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
export const adminUpdateQuoteNote = (id, admin_note) =>
  request(`/api/admin/quotes/${id}/note`, { method: "PATCH", body: JSON.stringify({ admin_note }) });

export const adminListMessages = () => request("/api/admin/messages");
export const adminUpdateMessageStatus = (id, status) =>
  request(`/api/admin/messages/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
