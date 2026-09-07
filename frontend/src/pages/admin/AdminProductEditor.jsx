import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminListCategories, adminCreateCategory,
} from "../../lib/adminApi";
import Select from "../../components/admin/Select";
import MultiImageDropzone from "../../components/admin/MultiImageDropzone";
import slugify from "../../lib/slugify";
import { useAdminT } from "../../context/AdminI18nContext";

const ICONS = [
  "aluminum", "aluminum-angle", "pvc", "pvc-chamber", "handle", "lock",
  "layers", "sheen", "polycarbonate", "door-split", "door-flush",
  "gate", "gate-insulated", "facade-grid", "facade-frameless", "box",
];
const ICON_OPTIONS = ICONS.map(i => ({ value: i, label: i }));

const EMPTY = {
  id: "", name: "", name_hy: "", category: "", spec: "", spec_hy: "",
  description: "", description_hy: "", price: "", old_price: "", unit: "/ m",
  badge: "In stock", badge_hy: "", is_promo: false, icon: "box", images: [], stock_qty: null,
  seo_title: "", seo_title_hy: "", seo_title_ru: "",
  seo_description: "", seo_description_hy: "", seo_description_ru: "",
};

export default function AdminProductEditor() {
  const { t } = useAdminT();
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
        if (!p) { setError(t("productEditor.notFound")); return; }
        setForm({
          id: p.id, name: p.name, name_hy: p.name_hy || "", category: p.category,
          spec: p.spec, spec_hy: p.spec_hy || "",
          description: p.description || "", description_hy: p.description_hy || "",
          price: p.price, old_price: p.old_price ?? "",
          unit: p.unit, badge: p.badge, badge_hy: p.badge_hy || "", is_promo: p.is_promo, icon: p.icon,
          images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
          stock_qty: p.stock_qty ?? null,
          seo_title: p.seo_title || "", seo_title_hy: p.seo_title_hy || "", seo_title_ru: p.seo_title_ru || "",
          seo_description: p.seo_description || "", seo_description_hy: p.seo_description_hy || "", seo_description_ru: p.seo_description_ru || "",
        });
      })
      .catch(() => setError(t("productEditor.couldntLoad")))
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
      setCategoryError(err.message || t("productEditor.couldntCreateCategory"));
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
        stock_qty: form.stock_qty === null || form.stock_qty === "" ? null : Number(form.stock_qty),
        seo_title: form.seo_title || null,
        seo_title_hy: form.seo_title_hy || null,
        seo_title_ru: form.seo_title_ru || null,
        seo_description: form.seo_description || null,
        seo_description_hy: form.seo_description_hy || null,
        seo_description_ru: form.seo_description_ru || null,
      };
      if (isNew) {
        await adminCreateProduct(payload);
      } else {
        const { id, ...rest } = payload;
        await adminUpdateProduct(editId, rest);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err.message || t("productEditor.couldntSave"));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!window.confirm(t("productEditor.deleteConfirm", { name: form.name }))) return;
    try {
      await adminDeleteProduct(editId);
      navigate("/admin/products");
    } catch (err) {
      setError(err.message || t("productEditor.couldntDelete"));
    }
  }

  if (loading || !form) {
    return <div className="admin-empty">{t("common.loading")}</div>;
  }

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <button type="button" className="ghost-back admin-editor-back" onClick={() => navigate("/admin/products")}>
            {t("productEditor.backToProducts")}
          </button>
          <h1 className="admin-page-title" style={{ marginTop: 6 }}>{isNew ? t("productEditor.newProductTitle") : t("productEditor.editProductTitle")}</h1>
        </div>
        <div className="admin-editor-actions">
          <button type="button" className="admin-btn" onClick={() => navigate("/admin/products")}>{t("common.cancel")}</button>
          <button type="submit" form="product-form" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? t("common.saving") : isNew ? t("productEditor.createProduct") : t("productEditor.saveChanges")}
          </button>
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <form id="product-form" onSubmit={onSubmit} className="admin-editor-grid">
        <div className="admin-editor-main">
          <div className="admin-card admin-settings-card">
            <h2 className="admin-card-title">{t("productEditor.basicInfo")}</h2>
            <div className="admin-settings-form">
              {isNew && (
                <label className="quote-field">
                  <span>{t("productEditor.idLabel")}</span>
                  <input value={form.id} onChange={e => updateField("id", slugify(e.target.value))} required pattern="[a-z0-9\-]+" placeholder="alu-t40" />
                </label>
              )}
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>{t("productEditor.nameEn")}</span>
                  <input value={form.name} onChange={e => updateField("name", e.target.value)} required />
                </label>
                <label className="quote-field">
                  <span>{t("productEditor.nameHy")}</span>
                  <input value={form.name_hy} onChange={e => updateField("name_hy", e.target.value)} />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>{t("productEditor.taglineEn")}</span>
                  <input value={form.spec} onChange={e => updateField("spec", e.target.value)} required />
                  <div className="quote-field-hint">{t("productEditor.taglineHint")}</div>
                </label>
                <label className="quote-field">
                  <span>{t("productEditor.taglineHy")}</span>
                  <input value={form.spec_hy} onChange={e => updateField("spec_hy", e.target.value)} />
                </label>
              </div>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>{t("productEditor.descriptionEn")}</span>
                  <textarea rows={5} value={form.description} onChange={e => updateField("description", e.target.value)} placeholder={t("productEditor.descriptionPlaceholder")} />
                </label>
                <label className="quote-field">
                  <span>{t("productEditor.descriptionHy")}</span>
                  <textarea rows={5} value={form.description_hy} onChange={e => updateField("description_hy", e.target.value)} />
                </label>
              </div>
              <label className="quote-field">
                <span>
                  {t("productEditor.category")}
                  <button type="button" className="quote-field-inline-action" onClick={() => setNewCategoryForm({ id: "", label: "", label_hy: "" })}>
                    {t("productEditor.newCategoryBtn")}
                  </button>
                </span>
                <Select value={form.category} onChange={v => updateField("category", v)} options={categoryOptions} placeholder={t("productEditor.categoryPlaceholder")} />
              </label>
            </div>
          </div>

          <div className="admin-card admin-settings-card">
            <h2 className="admin-card-title">{t("productEditor.photos")}</h2>
            <MultiImageDropzone value={form.images} onChange={imgs => updateField("images", imgs)} />
          </div>

          <div className="admin-card admin-settings-card">
            <h2 className="admin-card-title">{t("productEditor.seoSectionTitle")}</h2>
            <p className="quote-field-hint" style={{ marginBottom: 14 }}>{t("productEditor.seoSectionHint")}</p>
            <div className="admin-settings-form">
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>{t("productEditor.seoTitleEn")}</span>
                  <input value={form.seo_title} onChange={e => updateField("seo_title", e.target.value)} />
                </label>
                <label className="quote-field">
                  <span>{t("productEditor.seoTitleHy")}</span>
                  <input value={form.seo_title_hy} onChange={e => updateField("seo_title_hy", e.target.value)} />
                </label>
              </div>
              <label className="quote-field">
                <span>{t("productEditor.seoTitleRu")}</span>
                <input value={form.seo_title_ru} onChange={e => updateField("seo_title_ru", e.target.value)} />
              </label>
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>{t("productEditor.seoDescriptionEn")}</span>
                  <textarea rows={2} value={form.seo_description} onChange={e => updateField("seo_description", e.target.value)} />
                </label>
                <label className="quote-field">
                  <span>{t("productEditor.seoDescriptionHy")}</span>
                  <textarea rows={2} value={form.seo_description_hy} onChange={e => updateField("seo_description_hy", e.target.value)} />
                </label>
              </div>
              <label className="quote-field">
                <span>{t("productEditor.seoDescriptionRu")}</span>
                <textarea rows={2} value={form.seo_description_ru} onChange={e => updateField("seo_description_ru", e.target.value)} />
              </label>
            </div>
          </div>
        </div>

        <div className="admin-editor-side">
          <div className="admin-card admin-settings-card">
            <h2 className="admin-card-title">{t("productEditor.pricing")}</h2>
            <div className="admin-settings-form">
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>{t("productEditor.price")}</span>
                  <input type="number" min="0" value={form.price} onChange={e => updateField("price", e.target.value)} required />
                </label>
                <label className="quote-field">
                  <span>{t("productEditor.oldPrice")}</span>
                  <input type="number" min="0" value={form.old_price} onChange={e => updateField("old_price", e.target.value)} />
                  <div className="quote-field-hint">{t("productEditor.oldPriceHint")}</div>
                </label>
              </div>
              <label className="quote-field">
                <span>{t("productEditor.unit")}</span>
                <input value={form.unit} onChange={e => updateField("unit", e.target.value)} required placeholder="/ m" />
              </label>
            </div>
          </div>

          <div className="admin-card admin-settings-card">
            <h2 className="admin-card-title">{t("productEditor.availability")}</h2>
            <div className="admin-settings-form">
              <div className="admin-form-row">
                <label className="quote-field">
                  <span>{t("productEditor.badgeEn")}</span>
                  <input value={form.badge} onChange={e => updateField("badge", e.target.value)} placeholder={t("productEditor.badgePlaceholder")} />
                </label>
                <label className="quote-field">
                  <span>{t("productEditor.badgeHy")}</span>
                  <input value={form.badge_hy} onChange={e => updateField("badge_hy", e.target.value)} />
                </label>
              </div>
              <label className="admin-checkbox-field">
                <input
                  type="checkbox" checked={form.stock_qty !== null}
                  onChange={e => updateField("stock_qty", e.target.checked ? "0" : null)}
                />
                <span>{t("productEditor.trackInventory")}</span>
              </label>
              {form.stock_qty !== null && (
                <label className="quote-field">
                  <span>{t("productEditor.quantityInStock")}</span>
                  <input
                    type="number" min="0" value={form.stock_qty}
                    onChange={e => updateField("stock_qty", e.target.value)} required
                  />
                  <div className="quote-field-hint">{t("productEditor.quantityHint")}</div>
                </label>
              )}
              <label className="quote-field">
                <span>{t("productEditor.fallbackIcon")}</span>
                <Select value={form.icon} onChange={v => updateField("icon", v)} options={ICON_OPTIONS} />
                <div className="quote-field-hint">{t("productEditor.fallbackIconHint")}</div>
              </label>
              <label className="admin-checkbox-field">
                <input type="checkbox" checked={form.is_promo} onChange={e => updateField("is_promo", e.target.checked)} />
                <span>{t("productEditor.featuredPromo")}</span>
              </label>
            </div>
          </div>

          {!isNew && (
            <div className="admin-card admin-settings-card">
              <h2 className="admin-card-title">{t("productEditor.dangerZone")}</h2>
              <p className="admin-danger-hint">{t("productEditor.dangerHint")}</p>
              <button type="button" className="admin-btn admin-btn-danger" onClick={onDelete}>{t("productEditor.deleteProduct")}</button>
            </div>
          )}
        </div>
      </form>

      {newCategoryForm && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setNewCategoryForm(null); }}>
          <form className="admin-modal admin-modal-sm" onSubmit={onCreateCategory}>
            <div className="admin-modal-head">
              <h2>{t("productEditor.newCategoryModalTitle")}</h2>
              <button type="button" className="admin-modal-close" onClick={() => setNewCategoryForm(null)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              {categoryError && <div className="admin-error-banner">{categoryError}</div>}
              <label className="quote-field">
                <span>{t("productEditor.labelEn")}</span>
                <input
                  value={newCategoryForm.label} required autoFocus
                  onChange={e => setNewCategoryForm(f => ({
                    ...f, label: e.target.value, id: f.id === slugify(f.label) ? slugify(e.target.value) : f.id,
                  }))}
                />
              </label>
              <label className="quote-field">
                <span>{t("productEditor.labelHy")}</span>
                <input
                  value={newCategoryForm.label_hy}
                  onChange={e => setNewCategoryForm(f => ({ ...f, label_hy: e.target.value }))}
                />
              </label>
              <label className="quote-field">
                <span>{t("productEditor.categoryIdLabel")}</span>
                <input
                  value={newCategoryForm.id} required pattern="[a-z0-9\-]+" placeholder="glass-panels"
                  onChange={e => setNewCategoryForm(f => ({ ...f, id: slugify(e.target.value) }))}
                />
              </label>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-btn" onClick={() => setNewCategoryForm(null)}>{t("common.cancel")}</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={savingCategory}>
                {savingCategory ? t("productEditor.creating") : t("productEditor.createCategory")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
