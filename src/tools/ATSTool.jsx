import { useState } from "react";
import { callClaude, parseJSON } from "../api.js";
import { SYS } from "../prompts.js";
import UploadZone from "../components/UploadZone.jsx";
import Textarea from "../components/Textarea.jsx";

export default function ATSTool() {
  const [resume, setResume] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeDoc, setResumeDoc] = useState(null);
  const [jobDoc, setJobDoc] = useState(null);

  function handleResume(f, n) { if (!f) { setResumeDoc(null); setResume(""); return; } setResumeDoc(f); setResume(`[${n} loaded]`); }
  function handleJob(f, n) { if (!f) { setJobDoc(null); setJobDesc(""); return; } setJobDoc(f); setJobDesc(`[${n} loaded]`); }

  async function run() {
    setLoading(true); setResult(null); setRaw("");
    const r_text = resumeDoc ? resumeDoc.content : resume;
    const j_text = jobDoc ? jobDoc.content : jobDesc;
    const content = `RESUME:\n${r_text}\n\nJOB DESCRIPTION:\n${j_text}`;
    const r = await callClaude(content, SYS.ats);
    setRaw(r); setResult(parseJSON(r)); setLoading(false);
  }

  function sc(s) {
    if (s >= 75) return { bg: "var(--color-background-success)", text: "var(--color-text-success)" };
    if (s >= 50) return { bg: "var(--color-background-warning)", text: "var(--color-text-warning)" };
    return { bg: "var(--color-background-danger)", text: "var(--color-text-danger)" };
  }

  const canRun = (resumeDoc || resume.trim()) && (jobDoc || jobDesc.trim());

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "9px 14px", fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
        Paste or upload your resume and job description. Get a keyword match score, missing keywords, and rewritten bullets.
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>Your resume</label>
        <UploadZone label="Upload your resume" onFile={handleResume} />
        {!resumeDoc && <div style={{ marginTop: 8 }}><Textarea value={resume} onChange={setResume} rows={5} placeholder="Or paste your resume text here..." small /></div>}
      </div>
      <div>
        <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 5 }}>Job description</label>
        <UploadZone label="Upload the job posting" onFile={handleJob} />
        {!jobDoc && <div style={{ marginTop: 8 }}><Textarea value={jobDesc} onChange={setJobDesc} rows={5} placeholder="Or paste the job description here..." small /></div>}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={run} disabled={loading || !canRun} style={{ padding: "8px 20px" }}>{loading ? "Analyzing..." : "Run ATS Check"}</button>
        {(resume || jobDesc || resumeDoc || jobDoc) && (
          <button onClick={() => { setResume(""); setJobDesc(""); setResult(null); setResumeDoc(null); setJobDoc(null); setRaw(""); }} style={{ padding: "8px 14px", color: "var(--color-text-secondary)" }}>Clear</button>
        )}
      </div>
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
            <div style={{ ...sc(result.match_score || 0), borderRadius: "var(--border-radius-md)", padding: "10px 16px", textAlign: "center", minWidth: 80 }}>
              <p style={{ fontSize: 11, margin: "0 0 2px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "inherit" }}>ATS Score</p>
              <p style={{ fontSize: 26, fontWeight: 500, margin: 0, color: "inherit" }}>{result.match_score}<span style={{ fontSize: 14 }}>%</span></p>
            </div>
            <div style={{ ...sc(result.match_score || 0), borderRadius: "var(--border-radius-md)", padding: "10px 16px", flex: 1 }}>
              <p style={{ fontSize: 11, margin: "0 0 2px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "inherit" }}>Verdict</p>
              <p style={{ fontSize: 15, fontWeight: 500, margin: 0, color: "inherit" }}>{result.verdict}</p>
            </div>
          </div>
          {result.summary && <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: 0, padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)" }}>{result.summary}</p>}
          {result.found_keywords?.length > 0 && (
            <div>
              <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: "0 0 8px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Keywords found ({result.found_keywords.length})</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.found_keywords.map((k, i) => <span key={i} style={{ fontSize: 12, background: "var(--color-background-success)", color: "var(--color-text-success)", padding: "3px 10px", borderRadius: "var(--border-radius-md)" }}>{k}</span>)}
              </div>
            </div>
          )}
          {result.missing_keywords?.length > 0 && (
            <div>
              <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: "0 0 8px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Missing keywords ({result.missing_keywords.length})</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.missing_keywords.map((k, i) => <span key={i} style={{ fontSize: 12, background: "var(--color-background-danger)", color: "var(--color-text-danger)", padding: "3px 10px", borderRadius: "var(--border-radius-md)" }}>{k}</span>)}
              </div>
            </div>
          )}
          {result.suggested_rewrites?.length > 0 && (
            <div>
              <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", margin: "0 0 10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Suggested rewrites</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.suggested_rewrites.map((rw, i) => (
                  <div key={i} style={{ background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", padding: "10px 14px", fontSize: 13 }}>
                    <p style={{ margin: "0 0 6px", color: "var(--color-text-danger)", textDecoration: "line-through", lineHeight: 1.5 }}>{rw.original}</p>
                    <p style={{ margin: "0 0 8px", color: "var(--color-text-success)", lineHeight: 1.5 }}>{rw.improved}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {rw.keywords_added?.map((k, j) => <span key={j} style={{ fontSize: 11, background: "var(--color-background-info)", color: "var(--color-text-info)", padding: "2px 8px", borderRadius: 4 }}>+{k}</span>)}
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(rw.improved)} style={{ marginTop: 8, fontSize: 11, padding: "2px 10px" }}>Copy</button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
