import { useState } from "react";
import { callClaude } from "../api.js";
import { SYS } from "../prompts.js";
import { saveHistory } from "../storage.js";
import { printDoc } from "../utils.js";
import UploadZone from "../components/UploadZone.jsx";
import HistoryPanel from "../components/HistoryPanel.jsx";
import Textarea from "../components/Textarea.jsx";

export default function CareerTool({ toolId, profile }) {
  const isResume = toolId === "resume";
  const [resumeType, setResumeType] = useState("standard");
  const [f1, setF1] = useState(""); const [f1doc, setF1doc] = useState(null);
  const [f2, setF2] = useState(""); const [f2doc, setF2doc] = useState(null);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  function h1(f, n) { if (!f) { setF1doc(null); setF1(""); return; } setF1doc(f); setF1(`[${n} loaded]`); }
  function h2(f, n) { if (!f) { setF2doc(null); setF2(""); return; } setF2doc(f); setF2(`[${n} loaded]`); }

  const activeSystem = isResume ? (resumeType === "academic" ? SYS.resumeAcademic : SYS.resume) : SYS.coverletter;

  async function run() {
    setLoading(true); setResult("");
    const r_text = f1doc ? f1doc.content : f1;
    const j_text = f2doc ? f2doc.content : f2;
    let content;
    if (isResume) {
      const instruction = resumeType === "academic" ? "Rewrite this as a comprehensive academic CV." : "Rewrite my resume to match the job. Keep it to 1-2 pages max.";
      content = `MY RESUME:\n${r_text}\n\nJOB:\n${j_text}\n\n${instruction}`;
    } else {
      content = `NAME: ${name || "Not provided"}\nJOB: ${jobTitle}\nCOMPANY: ${company || "Not provided"}\nBACKGROUND:\n${r_text}${j_text ? `\nJOB DESCRIPTION:\n${j_text}` : ""}`;
    }
    const r = await callClaude(content, activeSystem);
    setResult(r); setLoading(false);
  }

  const canRun = isResume
    ? (f1doc || f1.trim()) && (resumeType === "academic" || (f2doc || f2.trim()))
    : jobTitle.trim() && (f1doc || f1.trim());

  function Field({ label, value, set, placeholder }) {
    return (
      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>{label}</label>
        <input value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
          style={{ width: "100%", fontSize: 13, padding: "8px 12px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", boxSizing: "border-box" }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {isResume && (
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>Resume type</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ id: "standard", label: "Standard (1–2 pages)", icon: "📄" }, { id: "academic", label: "Academic / CV (no limit)", icon: "🎓" }].map(t => (
              <button key={t.id} onClick={() => setResumeType(t.id)} style={{ flex: 1, padding: "8px 12px", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: resumeType === t.id ? "var(--color-background-info)" : "transparent", color: resumeType === t.id ? "var(--color-text-info)" : "var(--color-text-secondary)", border: resumeType === t.id ? "1px solid var(--color-border-info)" : "0.5px solid var(--color-border-secondary)", borderRadius: "var(--border-radius-md)", cursor: "pointer", fontWeight: resumeType === t.id ? 500 : 400 }}>
                <span style={{ fontSize: 15 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: "6px 0 0", lineHeight: 1.5 }}>
            {resumeType === "standard" ? "Output trimmed to 1–2 pages. Most recent experience and top projects prioritized." : "Academic CVs have no page limit. All research, publications, and teaching included in full."}
          </p>
        </div>
      )}
      {!isResume && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 130 }}><Field label="Your name" value={name} set={setName} placeholder="Your name" /></div>
          <div style={{ flex: 1, minWidth: 130 }}><Field label="Company" value={company} set={setCompany} placeholder="Company name" /></div>
        </div>
      )}
      {!isResume && <Field label="Job title applying for" value={jobTitle} set={setJobTitle} placeholder="e.g. Technical Support Engineer" />}
      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>{isResume ? "Your current resume" : "Your resume or background"}</label>
        <UploadZone label={isResume ? "Upload your resume" : "Upload your resume (PDF, DOCX, TXT)"} onFile={h1} />
        {!f1doc && <div style={{ marginTop: 8 }}><Textarea value={f1} onChange={setF1} rows={isResume ? 5 : 3} placeholder={isResume ? "Or paste your resume text..." : "Or describe your experience..."} small /></div>}
      </div>
      {(isResume && resumeType === "standard" || !isResume) && (
        <div>
          <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>Job description {isResume ? "" : "(recommended)"}</label>
          <UploadZone label="Upload the job posting" onFile={h2} />
          {!f2doc && <div style={{ marginTop: 8 }}><Textarea value={f2} onChange={setF2} rows={3} placeholder="Or paste the job description..." small /></div>}
        </div>
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={run} disabled={loading || !canRun} style={{ padding: "8px 20px" }}>{loading ? "Writing..." : isResume ? "Generate Resume" : "Write Cover Letter"}</button>
        <HistoryPanel profileId={profile.id} toolId={toolId} onRestore={setResult} />
      </div>
      {result && (
        <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", padding: "1rem 1.25rem", marginTop: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p style={{ fontSize: 11, color: "var(--color-text-tertiary)", margin: 0, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Result</p>
            {isResume && <span style={{ fontSize: 11, background: "var(--color-background-info)", color: "var(--color-text-info)", padding: "2px 8px", borderRadius: 4 }}>{resumeType === "academic" ? "Academic CV — no page limit" : "1–2 page target"}</span>}
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: "var(--color-text-primary)", whiteSpace: "pre-wrap", margin: 0, maxHeight: 260, overflowY: "auto" }}>{result}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button onClick={() => navigator.clipboard.writeText(result)} style={{ fontSize: 12, padding: "4px 12px" }}>Copy</button>
            <button onClick={() => printDoc(result, isResume ? "Resume" : "Cover Letter")} style={{ fontSize: 12, padding: "4px 14px" }}>🖨 Print / Export (0.5" margins)</button>
            <button onClick={() => saveHistory(profile.id, toolId, { text: result, label: isResume ? `Resume — ${resumeType}` : `Cover Letter — ${jobTitle}` })} style={{ fontSize: 12, padding: "4px 12px", background: "var(--color-background-success)", color: "var(--color-text-success)", border: "0.5px solid var(--color-border-success)" }}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
