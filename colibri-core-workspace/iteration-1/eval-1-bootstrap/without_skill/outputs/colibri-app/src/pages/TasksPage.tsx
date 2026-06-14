export default function TasksPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-colibri-accent/20 flex items-center justify-center mb-4">
        <span className="text-3xl" role="img" aria-label="tarefas">
          ✅
        </span>
      </div>
      <h1 className="text-2xl font-bold mb-2">Tarefas</h1>
      <p className="text-colibri-text-muted max-w-xs">
        Listas simples e micro-tarefas para vencer a paralisia de decisao.
      </p>
    </div>
  );
}
