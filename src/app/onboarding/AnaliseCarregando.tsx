"use client";

import { useEffect, useState } from "react";

const MENSAGENS = [
  "Analisando seu biotipo...",
  "Calculando suas necessidades calóricas...",
  "Montando seu plano alimentar...",
  "Selecionando os melhores exercícios...",
  "Quase pronto...",
];

export function AnaliseCarregando() {
  const [indiceMensagem, setIndiceMensagem] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceMensagem((i) => (i + 1) % MENSAGENS.length);
    }, 1800);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-8 max-w-md text-center">
        {/* Spinner animado em forma de S */}
        <div className="relative w-24 h-24 sm:w-32 sm:h-32">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl sm:text-5xl font-bold text-white">S</span>
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 blur-xl opacity-30 animate-pulse" />
        </div>

        {/* Mensagem animada */}
        <div className="h-12 flex items-center">
          <p
            key={indiceMensagem}
            className="text-base sm:text-lg text-zinc-700 dark:text-zinc-300 animate-[fadeIn_0.5s_ease-out]"
          >
            {MENSAGENS[indiceMensagem]}
          </p>
        </div>

        {/* Dots de progresso */}
        <div className="flex gap-2">
          {MENSAGENS.map((_, i) => (
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
