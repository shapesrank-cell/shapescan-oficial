/**
 * Esqueleto de carregamento dos setores sob /dashboard.
 * Aparece INSTANTANEAMENTE ao navegar (enquanto o servidor busca os dados),
 * então a troca de aba parece imediata em vez de "travada".
 * Renderiza dentro do AppShell — a barra de navegação continua visível.
 */
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col px-4 py-6 sm:py-10 bg-[#111111]">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 sm:gap-8 animate-pulse">
        {/* Saudação */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="h-4 w-32 rounded bg-white/[0.06]" />
          <div className="h-10 w-48 rounded-lg bg-white/[0.07]" />
        </div>
        {/* Hero */}
        <div className="h-[200px] sm:h-[260px] rounded-3xl bg-white/[0.05]" />
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/[0.05]" />
          ))}
        </div>
        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="h-20 rounded-2xl bg-white/[0.05]" />
          <div className="h-20 rounded-2xl bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
}
