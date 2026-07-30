import { TOOLS, GROUPS } from "../constants.js";

export default function Sidebar({ active, setActive, profile, onSwitch }) {
  return (
    <div style={{ width: 172, flexShrink: 0, borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", padding: "0 8px 12px", overflowY: "auto" }}>
      <div onClick={onSwitch} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 6px 10px", cursor: "pointer", borderBottom: "0.5px solid var(--color-border-tertiary)", marginBottom: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: profile.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{profile.avatar}</div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 500, margin: 0, color: "var(--color-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.name}</p>
          <p style={{ fontSize: 10, color: "var(--color-text-tertiary)", margin: 0 }}>switch profile</p>
        </div>
      </div>
      {GROUPS.map(g => (
        <div key={g.id} style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", padding: "4px 8px 5px", margin: 0, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{g.label}</p>
          {TOOLS.filter(t => t.group === g.id).map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px", marginBottom: 2, background: active === t.id ? "var(--color-background-secondary)" : "transparent", border: active === t.id ? "0.5px solid var(--color-border-secondary)" : "0.5px solid transparent", borderRadius: "var(--border-radius-md)", cursor: "pointer", textAlign: "left", width: "100%" }}>
              <span style={{ fontSize: 14 }}>{t.icon}</span>
              <span style={{ fontSize: 13, fontWeight: active === t.id ? 500 : 400, color: "var(--color-text-primary)" }}>{t.label}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
