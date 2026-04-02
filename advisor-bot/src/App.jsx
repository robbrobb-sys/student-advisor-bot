import { useState, useRef, useEffect } from "react";

const QUICK_PROMPTS = [
  "Should I go straight to grad school or work first?",
  "How do I choose between two job offers?",
  "How do I break into venture capital?",
  "How important is my first employer's brand name?",
];

const WELCOME = "Hi — I'm here to help you think through academic and career decisions. Ask me about grad school timing, evaluating job offers, breaking into venture or finance, or anything about navigating early career choices. What's on your mind?";

export default function App() {
  const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text) {
    const userText = text || input.trim();
    if (!userText || busy) return;
    setInput("");
    setBusy(true);
    setShowQuick(false);

    const newHistory = [...messages, { role: "user", content: userText }];
    setMessages([...newHistory, { role: "assistant", content: "..." }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || "Something went wrong.";
      setMessages([...newHistory, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newHistory, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setBusy(false);
  }

  function reset() {
    setMessages([{ role: "assistant", content: WELCOME }]);
    setInput("");
    setBusy(false);
    setShowQuick(true);
  }

  return (
    <div style={{ width: "100%", maxWidth: 680, display: "flex", flexDirection: "column", height: "92vh", maxHeight: 700, border: "1px solid #e0e0e0", borderRadius: 14, overflow: "hidden", background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #ebebeb", background: "#fafafa", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#1d4ed8" }}>RS</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>Robert Stavis</div>
            <div style={{ fontSize: 12, color: "#888" }}>Partner, Bessemer Venture Partners · Student Advisor</div>
          </div>
        </div>
        <button onClick={reset} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", color: "#666", cursor: "pointer" }}>Reset</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 8px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, background: m.role === "user" ? "#dcfce7" : "#dbeafe", color: m.role === "user" ? "#166534" : "#1d4ed8" }}>
              {m.role === "user" ? "You" : "RS"}
            </div>
            <div style={{ maxWidth: "78%", padding: "11px 15px", borderRadius: 12, fontSize: 14, lineHeight: 1.7, color: m.content === "..." ? "#bbb" : "#1a1a1a", background: m.role === "user" ? "#f0fdf4" : "#f8f8f8", border: "1px solid", borderColor: m.role === "user" ? "#bbf7d0" : "#ebebeb", whiteSpace: "pre-wrap", fontStyle: m.content === "..." ? "italic" : "normal" }}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {showQuick && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "10px 18px 6px", flexShrink: 0 }}>
          {QUICK_PROMPTS.map((q, i) => (
            <button key={i} onClick={() => send(q)} style={{ fontSize: 12, padding: "6px 13px", borderRadius: 20, border: "1px solid #e0e0e0", background: "#fff", color: "#555", cursor: "pointer", fontFamily: "inherit" }}>{q}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: 8, padding: "12px 18px", borderTop: "1px solid #ebebeb", background: "#fafafa", flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask a question..."
          rows={1}
          style={{ flex: 1, padding: "9px 13px", borderRadius: 9, border: "1px solid #ddd", background: "#fff", fontSize: 14, color: "#111", fontFamily: "inherit", resize: "none", minHeight: 40, maxHeight: 100, outline: "none" }}
        />
        <button
          onClick={() => send()}
          disabled={busy || !input.trim()}
          style={{ padding: "9px 18px", borderRadius: 9, border: "1px solid #ddd", background: busy || !input.trim() ? "#f5f5f5" : "#1d4ed8", color: busy || !input.trim() ? "#aaa" : "#fff", fontSize: 14, cursor: busy || !input.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 500, transition: "all 0.15s" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
