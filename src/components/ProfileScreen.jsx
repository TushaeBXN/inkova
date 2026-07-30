import { useState, useEffect } from "react";
import { AVATARS, COLORS } from "../constants.js";
import { storageGet, storageSet } from "../storage.js";

export default function ProfileScreen({ onSelect }) {
  const [profiles, setProfiles] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAvatar, setNewAvatar] = useState(AVATARS[0]);
  const [newColor, setNewColor] = useState(COLORS[0]);

  useEffect(() => { storageGet("profiles").then(p => setProfiles(p || [])); }, []);

  async function createProfile() {
    if (!newName.trim()) return;
    const p = { id: Date.now().toString(), name: newName.trim(), avatar: newAvatar, color: newColor, createdAt: Date.now() };
    const updated = [...(profiles || []), p];
    await storageSet("profiles", updated);
    setProfiles(updated); setCreating(false); setNewName("");
  }

  async function deleteProfile(id) {
    const updated = (profiles || []).filter(p => p.id !== id);
    await storageSet("profiles", updated); setProfiles(updated);
  }

  if (profiles === null) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "var(--color-text-tertiary)", fontSize: 14 }}>Loading...</div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px", background: "var(--color-background-primary)" }}>
      <p style={{ fontSize: 26, fontWeight: 600, color: "var(--color-text-primary)", margin: "0 0 6px", textAlign: "center" }}>Inkova</p>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "0 0 36px", textAlign: "center" }}>Who's writing today?</p>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", marginBottom: 32, maxWidth: 560 }}>
        {profiles.map(p => (
          <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => onSelect(p)}>
            <div
              style={{ width: 76, height: 76, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, border: "2px solid transparent", transition: "border 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.border = "2px solid var(--color-border-primary)"}
              onMouseLeave={e => e.currentTarget.style.border = "2px solid transparent"}
            >{p.avatar}</div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{p.name}</span>
            <button onClick={e => { e.stopPropagation(); deleteProfile(p.id); }} style={{ fontSize: 10, padding: "1px 6px", color: "var(--color-text-tertiary)", opacity: 0.6 }}>remove</button>
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setCreating(true)}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: "var(--color-background-secondary)", border: "1.5px dashed var(--color-border-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "var(--color-text-tertiary)" }}>+</div>
          <span style={{ fontSize: 13, color: "var(--color-text-tertiary)" }}>Add profile</span>
        </div>
      </div>
      {creating && (
        <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "20px 24px", width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>New profile</p>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" onKeyDown={e => e.key === "Enter" && createProfile()}
            style={{ fontSize: 14, padding: "8px 12px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", width: "100%", boxSizing: "border-box" }} />
          <div>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>Pick an avatar</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {AVATARS.map(a => (
                <button key={a} onClick={() => setNewAvatar(a)} style={{ fontSize: 22, padding: "4px 8px", background: newAvatar === a ? "var(--color-background-info)" : "transparent", border: newAvatar === a ? "1px solid var(--color-border-info)" : "1px solid transparent", borderRadius: "var(--border-radius-md)", cursor: "pointer" }}>{a}</button>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>Pick a color</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: newColor === c ? "2px solid var(--color-border-primary)" : "2px solid transparent", cursor: "pointer" }} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={createProfile} disabled={!newName.trim()} style={{ flex: 1, padding: "8px" }}>Create</button>
            <button onClick={() => setCreating(false)} style={{ padding: "8px 14px", color: "var(--color-text-secondary)" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
