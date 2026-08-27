const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
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
  return request("/api/quotes", { method: "POST", body: JSON.stringify(payload) });
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
