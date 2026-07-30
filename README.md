# Inkova

**The problem:** AI writing tools cost $20–$30/month per person, send your data to third-party servers, and still produce text that gets flagged as AI-generated. For families, that's $60–$120/month for something that doesn't even work reliably.

**The solution:** Inkova runs entirely on your own machine using Ollama — a free, open-source AI runtime. No subscriptions. No API keys. No data leaves your computer. One install, unlimited use for everyone in your household.

---

## What it does

12 AI-powered writing tools in one app, organized into three categories:

### Writing
| Tool | What it solves |
|---|---|
| **Brainstorm** | You have an idea but don't know where to start — talk it through with AI |
| **Write** | Need a blog post, email, story, or essay written from scratch |
| **Humanize** | AI wrote something for you but it reads like a robot — make it sound human |
| **Polish** | Your draft is good but needs grammar and flow cleanup without changing your voice |
| **Summarize** | Long document, need the key points fast |
| **Paraphrase** | Same content, different words and structure |

### Detection
| Tool | What it solves |
|---|---|
| **AI Detector** | Find out if your text will get flagged — sentence-level heatmap shows exactly which parts |
| **Grammar Check** | Full correction with an explanation of every issue found |
| **Plagiarism** | Originality analysis with flagged phrases and severity ratings |

### Career
| Tool | What it solves |
|---|---|
| **Resume** | Tailor your resume to a specific job description — 1–2 page standard or full academic CV |
| **Cover Letter** | A cover letter that reads 0% AI, built on a formula tested against Grammarly, plagiarism checkers, and Google Docs AI detection |
| **ATS Optimizer** | See your keyword match score, what's missing, and get rewritten bullets that pass ATS filters |

---

## Key features

- **Per-user profiles** — Netflix-style profile picker so each family member has their own history and saved results
- **Persistent history** — last 5 saved results per tool per profile, stored locally
- **Document upload** — drag and drop PDF, DOCX, or TXT into any tool
- **Print / Export** — recruiter-spec print formatting: 11.5pt body, 17.5pt name, 0.5" margins on all sides
- **Humanizer pipeline** — detect AI score → fix flagged sentences → re-check score, all in one workflow
- **Runs offline** — once the model is downloaded, no internet required

---

## How to set it up

### Step 1 — Install Ollama

Ollama is what runs the AI model on your computer.

```bash
brew install ollama
```

Then download the model (this is the one-time download, ~4GB):

```bash
ollama pull mistral
```

> **Older or slower computer?** Use `phi3:mini` instead — it's 2.3GB and responds in ~10 seconds. Less accurate on structured output but fast.
> ```bash
> ollama pull phi3:mini
> ```

### Step 2 — Clone and install Inkova

```bash
git clone https://github.com/TushaeBXN/inkova.git
cd inkova
npm install
```

### Step 3 — Configure

```bash
cp .env.example .env
```

Open `.env`. If you're using `mistral` (default), no changes needed. If you pulled `phi3:mini`:

```
VITE_OLLAMA_MODEL=phi3:mini
```

### Step 4 — Run it

Open two terminal tabs:

```bash
# Tab 1 — start the AI model server
ollama serve
```

```bash
# Tab 2 — start Inkova
cd inkova
npm run dev
```

Open your browser to `http://localhost:5173`

---

## How to use it

1. **Create a profile** — click the `+` on the home screen, pick a name, avatar, and color
2. **Pick a tool** from the left sidebar
3. **Paste text or upload a file** (PDF, DOCX, TXT supported everywhere)
4. **Click the action button** — the AI runs locally and returns a result
5. **Save results** to your profile history — retrieve them anytime with the History button

---

## How to deploy it (self-hosted)

Inkova calls Ollama at `http://localhost:11434` from the browser. To run it on a home server or VPS so your whole household can use it from any device:

### Option A — Home server (LAN only)

1. Install Ollama and Inkova on the server machine
2. Run Ollama with host binding:
   ```bash
   OLLAMA_HOST=0.0.0.0 ollama serve
   ```
3. Build Inkova for production:
   ```bash
   npm run build
   npm run preview -- --host
   ```
4. Anyone on your home network opens `http://<server-ip>:4173`

### Option B — VPS (internet accessible)

1. Deploy to any Linux VPS (DigitalOcean, Hetzner, Vultr)
2. Install Ollama: `curl -fsSL https://ollama.com/install.sh | sh`
3. Pull the model: `ollama pull mistral`
4. Build and serve Inkova behind Nginx or Caddy
5. Set `VITE_OLLAMA_MODEL` in your build environment

> ⚠️ If exposing to the internet, put Nginx in front and restrict `/api` access — Ollama has no auth by default.

---

## Project structure

```
inkova/
├── src/
│   ├── App.jsx
│   ├── constants.js       # Tools list, avatars, colors, modes
│   ├── prompts.js         # All AI system prompts
│   ├── api.js             # Ollama fetch calls
│   ├── storage.js         # localStorage profiles and history
│   ├── utils.js           # File extraction, print, color helpers
│   ├── index.css          # CSS variables and base styles
│   ├── main.jsx
│   ├── components/
│   │   ├── ProfileScreen.jsx
│   │   ├── Sidebar.jsx
│   │   ├── UploadZone.jsx
│   │   ├── ResultBox.jsx
│   │   ├── HistoryPanel.jsx
│   │   └── Textarea.jsx
│   └── tools/
│       ├── BrainstormTool.jsx
│       ├── WriteTool.jsx
│       ├── TextTool.jsx       # Humanize, Polish, Summarize, Paraphrase
│       ├── DetectionTool.jsx  # AI Detector, Grammar, Plagiarism
│       ├── ATSTool.jsx
│       └── CareerTool.jsx     # Resume, Cover Letter
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| AI runtime | Ollama (local) |
| Default model | mistral (7B) |
| DOCX parsing | mammoth.js |
| PDF parsing | pdfjs-dist |
| Storage | localStorage |

---

## Proven results

Tested against Grammarly AI detector, plagiarism-online.org, and Google Docs AI detection:

- Cover letter: **0% AI · 0% grammar · 0% plagiarism**
- Resume humanizer: 1–2 minor grammar suggestions max across a full document

---

## License

GNU Affero General Public License v3.0 — you can use, run, and modify this freely. If you distribute it or run it as a hosted service, your version must also be open-sourced under the same license.

---

## Built by

Brian Thomas · Founder, [Anthos Intelligence Company](https://github.com/TushaeBXN)
