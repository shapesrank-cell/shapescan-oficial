import { MoodProvider } from './MoodContext';
import { MoodSelector } from './MoodSelector';
import { MoodHistory } from './MoodHistory';

export default function MoodPage() {
  return (
    <MoodProvider>
      <div className="flex flex-col gap-8 px-4 py-6 max-w-md mx-auto">
        {/* Page header — warm, not clinical */}
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-colibri-text font-[family-name:var(--font-display)]">
            Humor
          </h1>
          <p className="text-sm text-colibri-text-secondary">
            Sem julgamento, sem pressao. So voce e o momento.
          </p>
        </header>

        {/* Mood selector — 5 emojis, 1 touch */}
        <section
          className="bg-colibri-surface rounded-2xl p-6"
          aria-label="Registrar humor"
        >
          <MoodSelector />
        </section>

        {/* History — last 7 days as colored dots */}
        <section
          className="bg-colibri-surface rounded-2xl p-6"
          aria-label="Historico de humor"
        >
          <MoodHistory />
        </section>
      </div>
    </MoodProvider>
  );
}
