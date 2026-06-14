import React from "react";
import MoodPicker from "./MoodPicker";
import MoodHistory from "./MoodHistory";
import { useMoodStorage } from "./useMoodStorage";

/**
 * MoodTracker — Full mood tracking widget for Colibri.
 *
 * ADHD-friendly design principles:
 * - One tap to register mood (no follow-up questions)
 * - No "why" prompts, no journaling, no judgment
 * - Immediate visual feedback with animation + confirmation
 * - Haptic feedback on mobile
 * - Minimal cognitive load
 * - History is passive/glanceable, not demanding
 */
export default function MoodTracker() {
  const { addEntry, todayEntry, last7Days } = useMoodStorage();

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-8 p-5">
      {/* Picker — the core interaction */}
      <MoodPicker
        todayMood={todayEntry?.mood ?? null}
        onSelect={(mood) => addEntry(mood)}
      />

      {/* Divider */}
      <div className="w-full h-px bg-white/[0.06]" />

      {/* History — passive, glanceable */}
      <MoodHistory days={last7Days()} />
    </div>
  );
}
