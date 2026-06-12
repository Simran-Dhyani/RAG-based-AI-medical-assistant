
import { useState } from "react";

const API_URL = "http://localhost:5000/api/chat";

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
      text: "Hello! I'm your Medical AI Assistant. Ask me anything related to diseases, symptoms, medicines, or emergency care.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(questionText) {
    const question = questionText || input.trim();

    if (!question || loading) return;

    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
    ]);

    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: question,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply,
          source: data.source,
          citations: data.citations,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Could not connect to backend.",
        },
      ]);
    }

    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold">
             Medical AI Assistant
          </h1>

          <p className="text-sm opacity-90">
            Powered by FAISS + Llama RAG
          </p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto p-4">

        {/* Quick Questions */}
        <div className="flex flex-wrap gap-2 mb-6">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={loading}
              className="px-3 py-1 text-sm bg-white border rounded-full hover:bg-gray-100"
            >
              {q}
            </button>
          ))}
        </div> 

        {/* Chat */}
        <div className="space-y-4 mb-6">

          {messages.map((msg, index) => (
            <div key={index}>

              <p className="font-semibold mb-1">
                {msg.role === "user" ? "You" : "AI"}
              </p>

              <div className="bg-white p-3 rounded-lg shadow-sm">
                {msg.text}
              </div>

              {msg.source && (
                <p className="text-xs text-gray-500 mt-1">
                  Source: {msg.source}
                  {msg.citations?.length > 0 &&
                    ` (${msg.citations.join(", ")})`}
                </p>
              )}
            </div>
          ))}

          {loading && (
            <p className="text-gray-500">
              Generating response...
            </p>
          )}

        </div> 

        {/* Input */}
        <div className="flex gap-2">

          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a medical question..."
            className="flex-1 border rounded-lg p-3"
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading}
            className="bg-blue-600 text-white px-5 rounded-lg"
          >
            Send
          </button>

        </div>  

        {/* Footer */}
       <p className="text-xs text-center text-gray-500 mt-6">
          Educational purposes only. Not a substitute for professional medical advice.
        </p>

      </div>
    </div>
  );
} 

  