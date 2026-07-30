import { useState } from "react";
import { callClaude } from "../api.js";
import { SYS } from "../prompts.js";
import { saveHistory } from "../storage.js";
import { TOOLS } from "../constants.js";
import UploadZone from "../components/UploadZone.jsx";
import ResultBox from "../components/ResultBox.jsx";
import HistoryPanel from "../components/HistoryPanel.jsx";
import Textarea from "../components/Textarea.jsx";

const PLACEHOLDERS = {
  humanize: "Paste AI-generated text here...",
  polish: "Paste your draft here...",
  summarize: "Paste any text to summarize...",
  paraphrase: "Paste text to rewrite...",
};

export default function TextTool({ toolId, profile }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileDoc, setFileDoc] = useState(null);
  const tool = TOOLS.find(t => t.id === toolId);

  function handleFile(f, name) {
    if (!f) { setFileDoc(null); return; }
    setFileDoc({ content: f.content, name });
    setInput(`[${name} loaded]`);
  }

  async function run() {
    setLoading(true); setResult("");
    const content = fileDoc ? `${fileDoc.content}` : input;
    const r = await callClaude(content, SYS[toolId]);
    setResult(r); setLoading(false);
  }

  const canRun = fileDoc || (input.trim() && !input.startsWith("["));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <UploadZone label={`Upload a document to ${toolId}`} onFile={handleFile} />
      {!fileDoc && <Textarea value={input} onChange={setInput} rows={7} placeholder={PLACEHOLDERS[toolId]} />}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={run} disabled={loading || !canRun} style={{ padding: "8px 20px" }}>{loading ? "Working..." : tool.label}</button>
        {(input || fileDoc) && (
          <button onClick={() => { setInput(""); setResult(""); setFileDoc(null); }} style={{ padding: "8px 14px", color: "var(--color-text-secondary)" }}>Clear</button>
        )}
        <HistoryPanel profileId={profile.id} toolId={toolId} onRestore={setResult} />
      </div>
      {result && (
        <ResultBox
          text={result}
          onCopy={() => navigator.clipboard.writeText(result)}
          onSave={() => saveHistory(profile.id, toolId, { text: result, label: input.slice(0, 50) })}
        />
      )}
    </div>
  );
}
