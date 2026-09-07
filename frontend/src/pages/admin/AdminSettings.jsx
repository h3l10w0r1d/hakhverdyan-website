import { useEffect, useState } from "react";
import {
  adminGetSettings, adminUpdateSettings,
  adminListLocations, adminCreateLocation, adminUpdateLocation, adminDeleteLocation, adminReorderLocations,
  adminListCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory, adminReorderCategories,
} from "../../lib/adminApi";
import DragHandleIcon from "../../components/admin/DragHandleIcon";
import useDragReorder from "../../lib/useDragReorder";
import { useAdminT } from "../../context/AdminI18nContext";

const EMPTY_LOCATION = { name: "", name_hy: "", address: "", address_hy: "", lat: "", lng: "" };
const EMPTY_CATEGORY = { id: "", label: "", label_hy: "" };

function SiteSettingsForm() {
  const { t } = useAdminT();
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
      setStatus({ type: "success", text: t("settings.contact.savedSuccess") });
    } catch (err) {
      setStatus({ type: "error", text: err.message || t("settings.contact.couldntSave") });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) return <div className="admin-empty">{t("common.loading")}</div>;

  return (
    <form onSubmit={onSubmit} className="admin-settings-form">
      <div className="admin-form-row">
        <label className="quote-field">
          <span>{t("settings.contact.phone")}</span>
          <input value={settings.phone} onChange={e => updateField("phone", e.target.value)} required />
        </label>
        <label className="quote-field">
          <span>{t("settings.contact.whatsapp")}</span>
          <input value={settings.whatsapp} onChange={e => updateField("whatsapp", e.target.value)} required />
        </label>
        <label className="quote-field">
          <span>{t("settings.contact.emailOptional")}</span>
          <input type="email" value={settings.email || ""} onChange={e => updateField("email", e.target.value || null)} />
        </label>
      </div>
      <div className="admin-form-row">
        <label className="quote-field">
          <span>{t("settings.contact.facebookUrl")}</span>
          <input value={settings.facebook_url || ""} onChange={e => updateField("facebook_url", e.target.value || null)} placeholder={t("settings.contact.facebookPlaceholder")} />
        </label>
        <label className="quote-field">
          <span>{t("settings.contact.instagramUrl")}</span>
          <input value={settings.instagram_url || ""} onChange={e => updateField("instagram_url", e.target.value || null)} placeholder={t("settings.contact.instagramPlaceholder")} />
        </label>
        <label className="quote-field">
          <span>{t("settings.contact.tiktokUrl")}</span>
          <input value={settings.tiktok_url || ""} onChange={e => updateField("tiktok_url", e.target.value || null)} placeholder={t("settings.contact.tiktokPlaceholder")} />
        </label>
      </div>
      <div className="admin-form-row">
        <label className="quote-field">
          <span>{t("settings.contact.hoursWeekdayEn")}</span>
          <input value={settings.hours_weekday} onChange={e => updateField("hours_weekday", e.target.value)} required />
        </label>
        <label className="quote-field">
          <span>{t("settings.contact.hoursWeekdayHy")}</span>
          <input value={settings.hours_weekday_hy || ""} onChange={e => updateField("hours_weekday_hy", e.target.value || null)} />
        </label>
      </div>
      <div className="admin-form-row">
        <label className="quote-field">
          <span>{t("settings.contact.hoursSaturdayEn")}</span>
          <input value={settings.hours_saturday} onChange={e => updateField("hours_saturday", e.target.value)} required />
        </label>
        <label className="quote-field">
          <span>{t("settings.contact.hoursSaturdayHy")}</span>
          <input value={settings.hours_saturday_hy || ""} onChange={e => updateField("hours_saturday_hy", e.target.value || null)} />
        </label>
      </div>
      {status && <div className={"form-status " + status.type}>{status.text}</div>}
      <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
        {saving ? t("common.saving") : t("settings.contact.saveSettings")}
      </button>
    </form>
  );
}

function LocationsSection() {
  const { t } = useAdminT();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminListLocations().then(setLocations).catch(() => setError(t("settings.locations.couldntLoad"))).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function persistOrder(next) {
    setLocations(next);
    try {
      await adminReorderLocations(next.map(l => l.id));
    } catch {
      setError(t("settings.locations.reorderError"));
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
      setError(err.message || t("settings.locations.couldntSave"));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(l) {
    if (!window.confirm(t("settings.locations.removeConfirm", { name: l.name }))) return;
    try {
      await adminDeleteLocation(l.id);
      load();
    } catch (err) {
      setError(err.message || t("settings.locations.couldntRemove"));
    }
  }

  return (
    <>
      <div className="admin-card-head-row">
        <h2 className="admin-card-title">{t("settings.locations.title")}</h2>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>{t("settings.locations.newLocation")}</button>
      </div>
      {error && <div className="admin-error-banner" style={{ margin: "0 20px 16px" }}>{error}</div>}
      {loading ? (
        <div className="admin-empty">{t("common.loading")}</div>
      ) : locations.length === 0 ? (
        <div className="admin-empty">{t("settings.locations.noneYet")}</div>
      ) : (
        <table className="admin-table admin-table-reorderable">
          <thead>
            <tr><th></th><th>{t("settings.locations.colName")}</th><th>{t("settings.locations.colAddress")}</th><th></th></tr>
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
                <td className="admin-drag-handle" title={t("settings.locations.dragToReorder")}><DragHandleIcon /></td>
                <td className="admin-table-title">{l.name}</td>
                <td className="admin-table-sub">{l.address}</td>
                <td className="admin-table-actions">
                  <button type="button" className="admin-btn admin-btn-sm" onClick={() => openEdit(l)}>{t("common.edit")}</button>
                  <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => onDelete(l)}>{t("common.delete")}</button>
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
              <h2>{editingId ? t("settings.locations.editTitle") : t("settings.locations.newTitle")}</h2>
              <button type="button" className="admin-modal-close" onClick={closeForm}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>{t("settings.locations.nameEn")}</span>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </label>
                <label className="quote-field">
                  <span>{t("settings.locations.nameHy")}</span>
                  <input value={form.name_hy} onChange={e => setForm(f => ({ ...f, name_hy: e.target.value }))} />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>{t("settings.locations.addressEn")}</span>
                  <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
                </label>
                <label className="quote-field">
                  <span>{t("settings.locations.addressHy")}</span>
                  <input value={form.address_hy} onChange={e => setForm(f => ({ ...f, address_hy: e.target.value }))} />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>{t("settings.locations.latitude")}</span>
                  <input
                    type="number" step="any" placeholder={t("settings.locations.latPlaceholder")}
                    value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                  />
                </label>
                <label className="quote-field">
                  <span>{t("settings.locations.longitude")}</span>
                  <input
                    type="number" step="any" placeholder={t("settings.locations.lngPlaceholder")}
                    value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                  />
                </label>
              </div>
              <p className="quote-field-hint">
                {t("settings.locations.mapHintPrefix")} <a href="https://yandex.com/maps/" target="_blank" rel="noopener noreferrer">Yandex Maps</a> {t("settings.locations.mapHintSuffix")}
              </p>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-btn" onClick={closeForm}>{t("common.cancel")}</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? t("common.saving") : t("settings.locations.saveLocation")}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function CategoriesSection() {
  const { t } = useAdminT();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    adminListCategories().then(setCategories).catch(() => setError(t("settings.categories.couldntLoad"))).finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function persistOrder(next) {
    setCategories(next);
    try {
      await adminReorderCategories(next.map(c => c.id));
    } catch {
      setError(t("settings.categories.reorderError"));
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
      setError(err.message || t("settings.categories.couldntSave"));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(c) {
    if (!window.confirm(t("settings.categories.removeConfirm", { label: c.label }))) return;
    try {
      await adminDeleteCategory(c.id);
      load();
    } catch (err) {
      setError(err.message || t("settings.categories.couldntRemove"));
    }
  }

  return (
    <>
      <div className="admin-card-head-row">
        <h2 className="admin-card-title">{t("settings.categories.title")}</h2>
        <button type="button" className="admin-btn admin-btn-primary" onClick={openCreate}>{t("settings.categories.newCategory")}</button>
      </div>
      {error && <div className="admin-error-banner" style={{ margin: "0 20px 16px" }}>{error}</div>}
      {loading ? (
        <div className="admin-empty">{t("common.loading")}</div>
      ) : categories.length === 0 ? (
        <div className="admin-empty">{t("settings.categories.noneYet")}</div>
      ) : (
        <table className="admin-table admin-table-reorderable">
          <thead>
            <tr><th></th><th>{t("settings.categories.colLabel")}</th><th>{t("settings.categories.colId")}</th><th></th></tr>
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
                <td className="admin-drag-handle" title={t("settings.locations.dragToReorder")}><DragHandleIcon /></td>
                <td className="admin-table-title">{c.label}</td>
                <td className="admin-table-sub">{c.id}</td>
                <td className="admin-table-actions">
                  <button type="button" className="admin-btn admin-btn-sm" onClick={() => openEdit(c)}>{t("common.edit")}</button>
                  <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => onDelete(c)}>{t("common.delete")}</button>
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
              <h2>{editingId ? t("settings.categories.editTitle") : t("settings.categories.newTitle")}</h2>
              <button type="button" className="admin-modal-close" onClick={closeForm}>&times;</button>
            </div>
            <div className="admin-modal-body">
              {!editingId && (
                <label className="quote-field">
                  <span>{t("settings.categories.idLabel")}</span>
                  <input value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value }))} required pattern="[a-z0-9\-]+" placeholder={t("settings.categories.idPlaceholder")} />
                </label>
              )}
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>{t("settings.categories.labelEn")}</span>
                  <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required />
                </label>
                <label className="quote-field">
                  <span>{t("settings.categories.labelHy")}</span>
                  <input value={form.label_hy} onChange={e => setForm(f => ({ ...f, label_hy: e.target.value }))} />
                </label>
              </div>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-btn" onClick={closeForm}>{t("common.cancel")}</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? t("common.saving") : t("settings.categories.saveCategory")}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default function AdminSettings() {
  const { t } = useAdminT();
  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t("settings.pageTitle")}</h1>
      </div>

      <div className="admin-card admin-settings-card">
        <h2 className="admin-card-title">{t("settings.contact.title")}</h2>
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
