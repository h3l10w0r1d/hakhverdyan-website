import { useEffect, useState } from "react";
import {
  adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminReorderProducts,
} from "../../lib/adminApi";
import Select from "../../components/admin/Select";
import MultiImageDropzone from "../../components/admin/MultiImageDropzone";
import DragHandleIcon from "../../components/admin/DragHandleIcon";
import useDragReorder from "../../lib/useDragReorder";
import { productPhoto } from "../../lib/productPhotos";

const CATEGORIES = ["profiles", "hardware", "sheets", "doors", "facades"];
const ICONS = [
  "aluminum", "aluminum-angle", "pvc", "pvc-chamber", "handle", "lock",
  "layers", "sheen", "polycarbonate", "door-split", "door-flush",
  "gate", "gate-insulated", "facade-grid", "facade-frameless", "box",
];
const CATEGORY_OPTIONS = CATEGORIES.map(c => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }));
const ICON_OPTIONS = ICONS.map(i => ({ value: i, label: i }));

const EMPTY = {
  id: "", name: "", name_hy: "", category: "profiles", spec: "", spec_hy: "",
  price: "", old_price: "", unit: "/ m", badge: "In stock", badge_hy: "", is_promo: false, icon: "box", images: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null); // null = closed, EMPTY-shaped object = open
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminListProducts().then(setProducts).catch(() => setError("Couldn't load products.")).finally(() => setLoading(false));
  }

  useEffect(load, []);

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
    setForm({ ...EMPTY });
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
    setForm(f => ({ ...f, [field]: value }));
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

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : products.length === 0 ? (
          <div className="admin-empty">No products yet.</div>
        ) : (
          <table className="admin-table admin-table-reorderable">
            <thead>
              <tr>
                <th></th><th></th><th>Name</th><th>Category</th><th>Price</th><th>Badge</th><th>Promo</th><th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr
                  key={p.id}
                  draggable
                  onDragStart={onDragStart(i)}
                  onDragOver={onDragOver(i)}
                  onDrop={onDrop}
                  onDragEnd={onDragEnd}
                  className={
                    (dragIndex === i ? "admin-row-dragging" : "") +
                    (overIndex === i && dragIndex !== i ? " admin-row-drop-target" : "")
                  }
                >
                  <td className="admin-drag-handle" title="Drag to reorder"><DragHandleIcon /></td>
                  <td><img className="admin-table-thumb" src={p.image || productPhoto(p.icon)} alt="" /></td>
                  <td>
                    <div className="admin-table-title">{p.name}</div>
                    <div className="admin-table-sub">{p.id}</div>
                  </td>
                  <td>{p.category}</td>
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
                  <span>Category</span>
                  <Select value={form.category} onChange={v => updateField("category", v)} options={CATEGORY_OPTIONS} />
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
    </div>
  );
}
