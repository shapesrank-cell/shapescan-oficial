"use client";

/**
 * Pop-up de boas-vindas da aba Ranking — aparece SÓ na primeira vez que o
 * usuário entra (controle por localStorage, por navegador). Backdrop escuro
 * por trás pra dar ênfase no card central.
 */
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

const KEY = "shapescan_ranking_intro_v1";

export function RankingIntroModal() {
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setAberto(true);
    } catch {
      // localStorage indisponível → não trava a página
    }
  }, []);

  // Trava o scroll do fundo enquanto o modal está aberto.
  useEffect(() => {
    if (!aberto) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [aberto]);

  function fechar() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // ignora
    }
    setAberto(false);
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop escuro — escurece tudo em volta pra focar no card */}
      <button
        aria-label="Fechar aviso"
        onClick={fechar}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* Card central */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-orange-400/30 bg-[#161616] p-6 sm:p-7 shadow-2xl shadow-black/60"
        style={{ animation: "fadeIn 0.25s ease-out" }}
      >
        <div className="flex justify-center mb-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-400/15 border border-orange-400/30 text-orange-400">
            <Trophy size={28} />
          </span>
        </div>

        <h2 className="text-center text-2xl font-[family-name:var(--font-bebas)] tracking-wide text-white mb-2">
          Bem-vindo ao seu Ranking
        </h2>

        <p className="text-center text-sm text-white/70 leading-relaxed mb-4">
          A cada análise com foto, a IA avalia o{" "}
          <strong className="text-white">nível de desenvolvimento</strong> de
          cada grupo muscular e te dá um <strong className="text-white">ELO</strong>{" "}
          — do <span className="text-white/80">Ferro</span> ao{" "}
          <span className="text-orange-400">Desafiante</span>.
        </p>

        <ul className="flex flex-col gap-2 mb-6 text-sm text-white/70">
          <li className="flex gap-2">
            <span className="text-orange-400">•</span>
            <span>6 grupos avaliados + um <strong className="text-white">Rank Geral</strong>.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-orange-400">•</span>
            <span>Quanto mais você evolui no treino, mais seu rank sobe.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-orange-400">•</span>
            <span>É sobre <strong className="text-white">você vs. você</strong> — não é comparação com os outros.</span>
          </li>
        </ul>

        <button
          onClick={fechar}
          className="w-full h-12 rounded-xl bg-orange-400 text-black font-semibold hover:bg-orange-300 active:scale-[0.98] transition-all"
        >
          Entendi, bora! 🔥
        </button>
      </div>
    </div>
  );
}
