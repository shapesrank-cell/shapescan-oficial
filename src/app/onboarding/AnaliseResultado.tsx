"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AnaliseBiotipo } from "@/lib/gemini";
import { createClient } from "@/lib/supabase/client";
import { AnaliseView } from "./AnaliseView";

type DadosEntrada = {
  nome: string;
  sexo: string;
  idade: string;
  peso: string;
  altura: string;
  nivelAtividade: string;
  objetivo: string;
};

export function AnaliseResultado({
  analise,
  nome,
  onReset,
  dadosEntrada,
}: {
  analise: AnaliseBiotipo;
  nome: string;
  onReset: () => void;
  dadosEntrada: DadosEntrada;
}) {
  const [logado, setLogado] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erroSalvar, setErroSalvar] = useState<string | null>(null);

  useEffect(() => {
    const salvar = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setLogado(true);
      const { error } = await supabase.from("analyses").insert({
        user_id: user.id,
        dados_entrada: dadosEntrada,
        resultado: analise,
      });

      if (error) {
        console.error("Erro ao salvar análise:", error);
        setErroSalvar(error.message);
      } else {
        setSalvo(true);
      }

      // Atualiza o nome no perfil (sempre que fizer análise logado)
      if (dadosEntrada.nome) {
        await supabase
          .from("profiles")
          .update({ nome: dadosEntrada.nome })
          .eq("id", user.id);
      }
    };
    salvar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12 animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onReset}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            ← Nova análise
          </button>
        </div>

        {/* Banner de salvo / não logado */}
        {logado ? (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
            <span className="text-sm text-green-700 dark:text-green-400">
              {erroSalvar
                ? `⚠️ Erro ao salvar: ${erroSalvar}`
                : salvo
                ? "✓ Análise salva na sua conta"
                : "Salvando análise..."}
            </span>
            {salvo && (
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-green-700 dark:text-green-400 hover:underline whitespace-nowrap"
              >
                Ver no dashboard →
              </Link>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              💾 Crie uma conta para salvar esta análise
            </span>
            <Link
              href="/cadastro"
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap"
            >
              Cadastrar grátis →
            </Link>
          </div>
        )}

        {/* Conteúdo visual da análise — compartilhado com /dashboard/analise/[id] */}
        <AnaliseView analise={analise} nome={nome} />
      </div>
    </div>
  );
}
