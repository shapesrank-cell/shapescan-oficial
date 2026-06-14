export default function MoodPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-colibri-secondary/20 flex items-center justify-center mb-4">
        <span className="text-3xl" role="img" aria-label="humor">
          😊
        </span>
      </div>
      <h1 className="text-2xl font-bold mb-2">Humor</h1>
      <p className="text-colibri-text-muted max-w-xs">
        Registre como voce esta se sentindo. Acompanhe padroes ao longo do tempo.
      </p>
    </div>
  );
}
