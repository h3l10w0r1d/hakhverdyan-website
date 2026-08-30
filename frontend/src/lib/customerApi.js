const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
const TOKEN_KEY = "hakhverdyan_customer_token";

export function getCustomerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setCustomerToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getCustomerToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (res.status === 401) {
    setCustomerToken(null);
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

export const customerRegister = payload =>
  request("/api/customers/register", { method: "POST", body: JSON.stringify(payload) });

export const customerLogin = (email, password) =>
  request("/api/customers/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const customerMe = () => request("/api/customers/me");

export const customerUpdateMe = payload =>
  request("/api/customers/me", { method: "PATCH", body: JSON.stringify(payload) });

export const customerMyQuotes = () => request("/api/customers/me/quotes");
