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
    <div className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12 bg-[#111111] animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onReset}
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            ← Nova análise
          </button>
        </div>

        {/* Banner de salvo / não logado */}
        {logado ? (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.12]">
            <span className="text-sm text-white/60">
              {erroSalvar
                ? `Erro ao salvar: ${erroSalvar}`
                : salvo
                ? "Análise salva na sua conta"
                : "Salvando análise..."}
            </span>
            {salvo && (
              <Link
                href="/dashboard"
                className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors whitespace-nowrap"
              >
                Ver no dashboard →
              </Link>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.12]">
            <span className="text-sm text-white/50">
              Crie uma conta para salvar esta análise
            </span>
            <Link
              href="/cadastro"
              className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors whitespace-nowrap"
            >
              Cadastrar grátis →
            </Link>
          </div>
        )}

        <AnaliseView analise={analise} nome={nome} />
      </div>
    </div>
  );
}
