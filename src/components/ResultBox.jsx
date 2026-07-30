export default function ResultBox({ text, onCopy, onSave }) {
  return (
    <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", marginTop: 14 }}>
      <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "0 0 8px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Result</p>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--color-text-primary)", whiteSpace: "pre-wrap", margin: 0, maxHeight: 260, overflowY: "auto" }}>{text}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={onCopy} style={{ fontSize: 12, padding: "4px 12px" }}>Copy</button>
        {onSave && (
          <button onClick={onSave} style={{ fontSize: 12, padding: "4px 12px", background: "var(--color-background-success)", color: "var(--color-text-success)", border: "0.5px solid var(--color-border-success)" }}>
            Save
          </button>
        )}
      </div>
    </div>
  );
}
