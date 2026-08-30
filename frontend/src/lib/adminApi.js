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
export const adminAnalytics = () => request("/api/admin/analytics");

export const adminListProducts = () => request("/api/admin/products");
export const adminCreateProduct = payload =>
  request("/api/admin/products", { method: "POST", body: JSON.stringify(payload) });
export const adminUpdateProduct = (id, payload) =>
  request(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const adminDeleteProduct = id =>
  request(`/api/admin/products/${id}`, { method: "DELETE" });
export const adminReorderProducts = ids =>
  request("/api/admin/products/reorder", { method: "PUT", body: JSON.stringify({ ids }) });

export const adminListPosts = () => request("/api/admin/posts");
export const adminCreatePost = payload =>
  request("/api/admin/posts", { method: "POST", body: JSON.stringify(payload) });
export const adminUpdatePost = (slug, payload) =>
  request(`/api/admin/posts/${slug}`, { method: "PUT", body: JSON.stringify(payload) });
export const adminDeletePost = slug =>
  request(`/api/admin/posts/${slug}`, { method: "DELETE" });

export const adminListPartners = () => request("/api/admin/partners");
export const adminCreatePartner = payload =>
  request("/api/admin/partners", { method: "POST", body: JSON.stringify(payload) });
export const adminUpdatePartner = (id, payload) =>
  request(`/api/admin/partners/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const adminDeletePartner = id =>
  request(`/api/admin/partners/${id}`, { method: "DELETE" });
export const adminReorderPartners = ids =>
  request("/api/admin/partners/reorder", { method: "PUT", body: JSON.stringify({ ids }) });

export const adminListQuotes = () => request("/api/admin/quotes");
export const adminUpdateQuoteStatus = (id, status) =>
  request(`/api/admin/quotes/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
export const adminUpdateQuoteNote = (id, admin_note) =>
  request(`/api/admin/quotes/${id}/note`, { method: "PATCH", body: JSON.stringify({ admin_note }) });

export const adminListMessages = () => request("/api/admin/messages");
export const adminUpdateMessageStatus = (id, status) =>
  request(`/api/admin/messages/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });

export const adminListAdmins = () => request("/api/admin/admins");
export const adminCreateAdmin = payload =>
  request("/api/admin/admins", { method: "POST", body: JSON.stringify(payload) });
export const adminDeleteAdmin = id =>
  request(`/api/admin/admins/${id}`, { method: "DELETE" });
export const adminUpdateMe = payload =>
  request("/api/admin/me", { method: "PUT", body: JSON.stringify(payload) });
export const adminChangePassword = (current_password, new_password) =>
  request("/api/admin/me/password", { method: "PUT", body: JSON.stringify({ current_password, new_password }) });

export const adminListCategories = () => request("/api/admin/categories");
export const adminCreateCategory = payload =>
  request("/api/admin/categories", { method: "POST", body: JSON.stringify(payload) });
export const adminUpdateCategory = (id, payload) =>
  request(`/api/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const adminDeleteCategory = id =>
  request(`/api/admin/categories/${id}`, { method: "DELETE" });
export const adminReorderCategories = ids =>
  request("/api/admin/categories/reorder", { method: "PUT", body: JSON.stringify({ ids }) });

export const adminGetSettings = () => request("/api/admin/settings");
export const adminUpdateSettings = payload =>
  request("/api/admin/settings", { method: "PUT", body: JSON.stringify(payload) });

export const adminListLocations = () => request("/api/admin/locations");
export const adminCreateLocation = payload =>
  request("/api/admin/locations", { method: "POST", body: JSON.stringify(payload) });
export const adminUpdateLocation = (id, payload) =>
  request(`/api/admin/locations/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const adminDeleteLocation = id =>
  request(`/api/admin/locations/${id}`, { method: "DELETE" });
export const adminReorderLocations = ids =>
  request("/api/admin/locations/reorder", { method: "PUT", body: JSON.stringify({ ids }) });
