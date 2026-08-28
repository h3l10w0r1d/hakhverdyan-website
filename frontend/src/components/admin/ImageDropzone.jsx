import { useRef, useState } from "react";

const MAX_DIMENSION = 900;
const JPEG_QUALITY = 0.82;

function resizeToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function ImageDropzone({ value, onChange }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError("");
    try {
      onChange(await resizeToDataUrl(file));
    } catch {
      setError("Couldn't read that image — try another file.");
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
            <button type="button" className="admin-btn admin-btn-sm" onClick={() => inputRef.current?.click()}>Replace</button>
            <button type="button" className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => onChange(null)}>Remove</button>
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
          <div className="adm-dropzone-text"><strong>Click to upload</strong> or drag and drop</div>
          <div className="adm-dropzone-sub">PNG or JPG</div>
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
