import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-20">
      <main className="w-full max-w-3xl flex flex-col items-center text-center gap-8 sm:gap-12">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl sm:text-2xl">S</span>
          </div>
          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            ShapeScan
          </span>
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-4 sm:gap-6 items-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight max-w-2xl">
            Descubra seu{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              biotipo
            </span>{" "}
            e receba um plano feito para você
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
            Análise corporal por IA: dieta, treino e acompanhamento de evolução
            — sem precisar de nutricionista ou personal.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center h-12 sm:h-14 px-8 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold text-base sm:text-lg hover:opacity-90 transition-opacity"
          >
            Começar agora
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-12 sm:h-14 px-8 rounded-full border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 font-semibold text-base sm:text-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            Já tenho conta
          </Link>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full mt-8 sm:mt-12">
          <Feature
            icon="📊"
            title="Análise por IA"
            description="Descubra seu biotipo com base nos seus dados"
          />
          <Feature
            icon="🥗"
            title="Dieta personalizada"
            description="Cardápio feito para o seu corpo e objetivo"
          />
          <Feature
            icon="💪"
            title="Plano de treinos"
            description="Exercícios certos para seu biotipo"
          />
        </div>

        {/* Footer */}
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-4">
          Versão beta · Não substitui acompanhamento profissional de saúde
        </p>
      </main>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 sm:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <div className="text-3xl sm:text-4xl">{icon}</div>
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm sm:text-base">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 text-center">
        {description}
      </p>
    </div>
  );
}
