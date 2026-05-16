"use client";

import { useState } from "react";
import Link from "next/link";

type FormData = {
  nome: string;
  sexo: "masculino" | "feminino" | "outro" | "";
  idade: string;
  peso: string;
  altura: string;
  nivelAtividade: "sedentario" | "leve" | "moderado" | "intenso" | "";
  objetivo:
    | "emagrecer"
    | "ganhar_massa"
    | "definir"
    | "saude_geral"
    | "";
};

const FORM_INICIAL: FormData = {
  nome: "",
  sexo: "",
  idade: "",
  peso: "",
  altura: "",
  nivelAtividade: "",
  objetivo: "",
};

export default function OnboardingPage() {
  const [form, setForm] = useState<FormData>(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  function update<K extends keyof FormData>(campo: K, valor: FormData[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setResultado(null);

    // Por enquanto, mostramos os dados na tela.
    // Quando configurar a API key da Anthropic, esta função vai chamar a IA
    // e gerar a análise de biotipo + dieta.
    await new Promise((r) => setTimeout(r, 800));

    setResultado(
      `Olá, ${form.nome}! Recebemos seus dados. A análise por IA será gerada quando a chave da Anthropic estiver configurada.`
    );
    setEnviando(false);
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
          >
            ← Voltar
          </Link>
          <span className="text-sm text-zinc-500 dark:text-zinc-500">
            Passo 1 de 1
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Vamos te conhecer
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-8">
          Essas informações são usadas para gerar sua análise personalizada. Seus
          dados ficam seguros.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Como podemos te chamar?" htmlFor="nome">
            <input
              id="nome"
              type="text"
              required
              value={form.nome}
              onChange={(e) => update("nome", e.target.value)}
              placeholder="Seu nome ou apelido"
              className="input"
            />
          </Field>

          <Field label="Sexo biológico" htmlFor="sexo">
            <select
              id="sexo"
              required
              value={form.sexo}
              onChange={(e) =>
                update("sexo", e.target.value as FormData["sexo"])
              }
              className="input"
            >
              <option value="">Selecione</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro / Prefiro não dizer</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Idade" htmlFor="idade">
              <input
                id="idade"
                type="number"
                required
                min="14"
                max="100"
                value={form.idade}
                onChange={(e) => update("idade", e.target.value)}
                placeholder="anos"
                className="input"
              />
            </Field>

            <Field label="Peso (kg)" htmlFor="peso">
              <input
                id="peso"
                type="number"
                required
                step="0.1"
                min="30"
                max="300"
                value={form.peso}
                onChange={(e) => update("peso", e.target.value)}
                placeholder="ex: 70.5"
                className="input"
              />
            </Field>

            <Field label="Altura (cm)" htmlFor="altura">
              <input
                id="altura"
                type="number"
                required
                min="100"
                max="250"
                value={form.altura}
                onChange={(e) => update("altura", e.target.value)}
                placeholder="ex: 175"
                className="input"
              />
            </Field>
          </div>

          <Field label="Nível de atividade física" htmlFor="nivelAtividade">
            <select
              id="nivelAtividade"
              required
              value={form.nivelAtividade}
              onChange={(e) =>
                update(
                  "nivelAtividade",
                  e.target.value as FormData["nivelAtividade"]
                )
              }
              className="input"
            >
              <option value="">Selecione</option>
              <option value="sedentario">
                Sedentário — não pratico exercícios
              </option>
              <option value="leve">Leve — 1 a 2 vezes por semana</option>
              <option value="moderado">Moderado — 3 a 4 vezes por semana</option>
              <option value="intenso">Intenso — 5+ vezes por semana</option>
            </select>
          </Field>

          <Field label="Qual é o seu objetivo principal?" htmlFor="objetivo">
            <select
              id="objetivo"
              required
              value={form.objetivo}
              onChange={(e) =>
                update("objetivo", e.target.value as FormData["objetivo"])
              }
              className="input"
            >
              <option value="">Selecione</option>
              <option value="emagrecer">Emagrecer / perder gordura</option>
              <option value="ganhar_massa">Ganhar massa muscular</option>
              <option value="definir">Definir o corpo</option>
              <option value="saude_geral">Melhorar a saúde geral</option>
            </select>
          </Field>

          <button
            type="submit"
            disabled={enviando}
            className="mt-4 inline-flex items-center justify-center h-12 sm:h-14 px-8 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold text-base sm:text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? "Analisando..." : "Gerar minha análise"}
          </button>
        </form>

        {resultado && (
          <div className="mt-6 p-4 sm:p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-900">
            <p className="text-sm sm:text-base text-indigo-900 dark:text-indigo-100">
              {resultado}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
