
import { useState, useRef, useEffect } from "react";

const API_URL = "http://localhost:5000/api/chat";


const SOURCE_STYLES = {
  knowledge_base: {
    bg: "#e8f5e9",
    color: "#2e7d32",
    label: "📚 From Medical PDFs",
  },
  gemini_general: {
    bg: "#e3f2fd",
    color: "#1565c0",
    label: "🤖 From Gemini AI",
  },
  blocked: {                        // ← add this
    bg: "#fff3e0",
    color: "#e65100",
    label: "⚕️ Medical queries only",
  },
};
function SourceBadge({ source, citations }) {
  const style = SOURCE_STYLES[source] || SOURCE_STYLES.gemini_general;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: style.bg,
        color: style.color,
        fontSize: 11,
        padding: "3px 8px",
        borderRadius: 12,
        marginTop: 6,
        fontWeight: 600,
      }}
    >
      {style.label}
      {citations?.length > 0 && (
        <span style={{ fontWeight: 400, opacity: 0.8 }}>
          · {citations.join(", ")}
        </span>
      )}
    </div>
  );
}

function Message({ msg }) {
  const isAI = msg.role === "ai";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isAI ? "flex-start" : "flex-end",
        marginBottom: 16,
      }}
    >
      {isAI && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#1976d2",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            flexShrink: 0,
            marginRight: 10,
            alignSelf: "flex-end",
          }}
        >
          🩺
        </div>
      )}
      <div style={{ maxWidth: "72%" }}>
        <div
          style={{
            background: isAI ? "#fff" : "#1976d2",
            color: isAI ? "#222" : "#fff",
            padding: "12px 16px",
            borderRadius: isAI ? "0 16px 16px 16px" : "16px 0 16px 16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            lineHeight: 1.6,
            fontSize: 14,
            whiteSpace: "pre-wrap",
          }}
        >
          {msg.text}
        </div>
        {isAI && msg.source && (
          <SourceBadge source={msg.source} citations={msg.citations} />
        )}
        {msg.loading && (
          <div style={{ padding: "8px 0", color: "#888", fontSize: 13 }}>
            ⏳ Thinking...
          </div>
        )}
      </div>
    </div>
  );
}

const QUICK_QUESTIONS = [
  "What are symptoms of hypertension?",
  "What to do in a heart attack emergency?",
  "Medicines for diabetes?",
  "How to treat dengue fever?",
  "First aid for choking?",
  "COVID-19 warning signs?",
];

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm your Medical AI Assistant 🩺\n\nI can help you with information about diseases, symptoms, medicines, and emergency first aid based on WHO-aligned medical guidelines.\n\nAsk me anything, or tap one of the quick questions below.",
      source: null,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text) {
    const question = text || input.trim();
    if (!question || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setLoading(true);

    // Add a loading placeholder
    setMessages((prev) => [...prev, { role: "ai", text: "", loading: true }]);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: question }),
      });
      const data = await res.json();

      // Replace loading placeholder with real answer
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "ai",
          text: data.reply || data.error || "No response received.",
          source: data.source,
          citations: data.citations,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "ai",
          text: "⚠️ Could not connect to the server. Make sure the backend is running on port 5000.",
          source: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f4f8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          background: "linear-gradient(135deg, #1565c0, #1976d2)",
          color: "#fff",
          padding: "16px 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 28 }}>🏥</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              Medical AI Assistant
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Powered by FAISS + Gemini RAG · 10 Medical PDF Sources
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 720,
          padding: "24px 16px 0",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions */}
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          padding: "12px 16px 0",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            disabled={loading}
            style={{
              background: "#fff",
              border: "1px solid #90caf9",
              color: "#1565c0",
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 12,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "background 0.2s",
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          padding: "12px 16px 20px",
          display: "flex",
          gap: 10,
          boxSizing: "border-box",
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about symptoms, medicines, or emergencies... (Enter to send)"
          rows={2}
          disabled={loading}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 24,
            border: "1.5px solid #90caf9",
            fontSize: 14,
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          style={{
            background: input.trim() && !loading ? "#1976d2" : "#b0bec5",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 48,
            height: 48,
            fontSize: 20,
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            flexShrink: 0,
            alignSelf: "flex-end",
            transition: "background 0.2s",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          ➤
        </button>
      </div>

      {/* Footer disclaimer */}
      <div
        style={{
          fontSize: 11,
          color: "#888",
          textAlign: "center",
          padding: "0 16px 16px",
        }}
      >
        ⚠️ For educational purposes only. Not a substitute for professional
        medical advice.
      </div>
    </div>
  );
}
