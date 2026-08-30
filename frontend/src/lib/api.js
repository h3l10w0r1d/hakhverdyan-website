import { getCustomerToken } from "./customerApi";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function fetchProducts({ category, q } = {}) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (q) params.set("q", q);
  const qs = params.toString();
  return request(`/api/products${qs ? `?${qs}` : ""}`);
}

export function submitQuote(payload) {
  const token = getCustomerToken();
  return request("/api/quotes", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function submitContactMessage(payload) {
  return request("/api/contact", { method: "POST", body: JSON.stringify(payload) });
}

export function fetchPosts({ category } = {}) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  const qs = params.toString();
  return request(`/api/posts${qs ? `?${qs}` : ""}`);
}

export function fetchPost(slug) {
  return request(`/api/posts/${slug}`);
}

export function fetchPartners() {
  return request("/api/partners");
}

export function fetchCategories() {
  return request("/api/categories");
}

export function fetchSettings() {
  return request("/api/settings");
}

export function fetchLocations() {
  return request("/api/locations");
}
