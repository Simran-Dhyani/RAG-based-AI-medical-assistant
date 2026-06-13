export default function Header() {
  return (
    <header className="border-b border-white/10 backdrop-blur-xl bg-black/30">

      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            🩺
          </div>

          <div>

            <h1 className="text-2xl font-bold">
              Medical AI Assistant
            </h1>

            <p className="text-gray-400 text-sm">
              Powered by RAG + Qwen
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}