import { useEffect, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  adminListAdmins, adminCreateAdmin, adminDeleteAdmin, adminUpdateMe, adminChangePassword,
} from "../../lib/adminApi";
import { useAdminT } from "../../context/AdminI18nContext";

const EMPTY_ADMIN = { name: "", email: "", password: "" };

export default function AdminAccount() {
  const { t } = useAdminT();
  const { admin, setAdmin } = useAdminAuth();

  const [profile, setProfile] = useState({ name: admin?.name || "", email: admin?.email || "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);

  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwStatus, setPwStatus] = useState(null);

  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [adminsError, setAdminsError] = useState("");
  const [newAdminForm, setNewAdminForm] = useState(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  function loadAdmins() {
    setLoadingAdmins(true);
    adminListAdmins().then(setAdmins).catch(() => setAdminsError(t("account.admins.couldntLoad"))).finally(() => setLoadingAdmins(false));
  }

  useEffect(loadAdmins, []);

  async function onSaveProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileStatus(null);
    try {
      const updated = await adminUpdateMe(profile);
      setAdmin(updated);
      setProfileStatus({ type: "success", text: t("account.profile.success") });
      loadAdmins();
    } catch (err) {
      setProfileStatus({ type: "error", text: err.message || t("account.profile.couldntUpdate") });
    } finally {
      setProfileSaving(false);
    }
  }

  async function onChangePassword(e) {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      setPwStatus({ type: "error", text: t("account.password.mismatch") });
      return;
    }
    setPwSaving(true);
    setPwStatus(null);
    try {
      await adminChangePassword(pwForm.current_password, pwForm.new_password);
      setPwForm({ current_password: "", new_password: "", confirm: "" });
      setPwStatus({ type: "success", text: t("account.password.success") });
    } catch (err) {
      setPwStatus({ type: "error", text: err.message || t("account.password.couldntChange") });
    } finally {
      setPwSaving(false);
    }
  }

  async function onCreateAdmin(e) {
    e.preventDefault();
    setCreatingAdmin(true);
    setAdminsError("");
    try {
      await adminCreateAdmin(newAdminForm);
      setNewAdminForm(null);
      loadAdmins();
    } catch (err) {
      setAdminsError(err.message || t("account.admins.couldntCreate"));
    } finally {
      setCreatingAdmin(false);
    }
  }

  async function onDeleteAdmin(a) {
    if (!window.confirm(t("account.admins.removeConfirm", { name: a.name, email: a.email }))) return;
    try {
      await adminDeleteAdmin(a.id);
      loadAdmins();
    } catch (err) {
      setAdminsError(err.message || t("account.admins.couldntRemove"));
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">{t("account.pageTitle")}</h1>
      </div>

      <div className="admin-card admin-settings-card">
        <h2 className="admin-card-title">{t("account.profile.title")}</h2>
        <form onSubmit={onSaveProfile} className="admin-settings-form">
          <div className="admin-form-row">
            <label className="quote-field">
              <span>{t("common.personName")}</span>
              <input value={profile.name} onChange={e => setProfile(f => ({ ...f, name: e.target.value }))} required />
            </label>
            <label className="quote-field">
              <span>{t("common.email")}</span>
              <input type="email" value={profile.email} onChange={e => setProfile(f => ({ ...f, email: e.target.value }))} required />
            </label>
          </div>
          {profileStatus && <div className={"form-status " + profileStatus.type}>{profileStatus.text}</div>}
          <button type="submit" className="admin-btn admin-btn-primary" disabled={profileSaving}>
            {profileSaving ? t("common.saving") : t("account.profile.save")}
          </button>
        </form>
      </div>

      <div className="admin-card admin-settings-card">
        <h2 className="admin-card-title">{t("account.password.title")}</h2>
        <form onSubmit={onChangePassword} className="admin-settings-form">
          <div className="admin-form-row">
            <label className="quote-field">
              <span>{t("account.password.current")}</span>
              <input
                type="password" value={pwForm.current_password}
                onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))} required
              />
            </label>
            <label className="quote-field">
              <span>{t("account.password.new")}</span>
              <input
                type="password" value={pwForm.new_password} minLength={8}
                onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} required
              />
            </label>
            <label className="quote-field">
              <span>{t("account.password.confirm")}</span>
              <input
                type="password" value={pwForm.confirm} minLength={8}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required
              />
            </label>
          </div>
          {pwStatus && <div className={"form-status " + pwStatus.type}>{pwStatus.text}</div>}
          <button type="submit" className="admin-btn admin-btn-primary" disabled={pwSaving}>
            {pwSaving ? t("common.saving") : t("account.password.save")}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-head-row">
          <h2 className="admin-card-title">{t("account.admins.title")}</h2>
          <button className="admin-btn admin-btn-primary" onClick={() => setNewAdminForm({ ...EMPTY_ADMIN })}>{t("account.admins.newAdmin")}</button>
        </div>

        {adminsError && <div className="admin-error-banner">{adminsError}</div>}

        {loadingAdmins ? (
          <div className="admin-empty">{t("common.loading")}</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>{t("common.personName")}</th><th>{t("common.email")}</th><th></th></tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id}>
                  <td className="admin-table-title">{a.name}{a.id === admin?.id && <span className="admin-table-sub"> {t("account.admins.you")}</span>}</td>
                  <td>{a.email}</td>
                  <td className="admin-table-actions">
                    {a.id !== admin?.id && (
                      <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => onDeleteAdmin(a)}>{t("common.delete")}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {newAdminForm && (
        <div className="admin-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setNewAdminForm(null); }}>
          <form className="admin-modal" onSubmit={onCreateAdmin}>
            <div className="admin-modal-head">
              <h2>{t("account.admins.newModalTitle")}</h2>
              <button type="button" className="admin-modal-close" onClick={() => setNewAdminForm(null)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <label className="quote-field">
                <span>{t("common.personName")}</span>
                <input value={newAdminForm.name} onChange={e => setNewAdminForm(f => ({ ...f, name: e.target.value }))} required />
              </label>
              <label className="quote-field">
                <span>{t("common.email")}</span>
                <input type="email" value={newAdminForm.email} onChange={e => setNewAdminForm(f => ({ ...f, email: e.target.value }))} required />
              </label>
              <label className="quote-field">
                <span>{t("common.password")}</span>
                <input
                  type="password" value={newAdminForm.password} minLength={8}
                  onChange={e => setNewAdminForm(f => ({ ...f, password: e.target.value }))} required
                />
              </label>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-btn" onClick={() => setNewAdminForm(null)}>{t("common.cancel")}</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={creatingAdmin}>
                {creatingAdmin ? t("account.admins.creating") : t("account.admins.create")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
