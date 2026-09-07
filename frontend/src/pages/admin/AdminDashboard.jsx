import AdminAnalytics from "../../components/admin/AdminAnalytics";
import AdminLowStock from "../../components/admin/AdminLowStock";
import { useAdminT } from "../../context/AdminI18nContext";

export default function AdminDashboard() {
  const { t } = useAdminT();
  return (
    <div>
      <h1 className="admin-page-title">{t("dashboard.title")}</h1>
      <AdminLowStock />
      <AdminAnalytics />
    </div>
  );
}
