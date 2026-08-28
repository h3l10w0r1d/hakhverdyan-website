import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminStats } from "../../lib/adminApi";

const TILES = [
  { key: "new_quotes", label: "New bookings", to: "/admin/bookings" },
  { key: "new_messages", label: "New messages", to: "/admin/messages" },
  { key: "total_products", label: "Products", to: "/admin/products" },
  { key: "total_posts", label: "Blog posts" },
  { key: "total_quotes", label: "Total bookings", to: "/admin/bookings" },
  { key: "total_messages", label: "Total messages", to: "/admin/messages" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminStats().then(setStats).catch(() => setStats({}));
  }, []);

  return (
    <div>
      <h1 className="admin-page-title">Dashboard</h1>
      <div className="admin-stat-grid">
        {TILES.map(t => {
          const value = stats ? (stats[t.key] ?? "—") : "…";
          const card = (
            <div className="admin-stat-card" key={t.key}>
              <div className="admin-stat-value">{value}</div>
              <div className="admin-stat-label">{t.label}</div>
            </div>
          );
          return t.to ? <Link to={t.to} key={t.key} className="admin-stat-link">{card}</Link> : card;
        })}
      </div>
    </div>
  );
}
