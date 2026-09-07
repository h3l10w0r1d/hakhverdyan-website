import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminListProducts, adminDeleteProduct, adminReorderProducts, adminListCategories,
  adminBulkDeleteProducts, adminBulkUpdateCategory,
} from "../../lib/adminApi";
import DragHandleIcon from "../../components/admin/DragHandleIcon";
import Select from "../../components/admin/Select";
import useDragReorder from "../../lib/useDragReorder";
import { productPhoto } from "../../lib/productPhotos";
import { downloadCsv } from "../../lib/csvExport";
import { useAdminT } from "../../context/AdminI18nContext";

export default function AdminProducts() {
  const { t } = useAdminT();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);

  const categoryLabel = id => categories.find(c => c.id === id)?.label || id;
  const categoryOptions = categories.map(c => ({ value: c.id, label: c.label }));

  function load() {
    setLoading(true);
    adminListProducts().then(setProducts).catch(() => setError(t("products.couldntLoad"))).finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => { adminListCategories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { clearSelection(); }, [search]);

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
      setError(t("products.couldntSaveOrder"));
      load();
    }
  }

  const { dragIndex, overIndex, onDragStart, onDragOver, onDrop, onDragEnd } = useDragReorder(products, persistOrder);

  async function onDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm(t("products.deleteConfirm", { id }))) return;
    try {
      await adminDeleteProduct(id);
      load();
    } catch (err) {
      setError(err.message || t("products.couldntDelete"));
    }
  }

  function toggleSelected(e, id) {
    e.stopPropagation();
    setSelected(s => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected(s => (s.size === filtered.length ? new Set() : new Set(filtered.map(p => p.id))));
  }

  function clearSelection() {
    setSelected(new Set());
    setBulkCategory("");
  }

  async function onBulkDelete() {
    const confirmMsg = selected.size === 1
      ? t("products.deleteBulkConfirmOne")
      : t("products.deleteBulkConfirmMany", { count: selected.size });
    if (!window.confirm(confirmMsg)) return;
    setBulkBusy(true);
    setError("");
    try {
      await adminBulkDeleteProducts([...selected]);
      clearSelection();
      load();
    } catch (err) {
      setError(err.message || t("products.couldntBulkDelete"));
    } finally {
      setBulkBusy(false);
    }
  }

  async function onBulkCategory(categoryId) {
    setBulkCategory(categoryId);
    setBulkBusy(true);
    setError("");
    try {
      await adminBulkUpdateCategory([...selected], categoryId);
      clearSelection();
      load();
    } catch (err) {
      setError(err.message || t("products.couldntBulkMove"));
    } finally {
      setBulkBusy(false);
    }
  }

  function exportCsv() {
    // Photos are stored as embedded image data, not hosted files or URLs — a
    // real photo easily exceeds a spreadsheet's per-cell character limit, so
    // the export carries a photo count rather than the (unusable) raw data.
    downloadCsv(
      `products-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        { key: "id", label: t("products.csvId"), value: p => p.id },
        { key: "name", label: t("products.csvNameEn"), value: p => p.name },
        { key: "name_hy", label: t("products.csvNameHy"), value: p => p.name_hy || "" },
        { key: "category", label: t("products.colCategory"), value: p => categoryLabel(p.category) },
        { key: "spec", label: t("products.csvTaglineEn"), value: p => p.spec },
        { key: "spec_hy", label: t("products.csvTaglineHy"), value: p => p.spec_hy || "" },
        { key: "description", label: t("products.csvDescriptionEn"), value: p => p.description || "" },
        { key: "description_hy", label: t("products.csvDescriptionHy"), value: p => p.description_hy || "" },
        { key: "price", label: t("products.csvPrice"), value: p => p.price },
        { key: "old_price", label: t("products.csvOldPrice"), value: p => p.old_price ?? "" },
        { key: "unit", label: t("products.csvUnit"), value: p => p.unit },
        { key: "badge", label: t("products.csvBadgeEn"), value: p => p.badge },
        { key: "badge_hy", label: t("products.csvBadgeHy"), value: p => p.badge_hy || "" },
        { key: "promo", label: t("products.colPromo"), value: p => (p.is_promo ? t("common.yes") : t("common.no")) },
        { key: "stock", label: t("products.colStock"), value: p => (p.stock_qty === null ? t("products.unlimited") : p.stock_qty) },
        { key: "photos", label: t("products.csvPhotos"), value: p => (p.images || []).length },
      ],
      filtered
    );
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t("products.pageTitle")}</h1>
        <div className="admin-editor-actions">
          <button className="admin-btn" onClick={exportCsv} disabled={filtered.length === 0}>{t("common.exportCsv")}</button>
          <button className="admin-btn admin-btn-primary" onClick={() => navigate("/admin/products/new")}>{t("products.newProduct")}</button>
        </div>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-search-row">
        <input
          type="text" className="admin-search-input" placeholder={t("products.searchPlaceholder")}
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {isFiltered && <span className="admin-search-count">{t("products.searchCount", { filtered: filtered.length, total: products.length })}</span>}
      </div>
      {isFiltered && <div className="admin-search-note">{t("products.reorderDisabledNote")}</div>}

      {selected.size > 0 && (
        <div className="admin-bulk-bar">
          <span className="admin-bulk-count">{t("common.selected", { count: selected.size })}</span>
          <Select
            className="adm-select-sm" placeholder={t("products.moveToCategory")}
            value={bulkCategory} onChange={onBulkCategory} options={categoryOptions} disabled={bulkBusy}
          />
          <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" onClick={onBulkDelete} disabled={bulkBusy}>
            {t("products.deleteSelected")}
          </button>
          <button type="button" className="admin-btn admin-btn-sm admin-bulk-clear" onClick={clearSelection}>{t("common.clear")}</button>
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">{t("common.loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">{isFiltered ? t("products.noMatch") : t("products.noProducts")}</div>
        ) : (
          <table className={"admin-table" + (isFiltered ? "" : " admin-table-reorderable")}>
            <thead>
              <tr>
                <th className="admin-table-checkbox">
                  <input
                    type="checkbox" checked={selected.size > 0 && selected.size === filtered.length}
                    ref={el => { if (el) el.indeterminate = selected.size > 0 && selected.size < filtered.length; }}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th></th><th></th><th>{t("common.name")}</th><th>{t("products.colCategory")}</th><th>{t("products.colPrice")}</th><th>{t("products.colBadge")}</th><th>{t("products.colStock")}</th><th>{t("products.colPromo")}</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  className={
                    "admin-table-row-clickable " +
                    (isFiltered ? "" : (dragIndex === i ? "admin-row-dragging" : "") + (overIndex === i && dragIndex !== i ? " admin-row-drop-target" : ""))
                  }
                  onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                  {...(isFiltered ? {} : {
                    draggable: true,
                    onDragStart: onDragStart(i),
                    onDragOver: onDragOver(i),
                    onDrop: onDrop,
                    onDragEnd: onDragEnd,
                  })}
                >
                  <td className="admin-table-checkbox" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(p.id)} onChange={e => toggleSelected(e, p.id)} />
                  </td>
                  <td className="admin-drag-handle" title={isFiltered ? "" : t("imageDropzone.dragToReorder")} onClick={e => e.stopPropagation()}>
                    {!isFiltered && <DragHandleIcon />}
                  </td>
                  <td><img className="admin-table-thumb" src={p.image || productPhoto(p.icon)} alt="" /></td>
                  <td>
                    <div className="admin-table-title">{p.name}</div>
                    <div className="admin-table-sub">{p.id}</div>
                  </td>
                  <td>{categoryLabel(p.category)}</td>
                  <td>{p.price.toLocaleString("en-US")}֏ {p.unit}</td>
                  <td>{p.badge}</td>
                  <td>
                    {p.stock_qty === null ? (
                      <span className="admin-table-sub">{t("products.unlimited")}</span>
                    ) : p.stock_qty === 0 ? (
                      <span className="admin-badge status-new">{t("products.outOfStock")}</span>
                    ) : (
                      t("products.inStock", { qty: p.stock_qty })
                    )}
                  </td>
                  <td>{p.is_promo ? t("common.yes") : "—"}</td>
                  <td className="admin-table-actions">
                    <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={e => onDelete(e, p.id)}>{t("common.delete")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
