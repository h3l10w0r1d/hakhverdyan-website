import { useRef, useState } from "react";
import { resizeToDataUrl } from "../../lib/resizeImage";
import { useAdminT } from "../../context/AdminI18nContext";

export default function ImageDropzone({ value, onChange }) {
  const { t } = useAdminT();
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(t("imageDropzone.chooseImageFile"));
      return;
    }
    setError("");
    try {
      onChange(await resizeToDataUrl(file));
    } catch {
      setError(t("imageDropzone.couldntReadImage"));
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="adm-dropzone-wrap">
      {value ? (
        <div className="adm-dropzone-preview">
          <img src={value} alt="Product" />
          <div className="adm-dropzone-preview-actions">
            <button type="button" className="admin-btn admin-btn-sm" onClick={() => inputRef.current?.click()}>{t("imageDropzone.replace")}</button>
            <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => onChange(null)}>{t("imageDropzone.remove")}</button>
          </div>
        </div>
      ) : (
        <div
          className={"adm-dropzone" + (dragging ? " dragging" : "")}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
            <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
          </svg>
          <div className="adm-dropzone-text"><strong>{t("imageDropzone.clickToUpload")}</strong> {t("imageDropzone.orDragDrop")}</div>
          <div className="adm-dropzone-sub">{t("imageDropzone.pngOrJpg")}</div>
        </div>
      )}
      <input
        ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
      />
      {error && <div className="admin-login-error" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  );
}
