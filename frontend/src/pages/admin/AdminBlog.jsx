import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminListPosts, adminDeletePost } from "../../lib/adminApi";

const TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "published", label: "Published" },
];

const fmtDate = iso => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function AdminBlog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  function load() {
    setLoading(true);
    adminListPosts().then(setPosts).catch(() => setError("Couldn't load posts.")).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function onDelete(e, slug, title) {
    e.stopPropagation();
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    try {
      await adminDeletePost(slug);
      load();
    } catch (err) {
      setError(err.message || "Couldn't delete post.");
    }
  }

  const query = search.trim().toLowerCase();
  const filtered = posts.filter(p => {
    if (tab !== "all" && p.status !== tab) return false;
    if (!query) return true;
    return (
      p.title.toLowerCase().includes(query) ||
      p.slug.toLowerCase().includes(query) ||
      (p.tags || []).some(t => t.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Blog</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => navigate("/admin/blog/new")}>+ New post</button>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="ghost-list-tabs">
        {TABS.map(t => (
          <button
            key={t.key} type="button"
            className={"ghost-list-tab" + (tab === t.key ? " active" : "")}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-search-row">
        <input
          type="text" className="admin-search-input" placeholder="Search by title, slug, or tag…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {(search || tab !== "all") && <span className="admin-search-count">{filtered.length} of {posts.length}</span>}
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">{posts.length === 0 ? "No posts yet." : "No posts match."}</div>
        ) : (
          <div className="ghost-post-list">
            {filtered.map(p => (
              <div key={p.slug} className="ghost-post-row" onClick={() => navigate(`/admin/blog/${p.slug}/edit`)}>
                {p.cover_url ? (
                  <img className="ghost-post-thumb" src={p.cover_url} alt="" />
                ) : (
                  <div className="ghost-post-thumb" />
                )}
                <div className="ghost-post-main">
                  <div className="ghost-post-title">{p.title}</div>
                  <div className="ghost-post-excerpt">{p.excerpt}</div>
                </div>
                <div className="ghost-post-tags">
                  {(p.tags || []).slice(0, 2).map(t => <span key={t} className="ghost-post-tag">{t}</span>)}
                </div>
                <div className="ghost-post-meta">
                  <span className={"admin-badge status-" + (p.status === "published" ? "closed" : "new")}>
                    {p.status === "published" ? "Published" : "Draft"}
                  </span>
                  <span>{fmtDate(p.published_at)}</span>
                </div>
                <div className="admin-table-actions">
                  <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={e => onDelete(e, p.slug, p.title)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
