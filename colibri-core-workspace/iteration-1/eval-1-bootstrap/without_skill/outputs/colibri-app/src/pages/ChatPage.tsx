export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-colibri-warning/20 flex items-center justify-center mb-4">
        <span className="text-3xl" role="img" aria-label="chat">
          💬
        </span>
      </div>
      <h1 className="text-2xl font-bold mb-2">Chat</h1>
      <p className="text-colibri-text-muted max-w-xs">
        Converse com a IA para organizar pensamentos e desbloquear tarefas.
      </p>
    </div>
  );
}
