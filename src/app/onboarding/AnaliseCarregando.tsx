"use client";

import { useEffect, useState } from "react";

const MENSAGENS_BASE = [
  "Analisando seu biotipo...",
  "Calculando suas necessidades calóricas...",
  "Montando seu plano alimentar...",
  "Selecionando os melhores exercícios...",
  "Quase pronto...",
];

const MENSAGENS_COM_FOTO = [
  "Analisando sua foto...",
  "Identificando seu biotipo visualmente...",
  "Calculando suas necessidades calóricas...",
  "Montando seu plano alimentar...",
  "Quase pronto...",
];

export function AnaliseCarregando({ temFoto = false }: { temFoto?: boolean }) {
  const [indiceMensagem, setIndiceMensagem] = useState(0);
  const mensagens = temFoto ? MENSAGENS_COM_FOTO : MENSAGENS_BASE;

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceMensagem((i) => (i + 1) % mensagens.length);
    }, 1800);
    return () => clearInterval(intervalo);
  }, [mensagens.length]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-8 max-w-md text-center">
        {/* Logo animada */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl sm:text-5xl font-bold text-white">S</span>
          </div>
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-xl opacity-25 animate-pulse" />
        </div>

        {/* Título */}
        <div className="flex flex-col gap-1">
          <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
            {temFoto ? "Analisando com IA + foto" : "Gerando sua análise"}
          </p>

          {/* Mensagem rotativa */}
          <div className="h-7 flex items-center justify-center">
            <p
              key={indiceMensagem}
              className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 animate-[fadeIn_0.5s_ease-out]"
            >
              {mensagens[indiceMensagem]}
            </p>
          </div>
        </div>

        {/* Barra de progresso animada */}
        <div className="w-full max-w-xs bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-[progress_9s_ease-out_forwards]" />
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          {mensagens.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === indiceMensagem
                  ? "w-8 bg-indigo-500"
                  : "w-1.5 bg-zinc-300 dark:bg-zinc-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
