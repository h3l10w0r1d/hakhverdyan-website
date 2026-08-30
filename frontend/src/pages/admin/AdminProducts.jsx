import { useEffect, useState } from "react";
import {
  adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminReorderProducts,
  adminListCategories, adminCreateCategory,
} from "../../lib/adminApi";
import Select from "../../components/admin/Select";
import MultiImageDropzone from "../../components/admin/MultiImageDropzone";
import DragHandleIcon from "../../components/admin/DragHandleIcon";
import useDragReorder from "../../lib/useDragReorder";
import { productPhoto } from "../../lib/productPhotos";
import slugify from "../../lib/slugify";

const ICONS = [
  "aluminum", "aluminum-angle", "pvc", "pvc-chamber", "handle", "lock",
  "layers", "sheen", "polycarbonate", "door-split", "door-flush",
  "gate", "gate-insulated", "facade-grid", "facade-frameless", "box",
];
const ICON_OPTIONS = ICONS.map(i => ({ value: i, label: i }));

const EMPTY = {
  id: "", name: "", name_hy: "", category: "", spec: "", spec_hy: "",
  price: "", old_price: "", unit: "/ m", badge: "In stock", badge_hy: "", is_promo: false, icon: "box", images: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(null); // null = closed, EMPTY-shaped object = open
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.label }));
  const categoryLabel = id => categories.find(c => c.id === id)?.label || id;

  function load() {
    setLoading(true);
    adminListProducts().then(setProducts).catch(() => setError("Couldn't load products.")).finally(() => setLoading(false));
  }

  function loadCategories() {
    return adminListCategories().then(setCategories).catch(() => {});
  }

  useEffect(load, []);
  useEffect(() => { loadCategories(); }, []);

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

  const q = search.trim().toLowerCase();
  const filtered = q
    ? products.filter(p =>
        p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || categoryLabel(p.category).toLowerCase().includes(q)
      )
    : products;
  const isFiltered = q.length > 0;

  async function persistOrder(nextProducts) {
    setProducts(nextProducts);
    try {
      await adminReorderProducts(nextProducts.map(p => p.id));
    } catch {
      setError("Couldn't save the new order — reloading.");
      load();
    }
  }

  const { dragIndex, overIndex, onDragStart, onDragOver, onDrop, onDragEnd } = useDragReorder(products, persistOrder);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY, category: categories[0]?.id || "" });
  }

  function openEdit(p) {
    setEditingId(p.id);
    setForm({
      id: p.id, name: p.name, name_hy: p.name_hy || "", category: p.category,
      spec: p.spec, spec_hy: p.spec_hy || "", price: p.price, old_price: p.old_price ?? "",
      unit: p.unit, badge: p.badge, badge_hy: p.badge_hy || "", is_promo: p.is_promo, icon: p.icon,
      images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
    });
  }

  function closeForm() {
    setForm(null);
    setEditingId(null);
  }

  function updateField(field, value) {
    setForm(f => ({ ...f, [field]: typeof value === "function" ? value(f[field]) : value }));
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
        badge_hy: form.badge_hy || null,
      };
      if (editingId) {
        const { id, ...rest } = payload;
        await adminUpdateProduct(editingId, rest);
      } else {
        await adminCreateProduct(payload);
      }
      closeForm();
      load();
    } catch (err) {
      setError(err.message || "Couldn't save product.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!window.confirm(`Delete product "${id}"? This can't be undone.`)) return;
    try {
      await adminDeleteProduct(id);
      load();
    } catch (err) {
      setError(err.message || "Couldn't delete product.");
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Products</h1>
        <button className="admin-btn admin-btn-primary" onClick={openCreate}>+ New product</button>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-search-row">
        <input
          type="text" className="admin-search-input" placeholder="Search by name, ID, or category…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {isFiltered && <span className="admin-search-count">{filtered.length} of {products.length}</span>}
      </div>
      {isFiltered && <div className="admin-search-note">Reordering is disabled while a search is active.</div>}

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">{isFiltered ? "No products match your search." : "No products yet."}</div>
        ) : (
          <table className={"admin-table" + (isFiltered ? "" : " admin-table-reorderable")}>
            <thead>
              <tr>
                <th></th><th></th><th>Name</th><th>Category</th><th>Price</th><th>Badge</th><th>Promo</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  {...(isFiltered ? {} : {
                    draggable: true,
                    onDragStart: onDragStart(i),
                    onDragOver: onDragOver(i),
                    onDrop: onDrop,
                    onDragEnd: onDragEnd,
                  })}
                  className={
                    isFiltered ? "" :
                    (dragIndex === i ? "admin-row-dragging" : "") +
                    (overIndex === i && dragIndex !== i ? " admin-row-drop-target" : "")
                  }
                >
                  <td className="admin-drag-handle" title={isFiltered ? "" : "Drag to reorder"}>{!isFiltered && <DragHandleIcon />}</td>
                  <td><img className="admin-table-thumb" src={p.image || productPhoto(p.icon)} alt="" /></td>
                  <td>
                    <div className="admin-table-title">{p.name}</div>
                    <div className="admin-table-sub">{p.id}</div>
                  </td>
                  <td>{categoryLabel(p.category)}</td>
                  <td>{p.price.toLocaleString("en-US")}֏ {p.unit}</td>
                  <td>{p.badge}</td>
                  <td>{p.is_promo ? "Yes" : "—"}</td>
                  <td className="admin-table-actions">
                    <button className="admin-btn admin-btn-sm" onClick={() => openEdit(p)}>Edit</button>
                    <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => onDelete(p.id)}>Delete</button>
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
              <h2>{editingId ? "Edit product" : "New product"}</h2>
              <button type="button" className="admin-modal-close" onClick={closeForm}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <label className="quote-field">
                <span>Photos</span>
                <MultiImageDropzone value={form.images} onChange={imgs => updateField("images", imgs)} />
              </label>

              {!editingId && (
                <label className="quote-field">
                  <span>ID (slug, unique)</span>
                  <input value={form.id} onChange={e => updateField("id", e.target.value)} required pattern="[a-z0-9\-]+" placeholder="alu-t40" />
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
                  <span>Spec (EN)</span>
                  <input value={form.spec} onChange={e => updateField("spec", e.target.value)} required />
                </label>
                <label className="quote-field">
                  <span>Spec (HY)</span>
                  <input value={form.spec_hy} onChange={e => updateField("spec_hy", e.target.value)} />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>
                    Category
                    <button type="button" className="quote-field-inline-action" onClick={() => setNewCategoryForm({ id: "", label: "", label_hy: "" })}>
                      + New
                    </button>
                  </span>
                  <Select value={form.category} onChange={v => updateField("category", v)} options={categoryOptions} placeholder="Select a category" />
                </label>
                <label className="quote-field">
                  <span>Icon / photo group</span>
                  <Select value={form.icon} onChange={v => updateField("icon", v)} options={ICON_OPTIONS} />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Price (֏)</span>
                  <input type="number" min="0" value={form.price} onChange={e => updateField("price", e.target.value)} required />
                </label>
                <label className="quote-field">
                  <span>Old price (optional)</span>
                  <input type="number" min="0" value={form.old_price} onChange={e => updateField("old_price", e.target.value)} />
                </label>
                <label className="quote-field">
                  <span>Unit</span>
                  <input value={form.unit} onChange={e => updateField("unit", e.target.value)} required placeholder="/ m" />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Badge (EN)</span>
                  <input value={form.badge} onChange={e => updateField("badge", e.target.value)} />
                </label>
                <label className="quote-field">
                  <span>Badge (HY)</span>
                  <input value={form.badge_hy} onChange={e => updateField("badge_hy", e.target.value)} />
                </label>
              </div>
              <label className="admin-checkbox-field">
                <input type="checkbox" checked={form.is_promo} onChange={e => updateField("is_promo", e.target.checked)} />
                <span>Featured as promo</span>
              </label>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-btn" onClick={closeForm}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save product"}
              </button>
            </div>
          </form>
        </div>
      )}

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
