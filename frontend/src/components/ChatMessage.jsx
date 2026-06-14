export default function ChatMessage({ msg }) {

  const isUser = msg.role === "user";

  return (
    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`
        max-w-[75%]
        rounded-2xl
        px-5
        py-4
        shadow-lg
        ${
          isUser
            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
            : "bg-white/10 text-white backdrop-blur-xl border border-white/10"
        }
        `}
      >
        <p className="whitespace-pre-wrap">
          {msg.text}
        </p>

        {msg.source && (
          <div className="text-xs mt-3 opacity-70">

            Source: {msg.source}

            {msg.citations?.length > 0 &&
              ` (${msg.citations.join(", ")})`}

          </div>
        )}

      </div>
    </div>
  );
}