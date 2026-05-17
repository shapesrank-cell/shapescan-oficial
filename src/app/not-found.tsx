import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-6 text-center max-w-md animate-[fadeIn_0.5s_ease-out]">
        <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
          <span className="text-white font-bold text-4xl">?</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50">
            Página não encontrada
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Essa página não existe ou foi movida. Mas não se preocupe — seu
            shape continua intacto.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold hover:opacity-90 transition-opacity"
          >
            Voltar ao início
          </Link>
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center h-12 px-6 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Fazer análise
          </Link>
        </div>
      </div>
    </div>
  );
}
