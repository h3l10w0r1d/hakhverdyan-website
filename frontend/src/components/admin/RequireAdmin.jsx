import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

// Same auth guard as AdminLayout, but renders no sidebar/chrome — for
// full-page admin views (like the blog editor) that want the entire
// viewport to themselves.
export default function RequireAdmin() {
  const { loading, isAuthenticated } = useAdminAuth();

  if (loading) return <div className="admin-shell-loading" />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
