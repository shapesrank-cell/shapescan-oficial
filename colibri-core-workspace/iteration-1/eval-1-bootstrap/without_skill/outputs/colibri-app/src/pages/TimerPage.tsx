export default function TimerPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-colibri-primary/20 flex items-center justify-center mb-4">
        <span className="text-3xl" role="img" aria-label="timer">
          ⏱️
        </span>
      </div>
      <h1 className="text-2xl font-bold mb-2">Timer</h1>
      <p className="text-colibri-text-muted max-w-xs">
        Pomodoro e cronometros adaptados para foco TDAH. Em breve.
      </p>
    </div>
  );
}
