import { useEffect, useState } from "react";
import {
  adminGetSettings, adminUpdateSettings,
  adminListLocations, adminCreateLocation, adminUpdateLocation, adminDeleteLocation, adminReorderLocations,
  adminListCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory, adminReorderCategories,
} from "../../lib/adminApi";
import DragHandleIcon from "../../components/admin/DragHandleIcon";
import useDragReorder from "../../lib/useDragReorder";

const EMPTY_LOCATION = { name: "", name_hy: "", address: "", address_hy: "", lat: "", lng: "" };
const EMPTY_CATEGORY = { id: "", label: "", label_hy: "" };

function SiteSettingsForm() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    adminGetSettings().then(setSettings).finally(() => setLoading(false));
  }, []);

  function updateField(field, value) {
    setSettings(s => ({ ...s, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const updated = await adminUpdateSettings(settings);
      setSettings(updated);
      setStatus({ type: "success", text: "Settings saved." });
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Couldn't save settings." });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) return <div className="admin-empty">Loading…</div>;

  return (
    <form onSubmit={onSubmit} className="admin-settings-form">
      <div className="admin-form-row">
        <label className="quote-field">
          <span>Phone</span>
          <input value={settings.phone} onChange={e => updateField("phone", e.target.value)} required />
        </label>
        <label className="quote-field">
          <span>WhatsApp</span>
          <input value={settings.whatsapp} onChange={e => updateField("whatsapp", e.target.value)} required />
        </label>
        <label className="quote-field">
          <span>Email (optional)</span>
          <input type="email" value={settings.email || ""} onChange={e => updateField("email", e.target.value || null)} />
        </label>
      </div>
      <div className="admin-form-row">
        <label className="quote-field">
          <span>Facebook URL</span>
          <input value={settings.facebook_url || ""} onChange={e => updateField("facebook_url", e.target.value || null)} placeholder="https://facebook.com/..." />
        </label>
        <label className="quote-field">
          <span>Instagram URL</span>
          <input value={settings.instagram_url || ""} onChange={e => updateField("instagram_url", e.target.value || null)} placeholder="https://instagram.com/..." />
        </label>
        <label className="quote-field">
          <span>TikTok URL</span>
          <input value={settings.tiktok_url || ""} onChange={e => updateField("tiktok_url", e.target.value || null)} placeholder="https://tiktok.com/@..." />
        </label>
      </div>
      <div className="admin-form-row">
        <label className="quote-field">
          <span>Weekday hours (EN)</span>
          <input value={settings.hours_weekday} onChange={e => updateField("hours_weekday", e.target.value)} required />
        </label>
        <label className="quote-field">
          <span>Weekday hours (HY)</span>
          <input value={settings.hours_weekday_hy || ""} onChange={e => updateField("hours_weekday_hy", e.target.value || null)} />
        </label>
      </div>
      <div className="admin-form-row">
        <label className="quote-field">
          <span>Saturday hours (EN)</span>
          <input value={settings.hours_saturday} onChange={e => updateField("hours_saturday", e.target.value)} required />
        </label>
        <label className="quote-field">
          <span>Saturday hours (HY)</span>
          <input value={settings.hours_saturday_hy || ""} onChange={e => updateField("hours_saturday_hy", e.target.value || null)} />
        </label>
      </div>
      {status && <div className={"form-status " + status.type}>{status.text}</div>}
      <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}

function LocationsSection() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminListLocations().then(setLocations).catch(() => setError("Couldn't load locations.")).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function persistOrder(next) {
    setLocations(next);
    try {
      await adminReorderLocations(next.map(l => l.id));
    } catch {
      setError("Couldn't save the new order — reloading.");
      load();
    }
  }

  const { dragIndex, overIndex, onDragStart, onDragOver, onDrop, onDragEnd } = useDragReorder(locations, persistOrder);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_LOCATION });
  }

  function openEdit(l) {
    setEditingId(l.id);
    setForm({
      name: l.name, name_hy: l.name_hy || "", address: l.address, address_hy: l.address_hy || "",
      lat: l.lat ?? "", lng: l.lng ?? "",
    });
  }

  function closeForm() {
    setForm(null);
    setEditingId(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form, name_hy: form.name_hy || null, address_hy: form.address_hy || null,
        lat: form.lat === "" ? null : Number(form.lat),
        lng: form.lng === "" ? null : Number(form.lng),
      };
      if (editingId) await adminUpdateLocation(editingId, payload);
      else await adminCreateLocation(payload);
      closeForm();
      load();
    } catch (err) {
      setError(err.message || "Couldn't save location.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(l) {
    if (!window.confirm(`Remove location "${l.name}"? This can't be undone.`)) return;
    try {
      await adminDeleteLocation(l.id);
      load();
    } catch (err) {
      setError(err.message || "Couldn't remove location.");
    }
  }

  return (
    <>
      <div className="admin-card-head-row">
        <h2 className="admin-card-title">Locations</h2>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>+ New location</button>
      </div>
      {error && <div className="admin-error-banner" style={{ margin: "0 20px 16px" }}>{error}</div>}
      {loading ? (
        <div className="admin-empty">Loading…</div>
      ) : locations.length === 0 ? (
        <div className="admin-empty">No locations yet.</div>
      ) : (
        <table className="admin-table admin-table-reorderable">
          <thead>
            <tr><th></th><th>Name</th><th>Address</th><th></th></tr>
          </thead>
          <tbody>
            {locations.map((l, i) => (
              <tr
                key={l.id}
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
                <td className="admin-table-title">{l.name}</td>
                <td className="admin-table-sub">{l.address}</td>
                <td className="admin-table-actions">
                  <button type="button" className="admin-btn admin-btn-sm" onClick={() => openEdit(l)}>Edit</button>
                  <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => onDelete(l)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {form && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) closeForm(); }}>
          <form className="admin-modal" onSubmit={onSubmit}>
            <div className="admin-modal-head">
              <h2>{editingId ? "Edit location" : "New location"}</h2>
              <button type="button" className="admin-modal-close" onClick={closeForm}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Name (EN)</span>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </label>
                <label className="quote-field">
                  <span>Name (HY)</span>
                  <input value={form.name_hy} onChange={e => setForm(f => ({ ...f, name_hy: e.target.value }))} />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Address (EN)</span>
                  <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
                </label>
                <label className="quote-field">
                  <span>Address (HY)</span>
                  <input value={form.address_hy} onChange={e => setForm(f => ({ ...f, address_hy: e.target.value }))} />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Latitude</span>
                  <input
                    type="number" step="any" placeholder="e.g. 40.210984"
                    value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                  />
                </label>
                <label className="quote-field">
                  <span>Longitude</span>
                  <input
                    type="number" step="any" placeholder="e.g. 44.512744"
                    value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                  />
                </label>
              </div>
              <p className="quote-field-hint">
                Look up the address on <a href="https://yandex.com/maps/" target="_blank" rel="noopener noreferrer">Yandex Maps</a> and copy the coordinates shown in the sidebar. Leave blank to show a placeholder instead of a map.
              </p>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-btn" onClick={closeForm}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save location"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminListCategories().then(setCategories).catch(() => setError("Couldn't load categories.")).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function persistOrder(next) {
    setCategories(next);
    try {
      await adminReorderCategories(next.map(c => c.id));
    } catch {
      setError("Couldn't save the new order — reloading.");
      load();
    }
  }

  const { dragIndex, overIndex, onDragStart, onDragOver, onDrop, onDragEnd } = useDragReorder(categories, persistOrder);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_CATEGORY });
  }

  function openEdit(c) {
    setEditingId(c.id);
    setForm({ id: c.id, label: c.label, label_hy: c.label_hy || "" });
  }

  function closeForm() {
    setForm(null);
    setEditingId(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { label: form.label, label_hy: form.label_hy || null };
      if (editingId) await adminUpdateCategory(editingId, payload);
      else await adminCreateCategory({ ...payload, id: form.id });
      closeForm();
      load();
    } catch (err) {
      setError(err.message || "Couldn't save category.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(c) {
    if (!window.confirm(`Remove category "${c.label}"? This can't be undone.`)) return;
    try {
      await adminDeleteCategory(c.id);
      load();
    } catch (err) {
      setError(err.message || "Couldn't remove category.");
    }
  }

  return (
    <>
      <div className="admin-card-head-row">
        <h2 className="admin-card-title">Product categories</h2>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>+ New category</button>
      </div>
      {error && <div className="admin-error-banner" style={{ margin: "0 20px 16px" }}>{error}</div>}
      {loading ? (
        <div className="admin-empty">Loading…</div>
      ) : categories.length === 0 ? (
        <div className="admin-empty">No categories yet.</div>
      ) : (
        <table className="admin-table admin-table-reorderable">
          <thead>
            <tr><th></th><th>Label</th><th>ID</th><th></th></tr>
          </thead>
          <tbody>
            {categories.map((c, i) => (
              <tr
                key={c.id}
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
                <td className="admin-table-title">{c.label}</td>
                <td className="admin-table-sub">{c.id}</td>
                <td className="admin-table-actions">
                  <button type="button" className="admin-btn admin-btn-sm" onClick={() => openEdit(c)}>Edit</button>
                  <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => onDelete(c)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {form && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) closeForm(); }}>
          <form className="admin-modal" onSubmit={onSubmit}>
            <div className="admin-modal-head">
              <h2>{editingId ? "Edit category" : "New category"}</h2>
              <button type="button" className="admin-modal-close" onClick={closeForm}>&times;</button>
            </div>
            <div className="admin-modal-body">
              {!editingId && (
                <label className="quote-field">
                  <span>ID (slug, unique)</span>
                  <input value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} required pattern="[a-z0-9\-]+" placeholder="glass-panels" />
                </label>
              )}
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>Label (EN)</span>
                  <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required />
                </label>
                <label className="quote-field">
                  <span>Label (HY)</span>
                  <input value={form.label_hy} onChange={e => setForm(f => ({ ...f, label_hy: e.target.value }))} />
                </label>
              </div>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-btn" onClick={closeForm}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save category"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default function AdminSettings() {
  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Settings</h1>
      </div>

      <div className="admin-card admin-settings-card">
        <h2 className="admin-card-title">Contact & social</h2>
        <SiteSettingsForm />
      </div>

      <div className="admin-card">
        <LocationsSection />
      </div>

      <div className="admin-card">
        <CategoriesSection />
      </div>
    </div>
  );
}
