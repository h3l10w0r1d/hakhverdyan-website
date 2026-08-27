import { useEffect } from "react";

const SITE_URL = "https://hakhverdyan-frontend.vercel.app";

function setMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

// Updates document.title, meta description/OG/Twitter tags, and the canonical
// link for the current route. Runs on mount and whenever title/description
// change (e.g. language switch, or once async page data — like a blog post —
// has loaded).
export default function useSEO({ title, description, path = "" }) {
  useEffect(() => {
    if (!title) return;
    document.title = title;
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }
    setMeta("property", "og:title", title);
    setMeta("name", "twitter:title", title);

    const url = SITE_URL + path;
    setMeta("property", "og:url", url);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [title, description, path]);
}
