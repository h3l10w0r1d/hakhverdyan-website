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

export default function AdminProducts() {
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
    adminListProducts().then(setProducts).catch(() => setError("Couldn't load products.")).finally(() => setLoading(false));
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
      setError("Couldn't save the new order — reloading.");
      load();
    }
  }

  const { dragIndex, overIndex, onDragStart, onDragOver, onDrop, onDragEnd } = useDragReorder(products, persistOrder);

  async function onDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm(`Delete product "${id}"? This can't be undone.`)) return;
    try {
      await adminDeleteProduct(id);
      load();
    } catch (err) {
      setError(err.message || "Couldn't delete product.");
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
    if (!window.confirm(`Delete ${selected.size} product${selected.size === 1 ? "" : "s"}? This can't be undone.`)) return;
    setBulkBusy(true);
    setError("");
    try {
      await adminBulkDeleteProducts([...selected]);
      clearSelection();
      load();
    } catch (err) {
      setError(err.message || "Couldn't delete the selected products.");
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
      setError(err.message || "Couldn't move the selected products.");
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
        { key: "id", label: "ID", value: p => p.id },
        { key: "name", label: "Name (EN)", value: p => p.name },
        { key: "name_hy", label: "Name (HY)", value: p => p.name_hy || "" },
        { key: "category", label: "Category", value: p => categoryLabel(p.category) },
        { key: "spec", label: "Tagline (EN)", value: p => p.spec },
        { key: "spec_hy", label: "Tagline (HY)", value: p => p.spec_hy || "" },
        { key: "description", label: "Description (EN)", value: p => p.description || "" },
        { key: "description_hy", label: "Description (HY)", value: p => p.description_hy || "" },
        { key: "price", label: "Price (֏)", value: p => p.price },
        { key: "old_price", label: "Old price (֏)", value: p => p.old_price ?? "" },
        { key: "unit", label: "Unit", value: p => p.unit },
        { key: "badge", label: "Badge (EN)", value: p => p.badge },
        { key: "badge_hy", label: "Badge (HY)", value: p => p.badge_hy || "" },
        { key: "promo", label: "Promo", value: p => (p.is_promo ? "Yes" : "No") },
        { key: "stock", label: "Stock", value: p => (p.stock_qty === null ? "Unlimited" : p.stock_qty) },
        { key: "photos", label: "Photos", value: p => (p.images || []).length },
      ],
      filtered
    );
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Products</h1>
        <div className="admin-editor-actions">
          <button className="admin-btn" onClick={exportCsv} disabled={filtered.length === 0}>Export CSV</button>
          <button className="admin-btn admin-btn-primary" onClick={() => navigate("/admin/products/new")}>+ New product</button>
        </div>
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

      {selected.size > 0 && (
        <div className="admin-bulk-bar">
          <span className="admin-bulk-count">{selected.size} selected</span>
          <Select
            className="adm-select-sm" placeholder="Move to category…"
            value={bulkCategory} onChange={onBulkCategory} options={categoryOptions} disabled={bulkBusy}
          />
          <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" onClick={onBulkDelete} disabled={bulkBusy}>
            Delete selected
          </button>
          <button type="button" className="admin-btn admin-btn-sm admin-bulk-clear" onClick={clearSelection}>Clear</button>
        </div>
      )}

      <div className="admin-card">
        {loading ? (
          <div className="admin-empty">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">{isFiltered ? "No products match your search." : "No products yet."}</div>
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
                <th></th><th></th><th>Name</th><th>Category</th><th>Price</th><th>Badge</th><th>Stock</th><th>Promo</th><th></th>
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
                  <td className="admin-drag-handle" title={isFiltered ? "" : "Drag to reorder"} onClick={e => e.stopPropagation()}>
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
                      <span className="admin-table-sub">Unlimited</span>
                    ) : p.stock_qty === 0 ? (
                      <span className="admin-badge status-new">Out of stock</span>
                    ) : (
                      `${p.stock_qty} in stock`
                    )}
                  </td>
                  <td>{p.is_promo ? "Yes" : "—"}</td>
                  <td className="admin-table-actions">
                    <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={e => onDelete(e, p.id)}>Delete</button>
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
