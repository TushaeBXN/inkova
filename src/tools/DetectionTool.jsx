import { useState } from "react";
import { callClaude } from "../api.js";
import { SYS } from "../prompts.js";
import { parseJSON } from "../api.js";
import { saveHistory } from "../storage.js";
import { scoreColor, verdictColor } from "../utils.js";
import { TOOLS } from "../constants.js";
import UploadZone from "../components/UploadZone.jsx";
import HistoryPanel from "../components/HistoryPanel.jsx";
import Textarea from "../components/Textarea.jsx";

const PLACEHOLDERS = {
  aidetector: "Paste text to check for AI patterns...",
  grammar: "Paste text to check grammar...",
  plagiarism: "Paste text to check originality...",
};

function ScoreCard({ scoreVal, label, invert = false }) {
  const sc = scoreColor(scoreVal, invert);
  return (
    <div style={{ background: sc.bg, borderRadius: "var(--border-radius-md)", padding: "10px 16px", textAlign: "center", minWidth: 80 }}>
      <p style={{ fontSize: 11, color: sc.text, margin: "0 0 2px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 500, margin: 0, color: sc.text }}>{scoreVal}<span style={{ fontSize: 14 }}>%</span></p>
    </div>
  );
}

export default function DetectionTool({ toolId, profile }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileDoc, setFileDoc] = useState(null);
  const [humanized, setHumanized] = useState("");
  const [humanizing, setHumanizing] = useState(false);
  const [recheckResult, setRecheckResult] = useState(null);
  const [rechecking, setRechecking] = useState(false);
  const tool = TOOLS.find(t => t.id === toolId);

  function handleFile(f, name) {
    if (!f) { setFileDoc(null); return; }
    setFileDoc({ content: f.content, name });
    setInput(`[${name} loaded]`);
  }

  async function run() {
    setLoading(true); setResult(null); setRaw(""); setHumanized(""); setRecheckResult(null);
    const content = fileDoc ? fileDoc.content : input;
    const r = await callClaude(content, SYS[toolId]);
    setRaw(r); setResult(parseJSON(r)); setLoading(false);
  }

  async function humanizeFix() {
    setHumanizing(true); setHumanized(""); setRecheckResult(null);
    const flagged = (result?.sentences || []).filter(s => s.score >= 55).map(s => s.text).join("\n");
    const text = fileDoc ? fileDoc.content : input;
    const r = await callClaude(`FULL TEXT:\n${text}\n\nAI-FLAGGED:\n${flagged || "(rewrite all)"}`, SYS.humanizeFix);
    setHumanized(r); setHumanizing(false);
  }

  async function recheck() {
    setRechecking(true);
    const r = await callClaude(humanized, SYS.aidetector);
    setRecheckResult(parseJSON(r)); setRechecking(false);
  }

  const canRun = fileDoc || (input.trim() && !input.startsWith("["));

  function renderDetectorResult(res, showPipeline) {
    if (!res) return null;
    const vc = verdictColor(res.verdict || "");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
          <ScoreCard scoreVal={res.score ?? 0} label="AI Score" />
          <div style={{ background: vc.bg, borderRadius: "var(--border-radius-md)", padding: "10px 16px", flex: 1, minWidth: 120 }}>
            <p style={{ fontSize: 11, color: vc.text, margin: "0 0 2px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Verdict</p>
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0, color: vc.text }}>{res.verdict}</p>
            {showPipeline && (res.score ?? 0) >= 30 && <p style={{ fontSize: 12, color: vc.text, margin: "4px 0 0", opacity: 0.85 }}>Use "Fix & Humanize" below to reduce this score.</p>}
          </div>
        </div>
        {res.summary && <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>{res.summary}</p>}
        {res.sentences?.length > 0 && (
          <div>
            <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: "0 0 8px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Sentence breakdown</p>
            <div style={{ lineHeight: 2.2, fontSize: 14 }}>
              {res.sentences.map((s, i) => {
                const c = scoreColor(s.score || 0, false);
                return <span key={i} title={`${s.score}% AI`} style={{ background: c.bg, color: c.text, borderRadius: 3, padding: "2px 4px", marginRight: 3, cursor: "default" }}>{s.text}</span>;
              })}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              {[{ l: "Human (0–33%)", bg: "#e8f5e9", c: "#2e7d32" }, { l: "Mixed (34–66%)", bg: "#fff8e1", c: "#e65100" }, { l: "AI (67–100%)", bg: "#fce4ec", c: "#b71c1c" }].map(x => (
                <span key={x.l} style={{ fontSize: 11, background: x.bg, color: x.c, padding: "2px 8px", borderRadius: 4 }}>{x.l}</span>
              ))}
            </div>
          </div>
        )}
        {showPipeline && (res.score ?? 0) >= 30 && (
          <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", margin: "0 0 4px" }}>Fix AI-flagged sections</p>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>Rewrites flagged sentences using the style proven to score 0% on detectors.</p>
            <button onClick={humanizeFix} disabled={humanizing} style={{ padding: "8px 20px", background: "var(--color-background-success)", color: "var(--color-text-success)", border: "0.5px solid var(--color-border-success)" }}>
              {humanizing ? "Rewriting..." : "Fix & Humanize"}
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderGrammarResult() {
    const vc = verdictColor(result.verdict || "");
    const sc2 = scoreColor(result.score ?? 0, true);
    return (
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ background: sc2.bg, borderRadius: "var(--border-radius-md)", padding: "10px 16px", textAlign: "center", minWidth: 80 }}>
            <p style={{ fontSize: 11, color: sc2.text, margin: "0 0 2px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Grammar</p>
            <p style={{ fontSize: 26, fontWeight: 500, margin: 0, color: sc2.text }}>{result.score ?? 0}<span style={{ fontSize: 14 }}>%</span></p>
          </div>
          <div style={{ background: vc.bg, borderRadius: "var(--border-radius-md)", padding: "10px 16px", flex: 1 }}>
            <p style={{ fontSize: 11, color: vc.text, margin: "0 0 2px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Verdict</p>
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0, color: vc.text }}>{result.verdict}</p>
          </div>
        </div>
        {result.corrected && (
          <div>
            <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px 14px", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", color: "var(--color-text-primary)" }}>{result.corrected}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => navigator.clipboard.writeText(result.corrected)} style={{ fontSize: 12, padding: "4px 12px" }}>Copy corrected</button>
              <button onClick={() => saveHistory(profile.id, "grammar", { text: result.corrected, label: "Grammar corrected" })} style={{ fontSize: 12, padding: "4px 12px", background: "var(--color-background-success)", color: "var(--color-text-success)", border: "0.5px solid var(--color-border-success)" }}>Save</button>
            </div>
          </div>
        )}
        {result.issues?.length > 0 && (
          <div>
            <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: "0 0 8px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{result.issues.length} issues found</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {result.issues.map((issue, i) => {
                const tc = { Grammar: { bg: "var(--color-background-danger)", text: "var(--color-text-danger)" }, Spelling: { bg: "var(--color-background-warning)", text: "var(--color-text-warning)" }, Punctuation: { bg: "var(--color-background-info)", text: "var(--color-text-info)" }, Style: { bg: "var(--color-background-secondary)", text: "var(--color-text-secondary)" } }[issue.type] || { bg: "var(--color-background-secondary)", text: "var(--color-text-secondary)" };
                return (
                  <div key={i} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "8px 12px", fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ background: tc.bg, color: tc.text, fontSize: 11, padding: "1px 7px", borderRadius: 4, fontWeight: 500 }}>{issue.type}</span>
                      <span style={{ color: "var(--color-text-danger)", textDecoration: "line-through" }}>{issue.original}</span>
                      <span style={{ color: "var(--color-text-tertiary)" }}>→</span>
                      <span style={{ color: "var(--color-text-success)" }}>{issue.correction}</span>
                    </div>
                    {issue.note && <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: 12 }}>{issue.note}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderPlagiarismResult() {
    const vc = verdictColor(result.verdict || "");
    const sc2 = scoreColor(result.score ?? 0, false);
    return (
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ background: sc2.bg, borderRadius: "var(--border-radius-md)", padding: "10px 16px", textAlign: "center", minWidth: 80 }}>
            <p style={{ fontSize: 11, color: sc2.text, margin: "0 0 2px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Originality</p>
            <p style={{ fontSize: 26, fontWeight: 500, margin: 0, color: sc2.text }}>{result.score ?? 0}<span style={{ fontSize: 14 }}>%</span></p>
          </div>
          <div style={{ background: vc.bg, borderRadius: "var(--border-radius-md)", padding: "10px 16px", flex: 1 }}>
            <p style={{ fontSize: 11, color: vc.text, margin: "0 0 2px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Verdict</p>
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0, color: vc.text }}>{result.verdict}</p>
          </div>
        </div>
        {result.summary && <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>{result.summary}</p>}
        {result.flags?.length > 0 && (
          <div>
            <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: "0 0 8px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{result.flags.length} flags</p>
            {result.flags.map((f, i) => {
              const sv = { low: { bg: "var(--color-background-info)", text: "var(--color-text-info)" }, medium: { bg: "var(--color-background-warning)", text: "var(--color-text-warning)" }, high: { bg: "var(--color-background-danger)", text: "var(--color-text-danger)" } }[f.severity] || { bg: "var(--color-background-info)", text: "var(--color-text-info)" };
              return (
                <div key={i} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "8px 12px", fontSize: 13, marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ background: sv.bg, color: sv.text, fontSize: 11, padding: "1px 7px", borderRadius: 4, fontWeight: 500, textTransform: "capitalize" }}>{f.severity}</span>
                    <span style={{ color: "var(--color-text-primary)", fontStyle: "italic" }}>"{f.text}"</span>
                  </div>
                  <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: 12 }}>{f.reason}</p>
                </div>
              );
            })}
            <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 6 }}>Note: AI-based originality analysis — not a live web scan.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <UploadZone label="Upload a document to analyze" onFile={handleFile} />
      {!fileDoc && <Textarea value={input} onChange={setInput} rows={7} placeholder={PLACEHOLDERS[toolId]} />}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={run} disabled={loading || !canRun} style={{ padding: "8px 20px" }}>{loading ? "Analyzing..." : tool.label}</button>
        {(input || fileDoc) && (
          <button onClick={() => { setInput(""); setResult(null); setFileDoc(null); setRaw(""); setHumanized(""); setRecheckResult(null); }} style={{ padding: "8px 14px", color: "var(--color-text-secondary)" }}>Clear</button>
        )}
        <HistoryPanel profileId={profile.id} toolId={toolId} onRestore={t => { setResult(null); setRaw(t); }} />
      </div>

      {toolId === "aidetector" && (result || raw) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          {result ? renderDetectorResult(result, true) : <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1rem" }}><p style={{ fontSize: 13, whiteSpace: "pre-wrap", margin: 0 }}>{raw}</p></div>}
          {humanized && (
            <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", margin: 0 }}>Humanized version</p>
                <span style={{ fontSize: 11, background: "var(--color-background-success)", color: "var(--color-text-success)", padding: "2px 8px", borderRadius: 4 }}>Ready to submit</span>
              </div>
              <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "12px 14px", fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap", color: "var(--color-text-primary)", maxHeight: 200, overflowY: "auto" }}>{humanized}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => navigator.clipboard.writeText(humanized)} style={{ fontSize: 12, padding: "5px 14px" }}>Copy</button>
                <button onClick={recheck} disabled={rechecking} style={{ fontSize: 12, padding: "5px 14px", background: "var(--color-background-info)", color: "var(--color-text-info)", border: "0.5px solid var(--color-border-info)" }}>{rechecking ? "Re-checking..." : "Re-check AI Score"}</button>
                <button onClick={() => saveHistory(profile.id, "aidetector", { text: humanized, label: "Humanized result" })} style={{ fontSize: 12, padding: "5px 14px", background: "var(--color-background-success)", color: "var(--color-text-success)", border: "0.5px solid var(--color-border-success)" }}>Save</button>
              </div>
              {recheckResult && (
                <div style={{ paddingTop: 8, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                  {renderDetectorResult(recheckResult, false)}
                  {(recheckResult.score ?? 100) <= (result?.score ?? 0) && (
                    <div style={{ background: "var(--color-background-success)", borderRadius: "var(--border-radius-md)", padding: "10px 14px", fontSize: 13, color: "var(--color-text-success)", marginTop: 10 }}>
                      Score dropped {result.score}% → {recheckResult.score}%. Safe to submit.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {toolId === "grammar" && result && renderGrammarResult()}
      {toolId === "plagiarism" && result && renderPlagiarismResult()}
      {!result && raw && (
        <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1rem", marginTop: 4 }}>
          <p style={{ fontSize: 13, whiteSpace: "pre-wrap", color: "var(--color-text-primary)", margin: 0 }}>{raw}</p>
        </div>
      )}
    </div>
  );
}
