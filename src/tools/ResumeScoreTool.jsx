import { useState } from "react";
import { callClaude, parseJSON } from "../api.js";
import { SYS } from "../prompts.js";
import { saveHistory } from "../storage.js";
import UploadZone from "../components/UploadZone.jsx";
import Textarea from "../components/Textarea.jsx";
import HistoryPanel from "../components/HistoryPanel.jsx";

const RULE_LABELS = {
  header:       "Contact info uses pipes (|)",
  sections:     "Section headers match exactly",
  chronological:"Reverse chronological order",
  dates:        "MM/YYYY dates on every role",
  location:     "City & state on every role",
  ampersand:    "Uses & instead of /",
  italics:      "No italics on titles or companies",
  impact:       "3+ bullet impact statements per role",
  internship:   "Unpaid internships in own section",
  highlights:   "Career Highlights with month/year dates",
  pronouns:     "No first-person pronouns",
  action:       "Bullets begin with action verbs",
  quantified:   "Achievements quantified with numbers",
};

export default function ResumeScoreTool({ profile }) {
  const [input, setInput] = useState("");
  const [fileDoc, setFileDoc] = useState(null);
  const [result, setResult] = useState(null);
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);

  function handleFile(f, n) {
    if (!f) { setFileDoc(null); return; }
    setFileDoc(f); setInput(`[${n} loaded]`);
  }

  async function run() {
    setLoading(true); setResult(null); setRaw("");
    const content = fileDoc ? fileDoc.content : input;
    const r = await callClaude(content, SYS.resumescore);
    setRaw(r); setResult(parseJSON(r)); setLoading(false);
  }

  const canRun = fileDoc || (input.trim() && !input.startsWith("["));
  const passed = result?.checks?.filter(c => c.pass).length ?? 0;
  const total = result?.checks?.length ?? 13;

  function scoreColor(s) {
    if (s >= 75) return { bg: "#e8f5e9", text: "#2e7d32" };
    if (s >= 50) return { bg: "#fff8e1", text: "#e65100" };
    return { bg: "#fce4ec", text: "#b71c1c" };
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "9px 14px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
        Scores your resume against the <strong>Per Scholas AWS re/Start scorecard</strong> — 13 rules based on Anita Preer's feedback standards.
      </div>

      <UploadZone label="Upload your resume" onFile={handleFile} />
      {!fileDoc && <Textarea value={input} onChange={setInput} rows={8} placeholder="Or paste your resume text here..." />}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={run} disabled={loading || !canRun} style={{ padding: "8px 20px" }}>{loading ? "Scoring..." : "Score Resume"}</button>
        {(input || fileDoc) && <button onClick={() => { setInput(""); setResult(null); setFileDoc(null); setRaw(""); }} style={{ padding: "8px 14px", color: "var(--color-text-secondary)" }}>Clear</button>}
        <HistoryPanel profileId={profile.id} toolId="resumescore" onRestore={t => { setResult(null); setRaw(t); }} />
      </div>

      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
          {/* Score header */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
            <div style={{ ...scoreColor(result.score ?? 0), borderRadius: "var(--border-radius-md)", padding: "10px 20px", textAlign: "center", minWidth: 90 }}>
              <p style={{ fontSize: 11, margin: "0 0 2px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "inherit" }}>Score</p>
              <p style={{ fontSize: 30, fontWeight: 600, margin: 0, color: "inherit" }}>{result.score}<span style={{ fontSize: 15 }}>/100</span></p>
            </div>
            <div style={{ ...scoreColor(result.score ?? 0), borderRadius: "var(--border-radius-md)", padding: "10px 16px", flex: 1 }}>
              <p style={{ fontSize: 11, margin: "0 0 4px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "inherit" }}>{passed}/{total} rules passed</p>
              <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0, color: "inherit" }}>{result.summary}</p>
            </div>
          </div>

          {/* Top fixes */}
          {result.topFixes?.length > 0 && (
            <div style={{ background: "var(--color-background-warning)", borderRadius: "var(--border-radius-md)", padding: "10px 14px" }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-warning)", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Top fixes</p>
              {result.topFixes.map((fix, i) => (
                <p key={i} style={{ fontSize: 13, color: "var(--color-text-warning)", margin: "0 0 4px", lineHeight: 1.5 }}>
                  {i + 1}. {fix}
                </p>
              ))}
            </div>
          )}

          {/* 13-rule checklist */}
          <div>
            <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: "0 0 10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>13-rule scorecard</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {result.checks?.map((check, i) => (
                <div key={i} style={{ background: check.pass ? "var(--color-background-success)" : "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "8px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{check.pass ? "✅" : "❌"}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 2px", color: check.pass ? "var(--color-text-success)" : "var(--color-text-primary)" }}>
                      {RULE_LABELS[check.id] || check.id}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.5 }}>{check.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => saveHistory(profile.id, "resumescore", { text: raw, label: `Score: ${result.score}/100` })}
            style={{ fontSize: 12, padding: "5px 14px", alignSelf: "flex-start", background: "var(--color-background-success)", color: "var(--color-text-success)", border: "0.5px solid var(--color-border-success)" }}
          >
            Save result
          </button>
        </div>
      )}

      {raw && !result && (
        <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1rem", marginTop: 4 }}>
          <p style={{ fontSize: 13, whiteSpace: "pre-wrap", color: "var(--color-text-primary)", margin: 0 }}>{raw}</p>
        </div>
      )}
    </div>
  );
}
