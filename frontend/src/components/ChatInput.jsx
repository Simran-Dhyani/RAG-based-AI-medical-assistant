import { motion } from "framer-motion";
export default function ChatInput({
  input,
  setInput,
  sendMessage,
  loading
}) {
  return (
    <div className="border-t border-white/10 p-4">

      <div className="flex gap-3">

        <textarea
          rows={2}
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          placeholder="Ask a medical question..."
          className="
          flex-1
          rounded-2xl
          bg-white/5
          border border-white/10
          backdrop-blur-md
          p-4
          outline-none
          resize-none
          focus:border-cyan-500
          "
        />

        <motion.button
          onClick={() => sendMessage()}
           whileHover={{
            scale: 1.03,
            y: -2,
          }}
          whileTap={{
            scale: 0.95,
          }}
          transition={{ type: "spring", stiffness: 300 }}
          disabled={loading}
          className="
          px-6
          rounded-2xl
          bg-gradient-to-r
          from-cyan-300
          to-blue-600
          hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]
         
        
          font-semibold
          "
        >
          Send
        </motion.button>

      </div>

    </div>
  );
}