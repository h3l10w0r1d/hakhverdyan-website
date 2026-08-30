import { NavLink, Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/blog", label: "Blog" },
  { to: "/admin/partners", label: "Partners" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/messages", label: "Messages" },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/settings", label: "Settings" },
  { to: "/admin/account", label: "Account" },
];

export default function AdminLayout() {
  const { admin, loading, logout, isAuthenticated } = useAdminAuth();

  if (loading) return <div className="admin-shell-loading" />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo"><span className="dot"></span><span className="admin-sidebar-logo-text">HAKHVERDYAN</span></div>
        <nav className="admin-nav">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => "admin-nav-link" + (isActive ? " active" : "")}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <div className="admin-sidebar-user">{admin?.name || admin?.email}</div>
          <button className="admin-logout-btn" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
