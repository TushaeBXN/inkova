import { useState } from "react";
import { TOOLS } from "./constants.js";
import ProfileScreen from "./components/ProfileScreen.jsx";
import Sidebar from "./components/Sidebar.jsx";
import BrainstormTool from "./tools/BrainstormTool.jsx";
import WriteTool from "./tools/WriteTool.jsx";
import TextTool from "./tools/TextTool.jsx";
import DetectionTool from "./tools/DetectionTool.jsx";
import ATSTool from "./tools/ATSTool.jsx";
import CareerTool from "./tools/CareerTool.jsx";
import ResumeScoreTool from "./tools/ResumeScoreTool.jsx";

export default function App() {
  const [screen, setScreen] = useState("profiles");
  const [profile, setProfile] = useState(null);
  const [active, setActive] = useState("brainstorm");
  const tool = TOOLS.find(t => t.id === active);

  if (screen === "profiles") return (
    <ProfileScreen onSelect={p => { setProfile(p); setScreen("app"); }} />
  );

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "var(--font-sans)", background: "var(--color-background-primary)" }}>
      <Sidebar active={active} setActive={setActive} profile={profile} onSwitch={() => setScreen("profiles")} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "13px 20px 11px", borderBottom: "0.5px solid var(--color-border-tertiary)", flexShrink: 0 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)" }}>{tool.icon} {tool.label}</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>{tool.desc}</p>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
          {active === "brainstorm" && <BrainstormTool profile={profile} />}
          {active === "write" && <WriteTool profile={profile} />}
          {["humanize", "polish", "summarize", "paraphrase"].includes(active) && <TextTool toolId={active} profile={profile} />}
          {["aidetector", "grammar", "plagiarism"].includes(active) && <DetectionTool toolId={active} profile={profile} />}
          {active === "ats" && <ATSTool profile={profile} />}
          {["resume", "coverletter"].includes(active) && <CareerTool toolId={active} profile={profile} />}
          {active === "resumescore" && <ResumeScoreTool profile={profile} />}
        </div>
      </div>
    </div>
  );
}
