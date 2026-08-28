import { lazy } from "react";

const RELOAD_FLAG = "hakhverdyan_chunk_reload_attempted";

// Every deploy gives JS chunks fresh content hashes. A tab left open across a
// deploy still holds references to the old (now-deleted) filenames, so its
// first lazy-loaded navigation 404s with "Failed to fetch dynamically
// imported module". A full reload fixes it (fresh index.html -> current
// hashes) — do that once automatically instead of showing a crash.
export default function lazyWithReload(importer) {
  return lazy(async () => {
    try {
      const mod = await importer();
      sessionStorage.removeItem(RELOAD_FLAG);
      return mod;
    } catch (err) {
      if (sessionStorage.getItem(RELOAD_FLAG)) throw err;
      sessionStorage.setItem(RELOAD_FLAG, "1");
      window.location.reload();
      return new Promise(() => {}); // suspend forever — the reload takes over
    }
  });
}
