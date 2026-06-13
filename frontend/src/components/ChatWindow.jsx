import ChatMessage from "./ChatMessage";

export default function ChatWindow({
  messages,
  loading
}) {
  return (
    <div className="h-[550px] overflow-y-auto p-6 space-y-5">

      {messages.map((msg, index) => (
        <ChatMessage
          key={index}
          msg={msg}
        />
      ))}

      {loading && (
        <div className="text-gray-400 animate-pulse">
          AI is thinking...
        </div>
      )}

    </div>
  );
}