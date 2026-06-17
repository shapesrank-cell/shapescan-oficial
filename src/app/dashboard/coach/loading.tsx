/** Esqueleto do Coach (chat) — feedback instantâneo ao abrir a aba. */
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col bg-[#111111]">
      <div className="w-full max-w-3xl mx-auto flex flex-1 flex-col px-4 py-6 sm:py-8 animate-pulse">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-full bg-white/[0.06]" />
          <div className="flex flex-col gap-2">
            <div className="h-6 w-28 rounded bg-white/[0.07]" />
            <div className="h-3 w-44 rounded bg-white/[0.05]" />
          </div>
        </div>
        {/* Bolhas */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="h-12 w-3/4 rounded-2xl bg-white/[0.05]" />
          <div className="self-end h-10 w-2/3 rounded-2xl bg-orange-400/15" />
          <div className="h-20 w-4/5 rounded-2xl bg-white/[0.05]" />
        </div>
        {/* Input */}
        <div className="mt-3 h-14 rounded-2xl bg-white/[0.05]" />
      </div>
    </div>
  );
}
