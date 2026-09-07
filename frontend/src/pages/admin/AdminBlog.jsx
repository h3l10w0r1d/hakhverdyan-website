import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminListPosts, adminDeletePost } from "../../lib/adminApi";
import { useAdminT } from "../../context/AdminI18nContext";

const TABS = [
  { key: "all", labelKey: "tabAll" },
  { key: "draft", labelKey: "tabDrafts" },
  { key: "published", labelKey: "tabPublished" },
];

const fmtDate = iso => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function AdminBlog() {
  const { t } = useAdminT();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  function load() {
    setLoading(true);
    adminListPosts().then(setPosts).catch(() => setError(t("blog.couldntLoadPosts"))).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function onDelete(e, slug, title) {
    e.stopPropagation();
    if (!window.confirm(t("blog.deleteConfirm", { title }))) return;
    try {
      await adminDeletePost(slug);
      load();
    } catch (err) {
      setError(err.message || t("blog.couldntDeletePost"));
    }
  }

  const query = search.trim().toLowerCase();
  const filtered = posts.filter(p => {
    if (tab !== "all" && p.status !== tab) return false;
    if (!query) return true;
    return (
      p.title.toLowerCase().includes(query) ||
      p.slug.toLowerCase().includes(query) ||
      (p.tags || []).some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t("blog.title")}</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => navigate("/admin/blog/new")}>{t("blog.newPost")}</button>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="ghost-list-tabs">
        {TABS.map(tabItem => (
          <button
            key={tabItem.key} type="button"
            className={"ghost-list-tab" + (tab === tabItem.key ? " active" : "")}
            onClick={() => setTab(tabItem.key)}
          >
            {t(`blog.${tabItem.labelKey}`)}
          </button>
        ))}
      </div>

      <div className="admin-search-row">
        <input
          type="text" className="admin-search-input" placeholder={t("blog.searchPlaceholder")}
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {(search || tab !== "all") && <span className="admin-search-count">{t("blog.searchCount", { filtered: filtered.length, total: posts.length })}</span>}
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">{t("common.loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">{posts.length === 0 ? t("blog.emptyNone") : t("blog.emptyNoMatch")}</div>
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
                  {(p.tags || []).slice(0, 2).map(tag => <span key={tag} className="ghost-post-tag">{tag}</span>)}
                </div>
                <div className="ghost-post-meta">
                  <span className={"admin-badge status-" + (p.status === "published" ? "closed" : "new")}>
                    {p.status === "published" ? t("blog.statusPublished") : t("blog.statusDraft")}
                  </span>
                  <span>{fmtDate(p.published_at)}</span>
                </div>
                <div className="admin-table-actions">
                  <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={e => onDelete(e, p.slug, p.title)}>{t("common.delete")}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
