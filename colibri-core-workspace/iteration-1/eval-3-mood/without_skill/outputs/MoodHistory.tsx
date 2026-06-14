import React from "react";
import { MOOD_OPTIONS } from "./types";
import type { MoodEntry } from "./types";

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface MoodHistoryProps {
  /** Array of 7 entries (or null for missing days), oldest first */
  days: (MoodEntry | null)[];
}

export default function MoodHistory({ days }: MoodHistoryProps) {
  const today = new Date();

  // Build label for each of the 7 slots
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (i === 0) {
      labels.push("Hoje");
    } else if (i === 1) {
      labels.push("Ontem");
    } else {
      labels.push(DAY_NAMES[d.getDay()]);
    }
  }

  const hasAnyEntry = days.some((d) => d !== null);

  return (
    <div className="w-full">
      {/* Section title */}
      <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">
        Últimos 7 dias
      </p>

      {!hasAnyEntry ? (
        <div className="flex items-center justify-center py-6 rounded-2xl bg-white/[0.03]">
          <p className="text-white/25 text-sm">
            Nenhum registro ainda. Sem pressa.
          </p>
        </div>
      ) : (
        <div className="flex items-end justify-between gap-1">
          {days.map((entry, i) => {
            const option = entry
              ? MOOD_OPTIONS.find((o) => o.value === entry.mood)
              : null;
            const isToday = i === 6;

            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 flex-1 min-w-0"
              >
                {/* Mood bar / dot */}
                <div className="flex flex-col items-center justify-end h-20">
                  {entry && option ? (
                    <>
                      {/* Bar representing mood level */}
                      <div
                        className="w-7 rounded-lg transition-all duration-500 ease-out"
                        style={{
                          height: `${(entry.mood / 5) * 100}%`,
                          backgroundColor: `${option.color}40`,
                          border: `1px solid ${option.color}60`,
                          minHeight: "12px",
                        }}
                      />
                      {/* Emoji on top */}
                      <span className="text-lg mt-1 select-none" role="img" aria-label={option.label}>
                        {option.emoji}
                      </span>
                    </>
                  ) : (
                    /* Empty state — subtle dot */
                    <div className="w-2 h-2 rounded-full bg-white/10 mb-1" />
                  )}
                </div>

                {/* Day label */}
                <span
                  className={`text-[10px] font-medium ${
                    isToday ? "text-[#7C3AED]" : "text-white/30"
                  }`}
                >
                  {labels[i]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
