import { useState, useRef, useEffect } from "react";

const organs = {
  brain: {
    name: "Brain", icon: "🧠", system: "Nervous System",
    description: "The command center of the body. It processes sensory information, controls movement, regulates vital functions, and is the seat of thought, memory, and emotion.",
    importance: 100, fact: "Your brain generates about 23 watts of power — enough to light a small bulb.",
    color: "#e879a0", soundDesc: "Alpha brainwave rhythm (~10Hz binaural tone)", soundType: "brainwave",
  },
  heart: {
    name: "Heart", icon: "❤️", system: "Cardiovascular System",
    description: "A powerful muscular pump beating ~100,000 times per day, circulating about 5 liters of blood per minute.",
    importance: 100, fact: "Over a lifetime your heart beats more than 2.5 billion times without a break.",
    color: "#ef4444", soundDesc: "Lub-dub heartbeat at ~72 BPM", soundType: "heartbeat",
  },
  lungs: {
    name: "Lungs", icon: "🫁", system: "Respiratory System",
    description: "A pair of spongy organs exchanging oxygen for CO₂ — roughly 20,000 breaths every single day.",
    importance: 100, fact: "Flattened out, your lungs' surface area would cover a tennis court.",
    color: "#60a5fa", soundDesc: "Soft whooshing breath (inhale & exhale)", soundType: "breath",
  },
  stomach: {
    name: "Stomach", icon: "🫙", system: "Digestive System",
    description: "A muscular bag using acid (pH ~2) and churning contractions to break food into chyme before passing it along.",
    importance: 75, fact: "Your stomach lining replaces itself every 3–4 days to avoid self-digestion.",
    color: "#f59e0b", soundDesc: "Gurgling borborygmi from peristaltic contractions", soundType: "gurgle",
  },
  liver: {
    name: "Liver", icon: "🫀", system: "Digestive / Metabolic System",
    description: "The body's largest internal organ — filters blood, produces bile, metabolizes nutrients, and detoxifies chemicals.",
    importance: 95, fact: "The liver performs over 500 functions and can regenerate after 75% removal.",
    color: "#a16207", soundDesc: "Quiet blood-flow whoosh detectable by Doppler", soundType: "bloodflow",
  },
  kidneys: {
    name: "Kidneys", icon: "🫘", system: "Urinary System",
    description: "Bean-shaped filters processing ~200 liters of blood daily, removing waste and regulating electrolytes.",
    importance: 90, fact: "Each kidney contains about 1 million filtering units called nephrons.",
    color: "#7c3aed", soundDesc: "Rushing blood-filtration flow sound", soundType: "filtration",
  },
  spine: {
    name: "Spine", icon: "🦴", system: "Skeletal / Nervous System",
    description: "33 stacked vertebrae protecting the spinal cord — the main highway for nerve signals between brain and body.",
    importance: 95, fact: "You are ~1cm taller in the morning — spinal discs compress throughout the day.",
    color: "#94a3b8", soundDesc: "Joint pop / crepitus crack from gas release", soundType: "crack",
  },
  intestines: {
    name: "Intestines", icon: "🌀", system: "Digestive System",
    description: "Small intestine (6–7m) absorbs nutrients; large intestine (1.5m) absorbs water and hosts trillions of gut bacteria.",
    importance: 85, fact: "The small intestine's villi-covered surface area equals the size of a studio apartment.",
    color: "#84cc16", soundDesc: "Deep gut gurgling from constant peristalsis", soundType: "gurgle2",
  },
};

function playOrganSound(soundType) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
  const t = ctx.currentTime;

  if (soundType === "heartbeat") {
    [0, 0.65].forEach(offset => {
      [{ f: 55, dt: 0 }, { f: 42, dt: 0.18 }].forEach(({ f, dt }) => {
        const osc = ctx.createOscillator(), g = ctx.createGain(), filt = ctx.createBiquadFilter();
        filt.type = "lowpass"; filt.frequency.value = 100;
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, t + offset + dt);
        osc.frequency.exponentialRampToValueAtTime(22, t + offset + dt + 0.16);
        g.gain.setValueAtTime(0, t + offset + dt);
        g.gain.linearRampToValueAtTime(1, t + offset + dt + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + offset + dt + 0.2);
        osc.connect(filt); filt.connect(g); g.connect(master);
        osc.start(t + offset + dt); osc.stop(t + offset + dt + 0.22);
      });
    });
    setTimeout(() => ctx.close(), 2000);
  } else if (soundType === "breath") {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2.5, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.3;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = "bandpass"; filt.frequency.value = 700; filt.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.7, t + 0.9);
    g.gain.linearRampToValueAtTime(0.1, t + 1.4); g.gain.linearRampToValueAtTime(0.6, t + 1.9);
    g.gain.linearRampToValueAtTime(0, t + 2.5);
    src.connect(filt); filt.connect(g); g.connect(master);
    src.start(t); src.stop(t + 2.6);
    setTimeout(() => ctx.close(), 3000);
  } else if (soundType === "brainwave") {
    [200, 210].forEach(freq => {
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = freq;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.28, t + 0.4);
      g.gain.setValueAtTime(0.28, t + 1.8); g.gain.linearRampToValueAtTime(0, t + 2.3);
      osc.connect(g); g.connect(master); osc.start(t); osc.stop(t + 2.4);
    });
    setTimeout(() => ctx.close(), 3000);
  } else if (soundType === "gurgle" || soundType === "gurgle2") {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 1.8, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = "bandpass";
    filt.frequency.value = soundType === "gurgle2" ? 160 : 260; filt.Q.value = 3;
    const lfo = ctx.createOscillator(), lfoG = ctx.createGain();
    lfo.frequency.value = 3.5; lfoG.gain.value = 90;
    lfo.connect(lfoG); lfoG.connect(filt.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.75, t + 0.2);
    g.gain.setValueAtTime(0.75, t + 1.3); g.gain.linearRampToValueAtTime(0, t + 1.8);
    src.connect(filt); filt.connect(g); g.connect(master);
    src.start(t); src.stop(t + 1.9); lfo.start(t); lfo.stop(t + 1.9);
    setTimeout(() => ctx.close(), 2500);
  } else if (soundType === "bloodflow" || soundType === "filtration") {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.4;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = "lowpass";
    filt.frequency.value = soundType === "filtration" ? 550 : 280;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.6, t + 0.3);
    g.gain.setValueAtTime(0.6, t + 1.4); g.gain.linearRampToValueAtTime(0, t + 2.0);
    src.connect(filt); filt.connect(g); g.connect(master);
    src.start(t); src.stop(t + 2.1);
    setTimeout(() => ctx.close(), 3000);
  } else if (soundType === "crack") {
    const len = Math.floor(ctx.sampleRate * 0.12);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.08));
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = "highpass"; filt.frequency.value = 180;
    const g = ctx.createGain(); g.gain.value = 1.2;
    src.connect(filt); filt.connect(g); g.connect(master);
    src.start(t); src.stop(t + 0.15);
    setTimeout(() => ctx.close(), 600);
  }
}

const BodySVG = ({ onOrganClick, activeOrgan }) => {
  const glow = (id) => activeOrgan === id
    ? `drop-shadow(0 0 10px ${organs[id].color}) drop-shadow(0 0 4px ${organs[id].color})`
    : "none";

  return (
    <svg viewBox="0 0 200 600" width="240" style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a2a4a" /><stop offset="100%" stopColor="#0d1a30" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3a5a" /><stop offset="100%" stopColor="#162030" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="45" rx="32" ry="38" fill="url(#skinGrad)" stroke="#3a5a8a" strokeWidth="1.5" />
      <rect x="88" y="78" width="24" height="16" rx="4" fill="url(#skinGrad)" stroke="#3a5a8a" strokeWidth="1" />
      <path d="M60 95 Q55 130 55 200 Q55 250 65 270 L135 270 Q145 250 145 200 Q145 130 140 95 Z" fill="url(#bodyGrad)" stroke="#3a5a8a" strokeWidth="1.5" />
      <line x1="55" y1="180" x2="145" y2="180" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.6" />
      <text x="148" y="183" fontSize="7" fill="#00f0ff" opacity="0.7">← slice</text>
      <path d="M65 270 Q60 310 70 330 L130 330 Q140 310 135 270 Z" fill="url(#bodyGrad)" stroke="#3a5a8a" strokeWidth="1" />
      <path d="M60 100 Q42 120 38 180 Q36 210 40 230" stroke="#3a5a8a" strokeWidth="18" strokeLinecap="round" fill="none" />
      <path d="M140 100 Q158 120 162 180 Q164 210 160 230" stroke="#3a5a8a" strokeWidth="18" strokeLinecap="round" fill="none" />
      <path d="M80 328 Q74 390 72 460 Q70 490 72 530" stroke="#3a5a8a" strokeWidth="20" strokeLinecap="round" fill="none" />
      <path d="M120 328 Q126 390 128 460 Q130 490 128 530" stroke="#3a5a8a" strokeWidth="20" strokeLinecap="round" fill="none" />

      <g style={{ cursor: "pointer", filter: glow("brain") }} onClick={() => onOrganClick("brain")}>
        <ellipse cx="100" cy="38" rx="22" ry="20" fill={activeOrgan === "brain" ? "#e879a0" : "#a83060"} opacity="0.85" />
        <text x="100" y="43" textAnchor="middle" fontSize="16">🧠</text>
        <rect x="78" y="18" width="44" height="40" fill="transparent" />
      </g>
      <g style={{ cursor: "pointer", filter: glow("lungs") }} onClick={() => onOrganClick("lungs")}>
        <ellipse cx="82" cy="130" rx="18" ry="25" fill={activeOrgan === "lungs" ? "#60a5fa" : "#1e4a8a"} opacity="0.85" />
        <ellipse cx="118" cy="130" rx="18" ry="25" fill={activeOrgan === "lungs" ? "#60a5fa" : "#1e4a8a"} opacity="0.85" />
        <text x="100" y="135" textAnchor="middle" fontSize="14">🫁</text>
        <rect x="62" y="105" width="76" height="50" fill="transparent" />
      </g>
      <g style={{ cursor: "pointer", filter: glow("heart") }} onClick={() => onOrganClick("heart")}>
        <ellipse cx="95" cy="130" rx="12" ry="14" fill={activeOrgan === "heart" ? "#ef4444" : "#8b1a1a"} opacity="0.9" />
        <text x="95" y="134" textAnchor="middle" fontSize="12">❤️</text>
        <rect x="83" y="116" width="24" height="28" fill="transparent" />
      </g>
      <g style={{ cursor: "pointer", filter: glow("liver") }} onClick={() => onOrganClick("liver")}>
        <ellipse cx="107" cy="175" rx="20" ry="14" fill={activeOrgan === "liver" ? "#a16207" : "#5a3500"} opacity="0.85" />
        <text x="107" y="179" textAnchor="middle" fontSize="11">🫀</text>
        <rect x="87" y="161" width="40" height="28" fill="transparent" />
      </g>
      <g style={{ cursor: "pointer", filter: glow("stomach") }} onClick={() => onOrganClick("stomach")}>
        <ellipse cx="88" cy="178" rx="13" ry="11" fill={activeOrgan === "stomach" ? "#f59e0b" : "#7a4e00"} opacity="0.85" />
        <text x="88" y="182" textAnchor="middle" fontSize="10">🫙</text>
        <rect x="75" y="167" width="26" height="22" fill="transparent" />
      </g>
      <g style={{ cursor: "pointer", filter: glow("kidneys") }} onClick={() => onOrganClick("kidneys")}>
        <ellipse cx="78" cy="210" rx="10" ry="14" fill={activeOrgan === "kidneys" ? "#7c3aed" : "#3a1a6a"} opacity="0.85" />
        <ellipse cx="122" cy="210" rx="10" ry="14" fill={activeOrgan === "kidneys" ? "#7c3aed" : "#3a1a6a"} opacity="0.85" />
        <text x="100" y="214" textAnchor="middle" fontSize="11">🫘</text>
        <rect x="65" y="196" width="72" height="28" fill="transparent" />
      </g>
      <g style={{ cursor: "pointer", filter: glow("intestines") }} onClick={() => onOrganClick("intestines")}>
        <ellipse cx="100" cy="245" rx="28" ry="20" fill={activeOrgan === "intestines" ? "#84cc16" : "#3a5500"} opacity="0.8" />
        <text x="100" y="249" textAnchor="middle" fontSize="13">🌀</text>
        <rect x="72" y="225" width="56" height="40" fill="transparent" />
      </g>
      <g style={{ cursor: "pointer", filter: glow("spine") }} onClick={() => onOrganClick("spine")}>
        {[100, 113, 126, 140, 155, 170, 185, 200, 215, 230].map((y, i) => (
          <rect key={i} x="97" y={y} width="6" height="8" rx="2"
            fill={activeOrgan === "spine" ? "#94a3b8" : "#3a4a5a"} opacity="0.9" />
        ))}
        <rect x="93" y="95" width="14" height="145" fill="transparent" />
      </g>
    </svg>
  );
};

function AIChat({ organName, organColor }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages([{ role: "ai", text: `Hi! I'm your anatomy guide for the ${organName}. Ask me anything!` }]);
    setInput("");
  }, [organName]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendQuestion = async () => {
    const q = input.trim();
    if (!q || loading) return;

    setInput("");
    setMessages(prev => [
      ...prev,
      { role: "user", text: q },
      { role: "ai", text: "", streaming: true }
    ]);

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/ask-organ", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organ: organName, question: q }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";
      let aiText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete line

        for (let line of lines) {
          line = line.trim();
          if (!line.startsWith("data: ")) continue;

          const payload = line.replace("data: ", "");

          if (payload === "[DONE]") {
            setLoading(false);
            return;
          }

          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              aiText += parsed.text;

              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "ai",
                  text: aiText,
                  streaming: true
                };
                return updated;
              });
            }
          } catch { }
        }
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          text: aiText
        };
        return updated;
      });

    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          text: "Error connecting to local AI."
        };
        return updated;
      });
    }

    setLoading(false);
  };


  return (
    <div style={{ background: "#060e1a", borderRadius: "12px", border: `1px solid ${organColor}44`, display: "flex", flexDirection: "column", height: "220px" }}>
      <div style={{ padding: "8px 12px", borderBottom: `1px solid ${organColor}33`, fontSize: "0.7rem", color: organColor, textTransform: "uppercase", letterSpacing: "1px" }}>
        🤖 Ask AI about the {organName}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "7px 11px", fontSize: "0.82rem", lineHeight: "1.5", color: "#c8dff0",
              background: m.role === "user" ? `${organColor}33` : "#0d1f3c",
              border: m.role === "user" ? `1px solid ${organColor}55` : "1px solid #1e3a5f",
              borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
            }}>
              {m.text}{m.streaming && <span style={{ opacity: 0.5 }}>▋</span>}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", padding: "8px", gap: "6px", borderTop: `1px solid ${organColor}22` }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendQuestion()}
          placeholder="Ask a question..."
          style={{ flex: 1, background: "#0a1930", border: `1px solid ${organColor}44`, borderRadius: "8px", padding: "7px 12px", color: "#e0f0ff", fontSize: "0.82rem", outline: "none" }}
        />
        <button
          onClick={sendQuestion}
          disabled={loading || !input.trim()}
          style={{ background: organColor, border: "none", borderRadius: "8px", padding: "7px 14px", color: "#fff", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading || !input.trim() ? 0.5 : 1, fontSize: "0.82rem" }}
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [activeOrgan, setActiveOrgan] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [playingSound, setPlayingSound] = useState(false);

  const handleOrganClick = (id) => { setActiveOrgan(id); setAnimKey(k => k + 1); };

  const handlePlaySound = () => {
    if (!activeOrgan || playingSound) return;
    setPlayingSound(true);
    playOrganSound(organs[activeOrgan].soundType);
    setTimeout(() => setPlayingSound(false), 2500);
  };

  const organ = activeOrgan ? organs[activeOrgan] : null;

  return (
    <div style={{ minHeight: "100vh", background: "#080f1e", fontFamily: "'Segoe UI',sans-serif", color: "#e0f0ff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#080f1e} ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:4px}
      `}</style>

      <div style={{ width: "100%", background: "linear-gradient(90deg,#0a1930,#0d2040)", padding: "14px 28px", borderBottom: "1px solid #1e3a5f", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "1.6rem" }}>🧬</span>
        <div>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#7dd3fc", letterSpacing: "1px" }}>Human Anatomy Explorer</div>
          <div style={{ fontSize: "0.72rem", color: "#4a8fbf" }}>Interactive DNA & Organ Discovery</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "24px", padding: "24px 20px", maxWidth: "980px", width: "100%", alignItems: "flex-start", flexWrap: "wrap", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "linear-gradient(135deg,#0a1930,#091525)", border: "1px solid #1e3a5f", borderRadius: "16px", padding: "18px" }}>
            <BodySVG onOrganClick={handleOrganClick} activeOrgan={activeOrgan} />
          </div>
          <div style={{ background: "#071020", borderRadius: "10px", padding: "9px 14px", fontSize: "0.73rem", color: "#4a8fbf", textAlign: "center", maxWidth: "240px", lineHeight: "1.6" }}>
            👆 Click any organ to explore it
          </div>
        </div>

        <div key={animKey} style={{ flex: 1, minWidth: "300px", background: "linear-gradient(135deg,#0d1f3c,#091528)", border: "1px solid #1e3a5f", borderRadius: "16px", padding: "22px", display: "flex", flexDirection: "column", gap: "14px", animation: organ ? "fadeIn 0.3s ease" : "none", minHeight: "520px" }}>
          {!organ ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, opacity: 0.35, gap: "14px" }}>
              <span style={{ fontSize: "3rem" }}>🔬</span>
              <p style={{ color: "#7dd3fc", fontSize: "0.9rem", textAlign: "center" }}>Select an organ on the body to begin your exploration.</p>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", borderBottom: "1px solid #1e3a5f", paddingBottom: "14px" }}>
                <div style={{ fontSize: "2rem", width: "52px", height: "52px", background: "#0a1930", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${organ.color}`, flexShrink: 0, boxShadow: `0 0 14px ${organ.color}55` }}>
                  {organ.icon}
                </div>
                <div>
                  <div style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff" }}>{organ.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "#4a8fbf", textTransform: "uppercase", letterSpacing: "1px" }}>{organ.system}</div>
                </div>
              </div>

              <div style={{ background: "#091528", borderRadius: "10px", padding: "12px 14px", borderLeft: `3px solid ${organ.color}` }}>
                <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "1px", color: "#4a9fd4", marginBottom: "7px" }}>What it does</div>
                <p style={{ fontSize: "0.86rem", lineHeight: "1.65", color: "#c8dff0" }}>{organ.description}</p>
              </div>

              <div style={{ background: "#091528", borderRadius: "10px", padding: "12px 14px", borderLeft: "3px solid #1e6fbf" }}>
                <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "1px", color: "#4a9fd4", marginBottom: "7px" }}>🔊 Sound</div>
                <p style={{ fontSize: "0.84rem", lineHeight: "1.55", color: "#c8dff0", marginBottom: "10px" }}>{organ.soundDesc}</p>
                <button onClick={handlePlaySound} disabled={playingSound} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: `${organ.color}22`, border: `1px solid ${organ.color}66`, color: organ.color, padding: "7px 16px", borderRadius: "8px", cursor: playingSound ? "default" : "pointer", fontSize: "0.82rem", fontWeight: 600, opacity: playingSound ? 0.6 : 1 }}>
                  {playingSound ? "🔊 Playing..." : "▶ Play Sound"}
                </button>
              </div>

              <div style={{ background: "#091528", borderRadius: "10px", padding: "12px 14px", borderLeft: "3px solid #1e6fbf" }}>
                <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "1px", color: "#4a9fd4", marginBottom: "9px" }}>Survival importance</div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ flex: 1, height: "8px", background: "#0a1930", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${organ.importance}%`, borderRadius: "10px", background: `linear-gradient(90deg,#1e6fbf,${organ.color})`, transition: "width 1s ease" }} />
                  </div>
                  <span style={{ fontSize: "0.85rem", color: organ.color, fontWeight: 700, minWidth: "36px" }}>{organ.importance}%</span>
                </div>
              </div>

              <div style={{ background: "#060e1a", borderRadius: "10px", padding: "12px 14px", borderLeft: `3px solid ${organ.color}` }}>
                <div style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "1px", color: "#4a9fd4", marginBottom: "7px" }}>✨ Fun fact</div>
                <p style={{ fontSize: "0.84rem", fontStyle: "italic", color: "#a0cce8", lineHeight: "1.55" }}>{organ.fact}</p>
              </div>

              <AIChat organName={organ.name} organColor={organ.color} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}