import { useRef, useState } from "react";
import { resizeToDataUrl } from "../../lib/resizeImage";
import useDragReorder from "../../lib/useDragReorder";
import DragHandleIcon from "./DragHandleIcon";
import { useAdminT } from "../../context/AdminI18nContext";

// Manages an ordered list of product photos: add (click or drag-drop, multiple
// files at once), remove, and drag-to-reorder thumbnails. `value` is an array
// of image URLs/data-URIs; `onChange(nextArray)` fires on every change.
export default function MultiImageDropzone({ value, onChange }) {
  const { t } = useAdminT();
  const images = value || [];
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const { dragIndex, overIndex, onDragStart, onDragOver, onDrop, onDragEnd } = useDragReorder(images, onChange);

  async function handleFiles(files) {
    const list = Array.from(files || []).filter(f => f.type.startsWith("image/"));
    if (!list.length) {
      setError(t("imageDropzone.chooseImageFile"));
      return;
    }
    setError("");
    try {
      const dataUrls = await Promise.all(list.map(resizeToDataUrl));
      // Functional update: picking a second photo before the first one
      // finishes resizing must not overwrite it with a stale base array.
      onChange(prev => [...(prev || []), ...dataUrls]);
    } catch {
      setError(t("imageDropzone.couldntReadImage"));
    }
  }

  function onDrop_(e) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function removeAt(index) {
    onChange(prev => (prev || []).filter((_, i) => i !== index));
  }

  return (
    <div className="adm-multi-images-wrap">
      {images.length > 0 && (
        <div className="adm-multi-images">
          {images.map((url, i) => (
            <div
              key={i}
              className={
                "adm-multi-image-item" +
                (dragIndex === i ? " admin-row-dragging" : "") +
                (overIndex === i && dragIndex !== i ? " admin-row-drop-target" : "")
              }
              draggable
              onDragStart={onDragStart(i)}
              onDragOver={onDragOver(i)}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
            >
              <span className="adm-multi-image-handle" title={t("imageDropzone.dragToReorder")}><DragHandleIcon /></span>
              <img src={url} alt={`Photo ${i + 1}`} />
              {i === 0 && <span className="adm-multi-image-primary">{t("imageDropzone.primary")}</span>}
              <button type="button" className="adm-multi-image-remove" onClick={() => removeAt(i)} aria-label={t("imageDropzone.removePhoto")}>×</button>
            </div>
          ))}
        </div>
      )}
      <div
        className={"adm-dropzone adm-multi-image-add" + (dragging ? " dragging" : "")}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop_}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
          <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        </svg>
        <div className="adm-dropzone-text"><strong>{t("imageDropzone.clickToUpload")}</strong> {t("imageDropzone.orDragDrop")}</div>
        <div className="adm-dropzone-sub">{t("imageDropzone.pngOrJpgMultiple")}</div>
      </div>
      <input
        ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
        onChange={e => { handleFiles(e.target.files); e.target.value = ""; }}
      />
      {error && <div className="admin-login-error" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  );
}
