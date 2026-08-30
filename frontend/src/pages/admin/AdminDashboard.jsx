import AdminAnalytics from "../../components/admin/AdminAnalytics";
import AdminLowStock from "../../components/admin/AdminLowStock";

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="admin-page-title">Dashboard</h1>
      <AdminLowStock />
      <AdminAnalytics />
    </div>
  );
}
