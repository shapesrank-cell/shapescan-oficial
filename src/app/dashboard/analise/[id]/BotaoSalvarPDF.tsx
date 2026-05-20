"use client";

export function BotaoSalvarPDF() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print flex items-center gap-2 h-9 px-4 rounded-full bg-white/[0.08] border border-white/[0.12] text-sm text-white/70 hover:text-white hover:bg-white/[0.12] transition-all"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Salvar PDF
    </button>
  );
}
