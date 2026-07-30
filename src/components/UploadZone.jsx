import { useState, useRef } from "react";
import { extractFile } from "../utils.js";

export default function UploadZone({ onFile, label = "Upload a document" }) {
  const [dragging, setDragging] = useState(false);
  const [loaded, setLoaded] = useState(null);
  const [err, setErr] = useState("");
  const ref = useRef();

  async function handle(file) {
    if (!file) return;
    setErr("");
    try {
      const r = await extractFile(file);
      setLoaded(file.name);
      onFile(r, file.name);
    } catch (e) { setErr(e.message); }
  }

  return (
    <div>
      <div
        onClick={() => ref.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
        style={{ border: `1.5px dashed ${dragging ? "var(--color-border-primary)" : "var(--color-border-secondary)"}`, borderRadius: "var(--border-radius-md)", padding: "10px 14px", background: dragging ? "var(--color-background-secondary)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
      >
        <span style={{ fontSize: 16 }}>📎</span>
        <div style={{ flex: 1 }}>
          {loaded
            ? <span style={{ fontSize: 13, color: "var(--color-text-success)", fontWeight: 500 }}>{loaded} loaded</span>
            : <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{label} — drag & drop or click</span>}
          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", display: "block", marginTop: 1 }}>PDF · DOCX · TXT</span>
        </div>
        {loaded && (
          <button onClick={e => { e.stopPropagation(); setLoaded(null); onFile(null); }} style={{ fontSize: 11, padding: "2px 8px" }}>
            Clear
          </button>
        )}
      </div>
      {err && <p style={{ color: "var(--color-text-danger)", fontSize: 12, margin: "4px 0 0" }}>{err}</p>}
      <input ref={ref} type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={e => handle(e.target.files[0])} />
    </div>
  );
}
