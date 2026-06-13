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

        <button
          onClick={() => sendMessage()}
          disabled={loading}
          className="
          px-6
          rounded-2xl
          bg-gradient-to-r
          from-cyan-500
          to-blue-600
          hover:scale-105
          transition
          font-semibold
          "
        >
          Send
        </button>

      </div>

    </div>
  );
}