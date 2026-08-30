import { useEffect, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  adminListAdmins, adminCreateAdmin, adminDeleteAdmin, adminUpdateMe, adminChangePassword,
} from "../../lib/adminApi";

const EMPTY_ADMIN = { name: "", email: "", password: "" };

export default function AdminAccount() {
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
    adminListAdmins().then(setAdmins).catch(() => setAdminsError("Couldn't load admins.")).finally(() => setLoadingAdmins(false));
  }

  useEffect(loadAdmins, []);

  async function onSaveProfile(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileStatus(null);
    try {
      const updated = await adminUpdateMe(profile);
      setAdmin(updated);
      setProfileStatus({ type: "success", text: "Profile updated." });
      loadAdmins();
    } catch (err) {
      setProfileStatus({ type: "error", text: err.message || "Couldn't update profile." });
    } finally {
      setProfileSaving(false);
    }
  }

  async function onChangePassword(e) {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) {
      setPwStatus({ type: "error", text: "New passwords don't match." });
      return;
    }
    setPwSaving(true);
    setPwStatus(null);
    try {
      await adminChangePassword(pwForm.current_password, pwForm.new_password);
      setPwForm({ current_password: "", new_password: "", confirm: "" });
      setPwStatus({ type: "success", text: "Password changed." });
    } catch (err) {
      setPwStatus({ type: "error", text: err.message || "Couldn't change password." });
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
      setAdminsError(err.message || "Couldn't create admin.");
    } finally {
      setCreatingAdmin(false);
    }
  }

  async function onDeleteAdmin(a) {
    if (!window.confirm(`Remove admin "${a.name}" (${a.email})? This can't be undone.`)) return;
    try {
      await adminDeleteAdmin(a.id);
      loadAdmins();
    } catch (err) {
      setAdminsError(err.message || "Couldn't remove admin.");
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">Account</h1>
      </div>

      <div className="admin-card admin-settings-card">
        <h2 className="admin-card-title">My profile</h2>
        <form onSubmit={onSaveProfile} className="admin-settings-form">
          <div className="admin-form-row">
            <label className="quote-field">
              <span>Name</span>
              <input value={profile.name} onChange={e => setProfile(f => ({ ...f, name: e.target.value }))} required />
            </label>
            <label className="quote-field">
              <span>Email</span>
              <input type="email" value={profile.email} onChange={e => setProfile(f => ({ ...f, email: e.target.value }))} required />
            </label>
          </div>
          {profileStatus && <div className={"form-status " + profileStatus.type}>{profileStatus.text}</div>}
          <button type="submit" className="admin-btn admin-btn-primary" disabled={profileSaving}>
            {profileSaving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>

      <div className="admin-card admin-settings-card">
        <h2 className="admin-card-title">Change password</h2>
        <form onSubmit={onChangePassword} className="admin-settings-form">
          <div className="admin-form-row">
            <label className="quote-field">
              <span>Current password</span>
              <input
                type="password" value={pwForm.current_password}
                onChange={e => setPwForm(f => ({ ...f, current_password: e.target.value }))} required
              />
            </label>
            <label className="quote-field">
              <span>New password</span>
              <input
                type="password" value={pwForm.new_password} minLength={8}
                onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} required
              />
            </label>
            <label className="quote-field">
              <span>Confirm new password</span>
              <input
                type="password" value={pwForm.confirm} minLength={8}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required
              />
            </label>
          </div>
          {pwStatus && <div className={"form-status " + pwStatus.type}>{pwStatus.text}</div>}
          <button type="submit" className="admin-btn admin-btn-primary" disabled={pwSaving}>
            {pwSaving ? "Saving…" : "Change password"}
          </button>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-head-row">
          <h2 className="admin-card-title">Admin users</h2>
          <button className="admin-btn admin-btn-primary" onClick={() => setNewAdminForm({ ...EMPTY_ADMIN })}>+ New admin</button>
        </div>

        {adminsError && <div className="admin-error-banner">{adminsError}</div>}

        {loadingAdmins ? (
          <div className="admin-empty">Loading…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th></th></tr>
            </thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id}>
                  <td className="admin-table-title">{a.name}{a.id === admin?.id && <span className="admin-table-sub"> (you)</span>}</td>
                  <td>{a.email}</td>
                  <td className="admin-table-actions">
                    {a.id !== admin?.id && (
                      <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => onDeleteAdmin(a)}>Delete</button>
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
              <h2>New admin</h2>
              <button type="button" className="admin-modal-close" onClick={() => setNewAdminForm(null)}>&times;</button>
            </div>
            <div className="admin-modal-body">
              <label className="quote-field">
                <span>Name</span>
                <input value={newAdminForm.name} onChange={e => setNewAdminForm(f => ({ ...f, name: e.target.value }))} required />
              </label>
              <label className="quote-field">
                <span>Email</span>
                <input type="email" value={newAdminForm.email} onChange={e => setNewAdminForm(f => ({ ...f, email: e.target.value }))} required />
              </label>
              <label className="quote-field">
                <span>Password</span>
                <input
                  type="password" value={newAdminForm.password} minLength={8}
                  onChange={e => setNewAdminForm(f => ({ ...f, password: e.target.value }))} required
                />
              </label>
            </div>
            <div className="admin-modal-foot">
              <button type="button" className="admin-btn" onClick={() => setNewAdminForm(null)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={creatingAdmin}>
                {creatingAdmin ? "Creating…" : "Create admin"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
