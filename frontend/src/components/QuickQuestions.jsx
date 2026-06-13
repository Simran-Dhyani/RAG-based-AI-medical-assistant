
export default function QuickQuestions({
  questions = [],
  sendMessage,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((q) => (
        <button
          key={q}
          onClick={() => sendMessage(q)}
          className="
            px-4 py-2
            rounded-full
            bg-white/10
            hover:bg-cyan-500/20
            border border-white/10
            transition
          "
        >
          {q}
        </button>
      ))}
    </div>
  );
}