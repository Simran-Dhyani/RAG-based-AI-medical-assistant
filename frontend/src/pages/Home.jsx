import { useState } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header.jsx";
import Hero from "../components/Hero.jsx";
import QuickQuestions from "../components/QuickQuestions.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import ChatInput from "../components/ChatInput.jsx";

const QUICK_QUESTIONS = [
  "What are symptoms of hypertension?",
  "What to do in a heart attack emergency?",
  "Medicines for diabetes?",
  "How to treat dengue fever?",
  "First aid for choking?",
  "COVID-19 warning signs?",
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Correct
  const sendMessage = async (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: messageText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: messageText }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "",
        source = "",
        citations = [];

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "", source: "", citations: [] },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = JSON.parse(line.slice(6));
          if (data.type === "meta") {
            source = data.source;
            citations = data.citations;
          } else if (data.type === "token") {
            aiText += data.token;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "ai",
                text: aiText,
                source,
                citations,
              };
              return updated;
            });
          }
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error connecting to backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

 return (
  <div className="relative min-h-screen overflow-hidden bg-slate-950">

    <motion.div
      animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
      transition={{ duration: 20, repeat: Infinity }}
      className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-purple-500 opacity-30 blur-[140px] rounded-full"
    />

    <motion.div
      animate={{ x: [0, -60, 60, 0], y: [0, 60, -60, 0] }}
      transition={{ duration: 25, repeat: Infinity }}
      className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-pink-600 opacity-30 blur-[140px] rounded-full"
    />

    <motion.div
      animate={{ y: [0, -30, 0] }}
      transition={{ duration: 10, repeat: Infinity }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-sky-500 opacity-20 blur-[120px] rounded-full"
    />

    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

    <div className="relative z-10">
      <Header />

      <div className="max-w-6xl mx-auto px-6">
        <Hero />

        <QuickQuestions
          questions={QUICK_QUESTIONS}
          sendMessage={sendMessage}
          loading={loading}
        />

        <div className="mt-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          <ChatWindow messages={messages} loading={loading} />

          <ChatInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            loading={loading}
          />
        </div>
      </div>
    </div>

  </div>
);
}