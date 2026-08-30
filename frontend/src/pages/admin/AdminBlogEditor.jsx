import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminListPosts, adminCreatePost, adminUpdatePost, adminDeletePost } from "../../lib/adminApi";
import ImageDropzone from "../../components/admin/ImageDropzone";
import { ArrowIcon, GearIcon, CloseIcon } from "../../lib/icons";

const EMPTY = {
  slug: "", title: "", title_hy: "", excerpt: "", excerpt_hy: "",
  content: "", content_hy: "", category: "", category_hy: "",
  cover_url: null, published_at: "", status: "draft", tags: [],
};

function slugify(text) {
  return text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

function nowLocalDatetime() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function toLocalDatetime(iso) {
  if (!iso) return nowLocalDatetime();
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function AdminBlogEditor() {
  const { slug: editSlug } = useParams();
  const navigate = useNavigate();
  const isNew = !editSlug;

  const [form, setForm] = useState(isNew ? { ...EMPTY, published_at: nowLocalDatetime() } : null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [lang, setLang] = useState("en");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const titleRef = useRef(null);

  useEffect(() => {
    if (isNew) return;
    setLoading(true);
    adminListPosts()
      .then(posts => {
        const p = posts.find(x => x.slug === editSlug);
        if (!p) { setError("Post not found."); return; }
        setForm({
          slug: p.slug, title: p.title, title_hy: p.title_hy || "",
          excerpt: p.excerpt, excerpt_hy: p.excerpt_hy || "",
          content: p.content, content_hy: p.content_hy || "",
          category: p.category, category_hy: p.category_hy || "",
          cover_url: p.cover_url || null, published_at: toLocalDatetime(p.published_at),
          status: p.status, tags: p.tags || [],
        });
      })
      .catch(() => setError("Couldn't load post."))
      .finally(() => setLoading(false));
  }, [editSlug, isNew]);

  function updateField(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function onTitleChange(value) {
    const field = lang === "hy" ? "title_hy" : "title";
    setForm(f => {
      const next = { ...f, [field]: value };
      if (isNew && lang === "en" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) updateField("tags", [...form.tags, t]);
    setTagInput("");
  }

  function removeTag(t) {
    updateField("tags", form.tags.filter(x => x !== t));
  }

  function buildPayload(overrides = {}) {
    return {
      ...form,
      title_hy: form.title_hy || null,
      excerpt_hy: form.excerpt_hy || null,
      content_hy: form.content_hy || null,
      category_hy: form.category_hy || null,
      cover_url: form.cover_url || "",
      published_at: new Date(form.published_at).toISOString(),
      ...overrides,
    };
  }

  async function persist(overrides, { redirectAfter } = {}) {
    setSaving(true);
    setError("");
    try {
      const payload = buildPayload(overrides);
      let saved;
      if (isNew) {
        saved = await adminCreatePost(payload);
      } else {
        const { slug, ...rest } = payload;
        saved = await adminUpdatePost(editSlug, rest);
      }
      setForm(f => ({ ...f, status: saved.status }));
      if (redirectAfter) navigate(`/admin/blog/${saved.slug}/edit`, { replace: true });
      return saved;
    } catch (err) {
      setError(err.message || "Couldn't save post.");
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function onSaveDraft() {
    try {
      await persist({ status: "draft" }, { redirectAfter: isNew });
    } catch { /* error already set */ }
  }

  async function onConfirmPublish() {
    try {
      await persist({ status: "published" }, { redirectAfter: isNew });
      setPublishOpen(false);
    } catch { /* error already set */ }
  }

  async function onUpdate() {
    try {
      await persist({});
    } catch { /* error already set */ }
  }

  async function onRevertToDraft() {
    if (!window.confirm("Revert this post to a draft? It will come down from the site.")) return;
    try {
      await persist({ status: "draft" });
    } catch { /* error already set */ }
  }

  async function onDelete() {
    if (!window.confirm(`Delete "${form.title}"? This can't be undone.`)) return;
    try {
      await adminDeletePost(editSlug);
      navigate("/admin/blog");
    } catch (err) {
      setError(err.message || "Couldn't delete post.");
    }
  }

  if (loading || !form) {
    return <div className="ghost-editor"><div className="admin-empty">Loading…</div></div>;
  }

  const title = lang === "hy" ? form.title_hy : form.title;
  const content = lang === "hy" ? form.content_hy : form.content;
  const contentField = lang === "hy" ? "content_hy" : "content";

  return (
    <div className="ghost-editor">
      <header className="ghost-topbar">
        <button className="ghost-back" onClick={() => navigate("/admin/blog")}>
          <ArrowIcon size={14} /> Posts
        </button>
        <div className="ghost-topbar-center">
          <span className={"admin-badge status-" + (form.status === "published" ? "closed" : "new")}>
            {form.status === "published" ? "Published" : "Draft"}
          </span>
          <div className="ghost-lang-toggle">
            <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")} type="button">EN</button>
            <button className={lang === "hy" ? "active" : ""} onClick={() => setLang("hy")} type="button">HY</button>
          </div>
        </div>
        <div className="ghost-topbar-actions">
          <button className="admin-btn" onClick={() => setSettingsOpen(true)} type="button" aria-label="Post settings">
            <GearIcon size={16} />
          </button>
          {!isNew && (
            <button className="admin-btn" onClick={onSaveDraft} disabled={saving} type="button">
              {saving ? "Saving…" : "Save"}
            </button>
          )}
          {form.status === "published" ? (
            <>
              <button className="admin-btn" onClick={onRevertToDraft} disabled={saving} type="button">Revert to draft</button>
              <button className="admin-btn admin-btn-primary" onClick={onUpdate} disabled={saving} type="button">
                {saving ? "Updating…" : "Update"}
              </button>
            </>
          ) : (
            <button className="admin-btn admin-btn-primary" onClick={() => setPublishOpen(true)} disabled={saving} type="button">
              Publish
            </button>
          )}
        </div>
      </header>

      {error && <div className="admin-error-banner" style={{ margin: "0 32px" }}>{error}</div>}

      <div className="ghost-editor-body">
        <input
          ref={titleRef}
          className="ghost-title-input"
          placeholder="Post title"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
        />
        <textarea
          className="ghost-content-input"
          placeholder="Begin writing your post…"
          value={content}
          onChange={e => updateField(contentField, e.target.value)}
        />
        <div className="ghost-content-hint">Separate paragraphs with a blank line.</div>
      </div>

      {settingsOpen && (
        <div className="ghost-settings-backdrop" onClick={e => { if (e.target === e.currentTarget) setSettingsOpen(false); }}>
          <aside className="ghost-settings-panel">
            <div className="ghost-settings-head">
              <h2>Post settings</h2>
              <button className="admin-modal-close" onClick={() => setSettingsOpen(false)} type="button"><CloseIcon size={16} /></button>
            </div>
            <div className="ghost-settings-body">
              <label className="quote-field">
                <span>Feature image</span>
                <ImageDropzone value={form.cover_url} onChange={img => updateField("cover_url", img)} />
              </label>

              <label className="quote-field">
                <span>URL</span>
                {isNew ? (
                  <input
                    value={form.slug}
                    onChange={e => { setSlugTouched(true); updateField("slug", slugify(e.target.value)); }}
                    pattern="[a-z0-9\-]+" required placeholder="post-url-slug"
                  />
                ) : (
                  <div className="ghost-slug-display">/blog/{form.slug}</div>
                )}
              </label>

              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Excerpt (EN)</span>
                  <textarea rows={2} value={form.excerpt} onChange={e => updateField("excerpt", e.target.value)} />
                </label>
                <label className="quote-field">
                  <span>Excerpt (HY)</span>
                  <textarea rows={2} value={form.excerpt_hy} onChange={e => updateField("excerpt_hy", e.target.value)} />
                </label>
              </div>

              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Category (EN)</span>
                  <input value={form.category} onChange={e => updateField("category", e.target.value)} required />
                </label>
                <label className="quote-field">
                  <span>Category (HY)</span>
                  <input value={form.category_hy} onChange={e => updateField("category_hy", e.target.value)} />
                </label>
              </div>

              <label className="quote-field">
                <span>Tags</span>
                <div className="ghost-tags-input">
                  {form.tags.map(t => (
                    <span key={t} className="ghost-tag-pill">
                      {t}
                      <button type="button" onClick={() => removeTag(t)} aria-label={`Remove ${t}`}>×</button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
                      else if (e.key === "Backspace" && !tagInput && form.tags.length) removeTag(form.tags[form.tags.length - 1]);
                    }}
                    onBlur={addTag}
                    placeholder={form.tags.length ? "" : "Add a tag…"}
                  />
                </div>
              </label>

              <label className="quote-field">
                <span>Published date</span>
                <input type="datetime-local" value={form.published_at} onChange={e => updateField("published_at", e.target.value)} />
              </label>

              {!isNew && (
                <button type="button" className="admin-btn admin-btn-danger" onClick={onDelete}>Delete post</button>
              )}
            </div>
          </aside>
        </div>
      )}

      {publishOpen && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setPublishOpen(false); }}>
          <div className="admin-modal ghost-publish-modal">
            <div className="admin-modal-head">
              <h2>Ready, set, publish!</h2>
              <button type="button" className="admin-modal-close" onClick={() => setPublishOpen(false)}><CloseIcon size={16} /></button>
            </div>
            <div className="admin-modal-body">
              <p className="ghost-publish-summary">
                <strong>{form.title || "Untitled post"}</strong> will be published to the site.
              </p>
              <label className="quote-field">
                <span>Published date</span>
                <input type="datetime-local" value={form.published_at} onChange={e => updateField("published_at", e.target.value)} />
              </label>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-btn" onClick={() => setPublishOpen(false)}>Cancel</button>
              <button type="button" className="admin-btn admin-btn-primary" onClick={onConfirmPublish} disabled={saving}>
                {saving ? "Publishing…" : "Publish now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
