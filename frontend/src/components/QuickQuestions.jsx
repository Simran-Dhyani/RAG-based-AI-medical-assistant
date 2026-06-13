import { motion } from "framer-motion";
export default function QuickQuestions({
  questions = [],
  sendMessage,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((q) => (
        <motion.button
          key={q}
          onClick={() => sendMessage(q)}
          whileHover={{
            scale: 1.03,
            y: -2,
          }}
          whileTap={{
            scale: 0.95,
          }}
          transition={{ type: "spring", stiffness: 300 }}
        className="  px-4 py-2
            rounded-full
            backdrop-blur-xl
            text-white
            bg-white/10
            hover:bg-cyan-500/20
            border border-white/10
            
          
            
          "
        >
          {q}
        </motion.button>
      ))}
    </div>
  );
}