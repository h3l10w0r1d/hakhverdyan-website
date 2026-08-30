import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminListProducts } from "../../lib/adminApi";
import { productPhoto } from "../../lib/productPhotos";

const LOW_STOCK_THRESHOLD = 5;

export default function AdminLowStock() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(null);

  useEffect(() => {
    adminListProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  if (!products) return null;

  const tracked = products
    .filter(p => p.stock_qty !== null && p.stock_qty <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.stock_qty - b.stock_qty);

  if (tracked.length === 0) {
    return (
      <div className="admin-card adm-chart-card admin-lowstock-card">
        <div className="adm-chart-head"><h3>Inventory alerts</h3></div>
        <div className="admin-lowstock-empty">All tracked products are well stocked. 🎉</div>
      </div>
    );
  }

  const outOfStock = tracked.filter(p => p.stock_qty === 0);
  const lowStock = tracked.filter(p => p.stock_qty > 0);

  return (
    <div className="admin-card adm-chart-card admin-lowstock-card">
      <div className="adm-chart-head">
        <h3>Inventory alerts</h3>
        <span className="adm-chart-range">{tracked.length} item{tracked.length === 1 ? "" : "s"}</span>
      </div>
      <div className="admin-lowstock-list">
        {outOfStock.map(p => (
          <div key={p.id} className="admin-lowstock-row" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
            <img className="admin-table-thumb" src={p.image || productPhoto(p.icon)} alt="" />
            <div className="admin-lowstock-name">{p.name}</div>
            <span className="admin-badge status-new">Out of stock</span>
          </div>
        ))}
        {lowStock.map(p => (
          <div key={p.id} className="admin-lowstock-row" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
            <img className="admin-table-thumb" src={p.image || productPhoto(p.icon)} alt="" />
            <div className="admin-lowstock-name">{p.name}</div>
            <span className="admin-badge status-contacted">{p.stock_qty} left</span>
          </div>
        ))}
      </div>
    </div>
  );
}
