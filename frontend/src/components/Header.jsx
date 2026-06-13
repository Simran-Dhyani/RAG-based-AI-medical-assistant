import { HeartPulse } from "lucide-react";
export default function Header() {
  return (
    <header className="border-b border-white/10 backdrop-blur-xl bg-black/30">

      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
             <HeartPulse className="w-6 h-6 text-white" />
          </div>

          <div>

            <h1 className="text-2xl font-bold text-indigo-400">
             MediSense AI
            </h1>
          </div>

        </div>

      </div>

    </header>
  );
}