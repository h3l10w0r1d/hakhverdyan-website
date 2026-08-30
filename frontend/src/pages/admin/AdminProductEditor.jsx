import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminListCategories, adminCreateCategory,
} from "../../lib/adminApi";
import Select from "../../components/admin/Select";
import MultiImageDropzone from "../../components/admin/MultiImageDropzone";
import slugify from "../../lib/slugify";

const ICONS = [
  "aluminum", "aluminum-angle", "pvc", "pvc-chamber", "handle", "lock",
  "layers", "sheen", "polycarbonate", "door-split", "door-flush",
  "gate", "gate-insulated", "facade-grid", "facade-frameless", "box",
];
const ICON_OPTIONS = ICONS.map(i => ({ value: i, label: i }));

const EMPTY = {
  id: "", name: "", name_hy: "", category: "", spec: "", spec_hy: "",
  description: "", description_hy: "", price: "", old_price: "", unit: "/ m",
  badge: "In stock", badge_hy: "", is_promo: false, icon: "box", images: [],
};

export default function AdminProductEditor() {
  const { id: editId } = useParams();
  const navigate = useNavigate();
  const isNew = !editId;

  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newCategoryForm, setNewCategoryForm] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.label }));

  function loadCategories() {
    return adminListCategories().then(setCategories).catch(() => {});
  }

  useEffect(() => { loadCategories(); }, []);

  useEffect(() => {
    if (isNew) {
      setForm({ ...EMPTY });
      return;
    }
    setLoading(true);
    adminListProducts()
      .then(products => {
        const p = products.find(x => x.id === editId);
        if (!p) { setError("Product not found."); return; }
        setForm({
          id: p.id, name: p.name, name_hy: p.name_hy || "", category: p.category,
          spec: p.spec, spec_hy: p.spec_hy || "",
          description: p.description || "", description_hy: p.description_hy || "",
          price: p.price, old_price: p.old_price ?? "",
          unit: p.unit, badge: p.badge, badge_hy: p.badge_hy || "", is_promo: p.is_promo, icon: p.icon,
          images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
        });
      })
      .catch(() => setError("Couldn't load product."))
      .finally(() => setLoading(false));
  }, [editId, isNew]);

  // Once categories arrive, default a brand-new form to the first one.
  useEffect(() => {
    if (isNew && form && !form.category && categories.length) {
      updateField("category", categories[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, isNew]);

  function updateField(field, value) {
    setForm(f => ({ ...f, [field]: typeof value === "function" ? value(f[field]) : value }));
  }

  async function onCreateCategory(e) {
    e.preventDefault();
    setSavingCategory(true);
    setCategoryError("");
    try {
      const created = await adminCreateCategory(newCategoryForm);
      await loadCategories();
      updateField("category", created.id);
      setNewCategoryForm(null);
    } catch (err) {
      setCategoryError(err.message || "Couldn't create category.");
    } finally {
      setSavingCategory(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        old_price: form.old_price === "" ? null : Number(form.old_price),
        name_hy: form.name_hy || null,
        spec_hy: form.spec_hy || null,
        description: form.description || null,
        description_hy: form.description_hy || null,
        badge_hy: form.badge_hy || null,
      };
      if (isNew) {
        await adminCreateProduct(payload);
      } else {
        const { id, ...rest } = payload;
        await adminUpdateProduct(editId, rest);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err.message || "Couldn't save product.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!window.confirm(`Delete "${form.name}"? This can't be undone.`)) return;
    try {
      await adminDeleteProduct(editId);
      navigate("/admin/products");
    } catch (err) {
      setError(err.message || "Couldn't delete product.");
    }
  }

  if (loading || !form) {
    return <div className="admin-empty">Loading…</div>;
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <button type="button" className="ghost-back admin-editor-back" onClick={() => navigate("/admin/products")}>
            ← Products
          </button>
          <h1 className="admin-page-title" style={{ marginTop: 6 }}>{isNew ? "New product" : "Edit product"}</h1>
        </div>
        <div className="admin-editor-actions">
          <button type="button" className="admin-btn" onClick={() => navigate("/admin/products")}>Cancel</button>
          <button type="submit" form="product-form" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? "Saving…" : isNew ? "Create product" : "Save changes"}
          </button>
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <form id="product-form" onSubmit={onSubmit} className="admin-editor-grid">
        <div className="admin-editor-main">
          <div className="admin-card admin-settings-card">
            <h2 className="admin-card-title">Basic info</h2>
            <div className="admin-settings-form">
              {isNew && (
                <label className="quote-field">
                  <span>ID (URL slug, unique — can't be changed later)</span>
                  <input value={form.id} onChange={e => updateField("id", slugify(e.target.value))} required pattern="[a-z0-9\-]+" placeholder="alu-t40" />
                </label>
              )}
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Name (EN)</span>
                  <input value={form.name} onChange={e => updateField("name", e.target.value)} required />
                </label>
                <label className="quote-field">
                  <span>Name (HY)</span>
                  <input value={form.name_hy} onChange={e => updateField("name_hy", e.target.value)} />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Short tagline (EN)</span>
                  <input value={form.spec} onChange={e => updateField("spec", e.target.value)} required />
                  <div className="quote-field-hint">One line, shown under the name on product cards — e.g. "T-shaped, mill finish".</div>
                </label>
                <label className="quote-field">
                  <span>Short tagline (HY)</span>
                  <input value={form.spec_hy} onChange={e => updateField("spec_hy", e.target.value)} />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Description (EN)</span>
                  <textarea rows={5} value={form.description} onChange={e => updateField("description", e.target.value)} placeholder="Longer details shown when a customer opens the product — separate paragraphs with a blank line." />
                </label>
                <label className="quote-field">
                  <span>Description (HY)</span>
                  <textarea rows={5} value={form.description_hy} onChange={e => updateField("description_hy", e.target.value)} />
                </label>
              </div>
              <label className="quote-field">
                <span>
                  Category
                  <button type="button" className="quote-field-inline-action" onClick={() => setNewCategoryForm({ id: "", label: "", label_hy: "" })}>
                    + New
                  </button>
                </span>
                <Select value={form.category} onChange={v => updateField("category", v)} options={categoryOptions} placeholder="Select a category" />
              </label>
            </div>
          </div>

          <div className="admin-card admin-settings-card">
            <h2 className="admin-card-title">Photos</h2>
            <MultiImageDropzone value={form.images} onChange={imgs => updateField("images", imgs)} />
          </div>
        </div>

        <div className="admin-editor-side">
          <div className="admin-card admin-settings-card">
            <h2 className="admin-card-title">Pricing</h2>
            <div className="admin-settings-form">
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Price (֏)</span>
                  <input type="number" min="0" value={form.price} onChange={e => updateField("price", e.target.value)} required />
                </label>
                <label className="quote-field">
                  <span>Old price (optional)</span>
                  <input type="number" min="0" value={form.old_price} onChange={e => updateField("old_price", e.target.value)} />
                  <div className="quote-field-hint">Set this to show a strikethrough discount price.</div>
                </label>
              </div>
              <label className="quote-field">
                <span>Unit</span>
                <input value={form.unit} onChange={e => updateField("unit", e.target.value)} required placeholder="/ m" />
              </label>
            </div>
          </div>

          <div className="admin-card admin-settings-card">
            <h2 className="admin-card-title">Availability</h2>
            <div className="admin-settings-form">
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Badge (EN)</span>
                  <input value={form.badge} onChange={e => updateField("badge", e.target.value)} placeholder="In stock" />
                </label>
                <label className="quote-field">
                  <span>Badge (HY)</span>
                  <input value={form.badge_hy} onChange={e => updateField("badge_hy", e.target.value)} />
                </label>
              </div>
              <label className="quote-field">
                <span>Fallback icon</span>
                <Select value={form.icon} onChange={v => updateField("icon", v)} options={ICON_OPTIONS} />
                <div className="quote-field-hint">Used as a placeholder image when no photo is uploaded.</div>
              </label>
              <label className="admin-checkbox-field">
                <input type="checkbox" checked={form.is_promo} onChange={e => updateField("is_promo", e.target.checked)} />
                <span>Featured as promo</span>
              </label>
            </div>
          </div>

          {!isNew && (
            <div className="admin-card admin-settings-card">
              <h2 className="admin-card-title">Danger zone</h2>
              <p className="admin-danger-hint">Deleting a product removes it from the site immediately. This can't be undone.</p>
              <button type="button" className="admin-btn admin-btn-danger" onClick={onDelete}>Delete product</button>
            </div>
          )}
        </div>
      </form>

      {newCategoryForm && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setNewCategoryForm(null); }}>
          <form className="admin-modal admin-modal-sm" onSubmit={onCreateCategory}>
            <div className="admin-modal-head">
              <h2>New category</h2>
              <button type="button" className="admin-modal-close" onClick={() => setNewCategoryForm(null)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              {categoryError && <div className="admin-error-banner">{categoryError}</div>}
              <label className="quote-field">
                <span>Label (EN)</span>
                <input
                  value={newCategoryForm.label} required autoFocus
                  onChange={e => setNewCategoryForm(f => ({
                    ...f, label: e.target.value, id: f.id === slugify(f.label) ? slugify(e.target.value) : f.id,
                  }))}
                />
              </label>
              <label className="quote-field">
                <span>Label (HY)</span>
                <input
                  value={newCategoryForm.label_hy}
                  onChange={e => setNewCategoryForm(f => ({ ...f, label_hy: e.target.value }))}
                />
              </label>
              <label className="quote-field">
                <span>ID (slug, unique)</span>
                <input
                  value={newCategoryForm.id} required pattern="[a-z0-9\-]+" placeholder="glass-panels"
                  onChange={e => setNewCategoryForm(f => ({ ...f, id: slugify(e.target.value) }))}
                />
              </label>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-btn" onClick={() => setNewCategoryForm(null)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={savingCategory}>
                {savingCategory ? "Creating…" : "Create category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
