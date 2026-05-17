import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 bg-[#111111]">
      <div className="flex flex-col items-center gap-6 text-center max-w-md animate-[fadeIn_0.5s_ease-out]">
        <div className="h-20 w-20 rounded-3xl bg-orange-400 flex items-center justify-center">
          <span className="text-black font-bold text-4xl font-[family-name:var(--font-bebas)] tracking-wide">404</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl sm:text-5xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
            Página não encontrada
          </h1>
          <p className="text-sm sm:text-base text-white/50">
            Essa página não existe ou foi movida. Mas não se preocupe — seu
            shape continua intacto.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-orange-400 text-black font-semibold hover:bg-orange-300 active:scale-95 transition-all"
          >
            Voltar ao início
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center h-12 px-6 rounded-full border border-white/20 text-white font-semibold hover:bg-white/[0.08] transition-colors"
          >
            Fazer análise
          </Link>
        </div>
      </div>
    </div>
  );
}
