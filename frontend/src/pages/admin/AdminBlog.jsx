import { useEffect, useState } from "react";
import { adminListPosts, adminCreatePost, adminUpdatePost, adminDeletePost } from "../../lib/adminApi";
import ImageDropzone from "../../components/admin/ImageDropzone";

const EMPTY = {
  slug: "", title: "", title_hy: "", excerpt: "", excerpt_hy: "",
  content: "", content_hy: "", category: "", category_hy: "",
  cover_url: "", published_at: new Date().toISOString().slice(0, 10),
};

const fmtDate = iso => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [editingSlug, setEditingSlug] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminListPosts().then(setPosts).catch(() => setError("Couldn't load posts.")).finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingSlug(null);
    setForm({ ...EMPTY });
  }

  function openEdit(p) {
    setEditingSlug(p.slug);
    setForm({
      slug: p.slug, title: p.title, title_hy: p.title_hy || "",
      excerpt: p.excerpt, excerpt_hy: p.excerpt_hy || "",
      content: p.content, content_hy: p.content_hy || "",
      category: p.category, category_hy: p.category_hy || "",
      cover_url: p.cover_url, published_at: p.published_at.slice(0, 10),
    });
  }

  function closeForm() {
    setForm(null);
    setEditingSlug(null);
  }

  function updateField(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        title_hy: form.title_hy || null,
        excerpt_hy: form.excerpt_hy || null,
        content_hy: form.content_hy || null,
        category_hy: form.category_hy || null,
        published_at: new Date(form.published_at).toISOString(),
      };
      if (editingSlug) {
        const { slug, ...rest } = payload;
        await adminUpdatePost(editingSlug, rest);
      } else {
        await adminCreatePost(payload);
      }
      closeForm();
      load();
    } catch (err) {
      setError(err.message || "Couldn't save post.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(slug) {
    if (!window.confirm(`Delete post "${slug}"? This can't be undone.`)) return;
    try {
      await adminDeletePost(slug);
      load();
    } catch (err) {
      setError(err.message || "Couldn't delete post.");
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Blog</h1>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ New post</button>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="admin-empty">No posts yet.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th></th><th>Title</th><th>Category</th><th>Published</th><th></th></tr>
            </thead>
            <tbody>
              {posts.map(p => (
                <tr key={p.slug}>
                  <td><img className="admin-table-thumb" src={p.cover_url} alt="" /></td>
                  <td>
                    <div className="admin-table-title">{p.title}</div>
                    <div className="admin-table-sub">{p.slug}</div>
                  </td>
                  <td>{p.category}</td>
                  <td>{fmtDate(p.published_at)}</td>
                  <td className="admin-table-actions">
                    <button className="admin-btn admin-btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => onDelete(p.slug)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {form && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) closeForm(); }}>
          <form className="admin-modal" onSubmit={onSubmit}>
            <div className="admin-modal-head">
              <h2>{editingSlug ? "Edit post" : "New post"}</h2>
              <button type="button" className="admin-modal-close" onClick={closeForm}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <label className="quote-field">
                <span>Cover photo</span>
                <ImageDropzone value={form.cover_url} onChange={img => updateField("cover_url", img || "")} />
              </label>

              {!editingSlug && (
                <label className="quote-field">
                  <span>Slug (URL, unique)</span>
                  <input value={form.slug} onChange={e => updateField("slug", e.target.value)} required pattern="[a-z0-9\-]+" placeholder="aluminum-vs-pvc-windows" />
                </label>
              )}
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Title (EN)</span>
                  <input value={form.title} onChange={e => updateField("title", e.target.value)} required />
                </label>
                <label className="quote-field">
                  <span>Title (HY)</span>
                  <input value={form.title_hy} onChange={e => updateField("title_hy", e.target.value)} />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Excerpt (EN)</span>
                  <textarea rows={2} value={form.excerpt} onChange={e => updateField("excerpt", e.target.value)} required />
                </label>
                <label className="quote-field">
                  <span>Excerpt (HY)</span>
                  <textarea rows={2} value={form.excerpt_hy} onChange={e => updateField("excerpt_hy", e.target.value)} />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Content (EN) — separate paragraphs with a blank line</span>
                  <textarea rows={6} value={form.content} onChange={e => updateField("content", e.target.value)} required />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Content (HY)</span>
                  <textarea rows={6} value={form.content_hy} onChange={e => updateField("content_hy", e.target.value)} />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Category (EN)</span>
                  <input value={form.category} onChange={e => updateField("category", e.target.value)} required placeholder="Guides" />
                </label>
                <label className="quote-field">
                  <span>Category (HY)</span>
                  <input value={form.category_hy} onChange={e => updateField("category_hy", e.target.value)} />
                </label>
                <label className="quote-field">
                  <span>Published date</span>
                  <input type="date" value={form.published_at} onChange={e => updateField("published_at", e.target.value)} required />
                </label>
              </div>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-btn" onClick={closeForm}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save post"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
