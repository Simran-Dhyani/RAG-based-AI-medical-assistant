import { motion } from "framer-motion";
import { HeartPulse, Zap, ArrowRight } from "lucide-react";

export default function LandingHero({ onLaunch }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 flex flex-col justify-between p-6">
      
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-500 opacity-20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-cyan-500 opacity-20 blur-[120px] rounded-full" />

      
      <header className="relative z-10 max-w-6xl w-full mx-auto flex justify-between items-center py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">MediSense <span className="text-cyan-400 font-light">AI</span></span>
        </div>
        <button 
          onClick={onLaunch} 
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-cyan-400 border border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10 transition-all backdrop-blur-md"
        >
          Enter Workspace
        </button>
      </header>

    
      <main className="relative z-10 max-w-4xl w-full mx-auto text-center my-auto flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.1 }}
          animate={{ opacity: 1, scale:1}}
          transition={{ duration: 1, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-8"
        >
         <Zap
        size={25}
        className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse"
        /> Built for clarity in health questions
        </motion.div>

        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-none mb-6">
          Health insights, made simple <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"></span>
        </h1>
         <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
             className="text-gray-400 text-lg max-w-2xl mb-12 leading-relaxed">
         Get fast, reliable answers to health questions, backed by medical information and context-aware AI.
        </motion.p>

        <div className="w-full max-w-xs">
          <button 
            onClick={onLaunch}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-blue-600 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] text-slate-950 font-bold px-8 py-4 rounded-2xl transition-all active:scale-98 group text-base"
          >
            Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </main>

      
      <footer className="relative z-10 text-center text-xs text-gray-600 tracking-wide border-t border-white/5 pt-4 max-w-6xl w-full mx-auto">
       Designed for clarity, not complexity.
      </footer>
    </div>
  );
}