import { useState, useRef, useEffect } from "react";
import { callClaudeConvo } from "../api.js";
import { SYS } from "../prompts.js";
import UploadZone from "../components/UploadZone.jsx";

export default function BrainstormTool() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [docCtx, setDocCtx] = useState(null);
  const bot = useRef(null);

  useEffect(() => { bot.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    if (!input.trim()) return;
    let content = input;
    if (docCtx && msgs.length === 0) content = `DOCUMENT:\n${docCtx.content}\n\nMESSAGE: ${input}`;
    const histMsgs = [...msgs, { role: "user", content }];
    setMsgs(p => [...p, { role: "user", content: input }]);
    setInput(""); setLoading(true);
    const r = await callClaudeConvo(histMsgs, SYS.brainstorm);
    setMsgs(p => [...p, { role: "assistant", content: r }]);
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {msgs.length === 0 && (
        <div style={{ marginBottom: 12 }}>
          <UploadZone label="Attach a document (optional)" onFile={f => setDocCtx(f)} />
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, paddingBottom: 8 }}>
        {msgs.length === 0 && (
          <div style={{ color: "var(--color-text-tertiary)", fontSize: 14, textAlign: "center", marginTop: 24 }}>
            <p style={{ margin: 0 }}>Share an idea, topic, or question.</p>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%", padding: "10px 14px", background: m.role === "user" ? "var(--color-background-info)" : "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", fontSize: 14, lineHeight: 1.6, color: m.role === "user" ? "var(--color-text-info)" : "var(--color-text-primary)", whiteSpace: "pre-wrap" }}>
            {m.content}
          </div>
        ))}
        {loading && <div style={{ alignSelf: "flex-start", color: "var(--color-text-tertiary)", fontSize: 13, padding: "8px 14px" }}>Thinking...</div>}
        <div ref={bot} />
      </div>
      <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="What's on your mind?" rows={2}
          style={{ flex: 1, resize: "none", fontSize: 14, padding: "8px 12px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }} />
        <button onClick={send} disabled={loading} style={{ alignSelf: "flex-end", padding: "8px 16px" }}>Send</button>
      </div>
    </div>
  );
}
