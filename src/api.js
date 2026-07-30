// Model is configurable via .env — defaults to mistral
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || "mistral";
const OLLAMA_URL = "http://localhost:11434/api/chat";

export async function callClaude(content, system) {
  const userContent = typeof content === "string" ? content : JSON.stringify(content);
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
    }),
  });
  const d = await res.json();
  return d.message?.content || "Something went wrong.";
}

export async function callClaudeConvo(messages, system) {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  const d = await res.json();
  return d.message?.content || "Something went wrong.";
}

export function parseJSON(raw) {
  try { return JSON.parse(raw); } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) try { return JSON.parse(m[0]); } catch {}
    return null;
  }
}
