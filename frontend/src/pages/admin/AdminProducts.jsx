import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminListProducts, adminDeleteProduct, adminReorderProducts, adminListCategories } from "../../lib/adminApi";
import DragHandleIcon from "../../components/admin/DragHandleIcon";
import useDragReorder from "../../lib/useDragReorder";
import { productPhoto } from "../../lib/productPhotos";

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const categoryLabel = id => categories.find(c => c.id === id)?.label || id;

  function load() {
    setLoading(true);
    adminListProducts().then(setProducts).catch(() => setError("Couldn't load products.")).finally(() => setLoading(false));
  }

  useEffect(load, []);
  useEffect(() => { adminListCategories().then(setCategories).catch(() => {}); }, []);

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

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Products</h1>
        <button className="admin-btn admin-btn-primary" onClick={() => navigate("/admin/products/new")}>+ New product</button>
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
