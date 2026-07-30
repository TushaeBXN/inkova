import { useState } from "react";
import { callClaude } from "../api.js";
import { SYS } from "../prompts.js";
import { saveHistory } from "../storage.js";
import { WRITE_MODES, TONES } from "../constants.js";
import UploadZone from "../components/UploadZone.jsx";
import ResultBox from "../components/ResultBox.jsx";
import HistoryPanel from "../components/HistoryPanel.jsx";
import Textarea from "../components/Textarea.jsx";

export default function WriteTool({ profile }) {
  const [mode, setMode] = useState("Blog post");
  const [tone, setTone] = useState("Casual");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState(null);

  async function generate() {
    if (!prompt.trim()) return;
    setLoading(true); setResult("");
    const content = doc?.type === "text"
      ? `REFERENCE:\n${doc.content}\n\nINSTRUCTION: ${prompt}`
      : prompt;
    const r = await callClaude(content, SYS.write(mode, tone));
    setResult(r); setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Format</label>
          <select value={mode} onChange={e => setMode(e.target.value)} style={{ width: "100%" }}>
            {WRITE_MODES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>Tone</label>
          <select value={tone} onChange={e => setTone(e.target.value)} style={{ width: "100%" }}>
            {TONES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <UploadZone label="Attach a reference document (optional)" onFile={f => setDoc(f)} />
      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>What should it be about?</label>
        <Textarea value={prompt} onChange={setPrompt} rows={3} placeholder="Give a topic, details, or a description..." />
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={generate} disabled={loading || !prompt.trim()} style={{ padding: "8px 20px" }}>{loading ? "Writing..." : "Generate"}</button>
        <HistoryPanel profileId={profile.id} toolId="write" onRestore={setResult} />
      </div>
      {result && (
        <ResultBox
          text={result}
          onCopy={() => navigator.clipboard.writeText(result)}
          onSave={() => saveHistory(profile.id, "write", { text: result, label: `${mode} — ${prompt.slice(0, 40)}` })}
        />
      )}
    </div>
  );
}
