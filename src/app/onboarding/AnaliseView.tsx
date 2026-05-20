import type { AnaliseBiotipo } from "@/lib/gemini";

export function AnaliseView({
  analise,
  nome,
}: {
  analise: AnaliseBiotipo;
  nome: string;
}) {
  return (
    <>
      {/* Biotipo principal */}
      <div className="print-biotipo-card bg-orange-400 rounded-3xl p-6 sm:p-8">
        <p className="text-sm sm:text-base text-black/60 mb-1">
          Análise de {nome}
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-[family-name:var(--font-bebas)] tracking-wide text-black capitalize mb-3">
          Você é{" "}
          {analise.biotipo === "ectomorfo"
            ? "ectomorfo"
            : analise.biotipo === "mesomorfo"
            ? "mesomorfo"
            : analise.biotipo === "endomorfo"
            ? "endomorfo"
            : "biotipo misto"}
        </h1>
        <p className="text-sm sm:text-base text-black/80 leading-relaxed">
          {analise.resumoBiotipo}
        </p>
      </div>

      {/* Pontos fortes e desafios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card titulo="Pontos fortes">
          <ul className="flex flex-col gap-2">
            {analise.pontosFortes.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm sm:text-base">
                <span className="print-bullet text-orange-400">•</span>
                <span className="text-white/80">{p}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card titulo="Desafios">
          <ul className="flex flex-col gap-2">
            {analise.desafios.map((d, i) => (
              <li key={i} className="flex gap-2 text-sm sm:text-base">
                <span className="print-bullet text-orange-400/60">•</span>
                <span className="text-white/80">{d}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Dieta */}
      <Card titulo="Sua dieta personalizada">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <Stat
            label="Calorias/dia"
            valor={`${analise.dieta.caloriasEstimadas}`}
            sufixo="kcal"
          />
          <Stat
            label="Proteína"
            valor={`${analise.dieta.distribuicaoMacros.proteinaGramas}`}
            sufixo="g"
          />
          <Stat
            label="Carboidrato"
            valor={`${analise.dieta.distribuicaoMacros.carboidratoGramas}`}
            sufixo="g"
          />
          <Stat
            label="Gordura"
            valor={`${analise.dieta.distribuicaoMacros.gorduraGramas}`}
            sufixo="g"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-white/50 mb-2">
            Sugestões alimentares:
          </p>
          <ul className="flex flex-col gap-2">
            {analise.dieta.sugestoesAlimentares.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm sm:text-base">
                <span className="print-bullet text-orange-400">•</span>
                <span className="text-white/80">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Treino */}
      <Card titulo="Seu plano de treino">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Stat
            label="Frequência"
            valor={`${analise.treino.frequenciaSemanal}x`}
            sufixo="por semana"
          />
          <Stat label="Foco" valor={analise.treino.focoPrincipal} />
        </div>
        <div>
          <p className="text-sm font-medium text-white/50 mb-2">
            Exercícios recomendados:
          </p>
          <ul className="flex flex-col gap-2">
            {analise.treino.exerciciosRecomendados.map((e, i) => (
              <li key={i} className="flex gap-2 text-sm sm:text-base">
                <span className="print-bullet text-orange-400">•</span>
                <span className="text-white/80">{e}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Aviso legal */}
      <div className="print-aviso p-4 sm:p-6 rounded-2xl bg-white/[0.05] border border-white/[0.08]">
        <p className="text-xs sm:text-sm text-white/40">
          <strong className="text-white/60">Importante:</strong> {analise.avisoImportante}
        </p>
      </div>
    </>
  );
}

function Card({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="print-card bg-white/[0.05] border border-white/[0.10] backdrop-blur rounded-2xl p-5 sm:p-6">
      <h2 className="text-lg sm:text-xl font-[family-name:var(--font-bebas)] tracking-wide text-white mb-3">
        {titulo}
      </h2>
      {children}
    </div>
  );
}

function Stat({
  label,
  valor,
  sufixo,
}: {
  label: string;
  valor: string;
  sufixo?: string;
}) {
  return (
    <div className="print-stat bg-white/[0.05] rounded-xl p-3">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-base sm:text-lg font-bold text-white capitalize">
        {valor}{" "}
        {sufixo && (
          <span className="text-xs font-normal text-white/40">{sufixo}</span>
        )}
      </p>
    </div>
  );
}
