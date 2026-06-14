# Mood Feature - Output Summary

## Files Created

| File | Purpose |
|---|---|
| MoodContext.tsx | Context + provider + useMood() hook. Persists entries to localStorage via requestIdleCallback (non-blocking). Exposes registerMood(), todayEntry, and last7Days. |
| MoodSelector.tsx | 5 emoji buttons in a row (Radiante / Contente / Neutro / Cansado / Dificil). 1-touch registration with immediate pulse animation + warm acolhimento message. |
| MoodHistory.tsx | Last 7 days displayed as colored dots with emoji inside. Empty state is gentle and non-pressuring. Today is highlighted with a purple ring. |
| MoodPage.tsx | Page composition: wraps everything in MoodProvider, renders header + selector card + history card. Default export for lazy loading. |

## TDAH UX Rules Applied

- 1-touch rule: tap an emoji and it registers instantly. No confirmation dialogs, no multi-step flows.
- Immediate feedback: selected emoji scales up (125%), gets a colored ring, and pulses. A warm message appears for 3 seconds.
- No judgment: never asks why, never says you should. Messages are always acolhimento.
- Low cognitive load: only 5 options, generous touch targets (min 48x48), generous spacing, large emoji text.
- Offline-first: all state in localStorage, persisted asynchronously via requestIdleCallback.
- Dark-native: uses colibri-bg, colibri-surface, colibri-text tokens throughout.
- Replaces todays entry: if user taps a different mood later the same day, it updates instead of adding a duplicate.

## Color Tokens Used

All from the Colibri Tailwind config: colibri-bg, colibri-surface, colibri-subtle, colibri-primary, colibri-success, colibri-warn, colibri-text, colibri-text-secondary, colibri-text-muted, plus feature-specific hex colors (#86EFAC, #FB923C, #F87171).

## Integration

To mount this feature in the app router, lazy-load MoodPage and add a Route at /mood.
