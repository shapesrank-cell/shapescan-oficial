/** Esqueleto das Configurações — feedback instantâneo ao abrir a aba. */
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col px-4 py-8 sm:py-12 bg-[#111111]">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-48 rounded-lg bg-white/[0.07]" />
        <div className="h-40 rounded-2xl bg-white/[0.05]" />
        <div className="h-40 rounded-2xl bg-white/[0.05]" />
      </div>
    </div>
  );
}
