import * as mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).href;

async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }
  return text;
}

export function readFileAsText(f) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsText(f);
  });
}

// Kept for backward compat but unused with Ollama
export function readFileAsBase64(f) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(f);
  });
}

export async function extractFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "txt") return { type: "text", content: await readFileAsText(file) };
  if (ext === "pdf") return { type: "text", content: await extractPdfText(file) };
  if (ext === "docx") {
    const buf = await file.arrayBuffer();
    const r = await mammoth.extractRawText({ arrayBuffer: buf });
    return { type: "text", content: r.value };
  }
  throw new Error("Use .pdf, .docx, or .txt");
}

export function scoreColor(score, invert = false) {
  const s = invert ? 100 - score : score;
  if (s <= 33) return { bg: "#e8f5e9", text: "#2e7d32" };
  if (s <= 66) return { bg: "#fff8e1", text: "#e65100" };
  return { bg: "#fce4ec", text: "#b71c1c" };
}

export function verdictColor(verdict) {
  const v = verdict?.toLowerCase() || "";
  if (v.includes("human") || v.includes("original"))
    return { bg: "var(--color-background-success)", text: "var(--color-text-success)" };
  if (v.includes("mixed") || v.includes("concern") || v.includes("likely"))
    return { bg: "var(--color-background-warning)", text: "var(--color-text-warning)" };
  return { bg: "var(--color-background-danger)", text: "var(--color-text-danger)" };
}

export function printDoc(text, title) {
  const lines = text.split("\n");
  let html = "";
  let inList = false;
  for (const line of lines) {
    const l = line.trim();
    if (!l) { if (inList) { html += "</ul>"; inList = false; } html += "<div style='height:3px'></div>"; continue; }
    if (l.startsWith("# "))  { html += `<h1>${l.slice(2)}</h1>`; continue; }
    if (l.startsWith("## ")) { html += `<h2>${l.slice(3)}</h2>`; continue; }
    if (l.startsWith("- ") || l.startsWith("• ") || l.startsWith("● ") || l.startsWith("* ")) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += `<li>${l.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</li>`;
      continue;
    }
    if (l === "---") { if (inList) { html += "</ul>"; inList = false; } html += "<hr>"; continue; }
    if (inList) { html += "</ul>"; inList = false; }
    html += `<p>${l.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>`;
  }
  if (inList) html += "</ul>";
  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>
@page{margin:0.5in}
*{box-sizing:border-box}
body{font-family:Arial,sans-serif;font-size:11.5pt;line-height:1.45;margin:0;color:#000}
h1{font-size:17.5pt;font-weight:700;margin:0 0 2px}
h2{font-size:11.5pt;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #000;padding-bottom:1px;margin:8px 0 3px}
p{margin:2px 0;font-size:11.5pt}
ul{margin:2px 0 4px 16px;padding:0}
li{margin:1px 0;font-size:11.5pt;line-height:1.45}
hr{border:none;border-top:0.5px solid #aaa;margin:5px 0}
strong{font-weight:700}
  </style></head><body>${html}</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}
