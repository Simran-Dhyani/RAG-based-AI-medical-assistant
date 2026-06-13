import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="text-center py-16">
      <motion.h1
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-5xl md:text-6xl font-bold leading-tight text-white"
      >
        Your Personal

        <span className="block bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Medical AI Assistant
        </span>
      </motion.h1>
       <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 mt-6 max-w-xl mx-auto"
            >
        Ask medical questions, retrieve information from trusted medical
        documents, and get AI-powered healthcare guidance instantly.
      </motion.p>
    </div>
  );
}