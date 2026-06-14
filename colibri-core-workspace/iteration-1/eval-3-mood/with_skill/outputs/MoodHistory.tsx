import { useMood, type MoodEntry, type MoodValue } from './MoodContext';

// --- Color mapping (same as MoodSelector for consistency) ---

const MOOD_DOT_COLORS: Record<MoodValue, string> = {
  1: 'bg-colibri-success',        // #34D399
  2: 'bg-[#86EFAC]',              // verde claro
  3: 'bg-colibri-warn',           // #FBBF24
  4: 'bg-[#FB923C]',              // laranja
  5: 'bg-[#F87171]',              // vermelho suave
};

const MOOD_EMOJIS: Record<MoodValue, string> = {
  1: '\u{1F929}',
  2: '\u{1F60A}',
  3: '\u{1F610}',
  4: '\u{1F62E}\u{200D}\u{1F4A8}',
  5: '\u{1F622}',
};

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

// --- Helpers ---

function getLast7DaysDates(): Date[] {
  const days: Date[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

function findEntryForDay(entries: MoodEntry[], day: Date): MoodEntry | undefined {
  const dayStr = day.toISOString().slice(0, 10);
  return entries.find((e) => e.timestamp.slice(0, 10) === dayStr);
}

// --- Component ---

export function MoodHistory() {
  const { last7Days } = useMood();
  const days = getLast7DaysDates();
  const isToday = (d: Date) => d.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);

  const hasAnyEntry = last7Days.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Section title */}
      <h2 className="text-base font-semibold text-colibri-text">
        Ultimos 7 dias
      </h2>

      {hasAnyEntry ? (
        <div className="flex items-end justify-between gap-2">
          {days.map((day) => {
            const entry = findEntryForDay(last7Days, day);
            const weekday = WEEKDAY_LABELS[day.getDay()];
            const today = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className="flex flex-col items-center gap-2 flex-1"
              >
                {/* Emoji or empty dot */}
                <div
                  className={[
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
                    entry
                      ? MOOD_DOT_COLORS[entry.mood]
                      : 'bg-colibri-subtle',
                    today && !entry ? 'ring-2 ring-colibri-primary ring-offset-1 ring-offset-colibri-bg' : '',
                  ].join(' ')}
                  aria-label={
                    entry
                      ? `${weekday}: humor ${entry.mood}`
                      : `${weekday}: sem registro`
                  }
                >
                  {entry ? (
                    <span className="text-lg" role="img" aria-hidden="true">
                      {MOOD_EMOJIS[entry.mood]}
                    </span>
                  ) : null}
                </div>

                {/* Weekday label */}
                <span
                  className={[
                    'text-xs',
                    today
                      ? 'text-colibri-primary font-semibold'
                      : 'text-colibri-text-muted',
                  ].join(' ')}
                >
                  {today ? 'Hoje' : weekday}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state — gentle, never pressuring */
        <div className="flex flex-col items-center gap-3 py-6">
          <span className="text-4xl" role="img" aria-hidden="true">
            {'\u{1F343}'}
          </span>
          <p className="text-sm text-colibri-text-secondary text-center max-w-[240px]">
            Nenhum registro ainda. Quando sentir vontade, e so tocar em um emoji acima.
          </p>
        </div>
      )}
    </div>
  );
}
