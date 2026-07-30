export default function Textarea({ value, onChange, rows, placeholder, small }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      style={{ width: "100%", resize: "vertical", fontSize: small ? 13 : 14, padding: "9px 12px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box", lineHeight: 1.6 }}
    />
  );
}
