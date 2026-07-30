import { useState, useEffect } from "react";
import { getHistory } from "../storage.js";

export default function HistoryPanel({ profileId, toolId, onRestore }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) getHistory(profileId, toolId).then(setItems);
  }, [open, profileId, toolId]);

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{ fontSize: 12, padding: "4px 10px", color: "var(--color-text-tertiary)" }}>
      🕐 History
    </button>
  );

  return (
    <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "12px 14px", marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>Recent saved results</p>
        <button onClick={() => setOpen(false)} style={{ fontSize: 11, padding: "2px 8px" }}>Close</button>
      </div>
      {items.length === 0 && <p style={{ fontSize: 13, color: "var(--color-text-tertiary)", margin: 0 }}>No saved history yet.</p>}
      {items.map((item, i) => (
        <div key={i} style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 8, marginTop: 8 }}>
          <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "0 0 4px" }}>{new Date(item.ts).toLocaleDateString()} — {item.label || "result"}</p>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-primary)", margin: "0 0 6px", whiteSpace: "pre-wrap", maxHeight: 80, overflow: "hidden" }}>
            {item.text?.slice(0, 200)}{item.text?.length > 200 ? "..." : ""}
          </p>
          <button onClick={() => { onRestore(item.text); setOpen(false); }} style={{ fontSize: 11, padding: "2px 10px" }}>Restore</button>
        </div>
      ))}
    </div>
  );
}
