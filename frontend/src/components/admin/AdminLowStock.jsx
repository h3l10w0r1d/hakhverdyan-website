import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminListProducts } from "../../lib/adminApi";
import { productPhoto } from "../../lib/productPhotos";
import { useAdminT } from "../../context/AdminI18nContext";

const LOW_STOCK_THRESHOLD = 5;

export default function AdminLowStock() {
  const navigate = useNavigate();
  const { t } = useAdminT();
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
        <div className="adm-chart-head"><h3>{t("lowstock.inventoryAlerts")}</h3></div>
        <div className="admin-lowstock-empty">{t("lowstock.allStocked")}</div>
      </div>
    );
  }

  const outOfStock = tracked.filter(p => p.stock_qty === 0);
  const lowStock = tracked.filter(p => p.stock_qty > 0);

  return (
    <div className="admin-card adm-chart-card admin-lowstock-card">
      <div className="adm-chart-head">
        <h3>{t("lowstock.inventoryAlerts")}</h3>
        <span className="adm-chart-range">{tracked.length} {tracked.length === 1 ? t("lowstock.itemSingular") : t("lowstock.itemPlural")}</span>
      </div>
      <div className="admin-lowstock-list">
        {outOfStock.map(p => (
          <div key={p.id} className="admin-lowstock-row" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
            <img className="admin-table-thumb" src={p.image || productPhoto(p.icon)} alt="" />
            <div className="admin-lowstock-name">{p.name}</div>
            <span className="admin-badge status-new">{t("lowstock.outOfStock")}</span>
          </div>
        ))}
        {lowStock.map(p => (
          <div key={p.id} className="admin-lowstock-row" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
            <img className="admin-table-thumb" src={p.image || productPhoto(p.icon)} alt="" />
            <div className="admin-lowstock-name">{p.name}</div>
            <span className="admin-badge status-contacted">{t("lowstock.left", { count: p.stock_qty })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
