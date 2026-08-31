import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  GridIcon, BoxIcon, DraftIcon, VennIcon, CalendarIcon, MailIcon, UsersIcon, GearIcon, UserIcon,
} from "../../lib/icons";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true, icon: GridIcon },
  { to: "/admin/products", label: "Products", icon: BoxIcon },
  { to: "/admin/blog", label: "Blog", icon: DraftIcon },
  { to: "/admin/partners", label: "Partners", icon: VennIcon },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarIcon },
  { to: "/admin/messages", label: "Messages", icon: MailIcon },
  { to: "/admin/members", label: "Members", icon: UsersIcon },
  { to: "/admin/settings", label: "Settings", icon: GearIcon },
  { to: "/admin/account", label: "Account", icon: UserIcon },
];

export default function AdminLayout() {
  const { admin, loading, logout, isAuthenticated } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  if (loading) return <div className="admin-shell-loading" />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return (
    <div className="admin-shell">
      <div className="admin-mobile-bar">
        <button
          className="admin-mobile-burger" aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen(o => !o)}
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          )}
        </button>
        <img className="admin-mobile-bar-logo" src="/brand/logo-icon.png" alt="" />
      </div>

      {mobileOpen && <div className="admin-mobile-backdrop" onClick={() => setMobileOpen(false)} />}

      <aside className={"admin-sidebar" + (mobileOpen ? " admin-sidebar-open" : "")}>
        <div className="admin-sidebar-logo">
          <img className="admin-sidebar-logo-mark" src="/brand/logo-icon.png" alt="Hakhverdyan Holding" />
          <span className="admin-sidebar-logo-text">HAKHVERDYAN</span>
        </div>
        <nav className="admin-nav">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => "admin-nav-link" + (isActive ? " active" : "")}>
              <l.icon size={18} />
              <span className="admin-nav-link-label">{l.label}</span>
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
