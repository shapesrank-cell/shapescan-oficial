"use client";

import { useState } from "react";
import Link from "next/link";
import type { AnaliseBiotipo } from "@/lib/gemini";
import { AnaliseResultado } from "./AnaliseResultado";
import { AnaliseCarregando } from "./AnaliseCarregando";

type FormState = {
  nome: string;
  sexo: "masculino" | "feminino" | "outro" | "";
  idade: string;
  peso: string;
  altura: string;
  nivelAtividade: "sedentario" | "leve" | "moderado" | "intenso" | "";
  objetivo: "emagrecer" | "ganhar_massa" | "definir" | "saude_geral" | "";
};

const FORM_INICIAL: FormState = {
  nome: "",
  sexo: "",
  idade: "",
  peso: "",
  altura: "",
  nivelAtividade: "",
  objetivo: "",
};

const TOTAL_PASSOS = 6;

export default function OnboardingPage() {
  const [passo, setPasso] = useState(1);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [analise, setAnalise] = useState<AnaliseBiotipo | null>(null);

  function update<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  // Retorna null se o passo está válido, ou uma mensagem de erro amigável.
  // Permitir que o usuário avance assim que preencher algo razoável.
  function erroDoPasso(): string | null {
    switch (passo) {
      case 1:
        return form.nome.trim().length === 0 ? "Digite seu nome" : null;
      case 2:
        return form.sexo === "" ? "Selecione uma opção" : null;
      case 3: {
        const idade = Number(form.idade);
        if (!form.idade) return "Digite sua idade";
        if (idade < 10 || idade > 110) return "Idade fora do esperado (10-110)";
        return null;
      }
      case 4: {
        const peso = Number(form.peso);
        const altura = Number(form.altura);
        if (!form.peso || peso <= 0) return "Digite seu peso em kg";
        if (!form.altura || altura <= 0) return "Digite sua altura em cm";
        if (altura < 50) return "Altura parece estar em metros — use cm (ex: 175)";
        return null;
      }
      case 5:
        return form.nivelAtividade === "" ? "Selecione uma opção" : null;
      case 6:
        return form.objetivo === "" ? "Selecione uma opção" : null;
      default:
        return null;
    }
  }

  const erroPasso = erroDoPasso();
  const passoValido = (): boolean => erroPasso === null;

  function avancar() {
    if (!passoValido()) return;
    if (passo < TOTAL_PASSOS) {
      setPasso((p) => p + 1);
    } else {
      enviar();
    }
  }

  function voltar() {
    if (passo > 1) setPasso((p) => p - 1);
  }

  async function enviar(objetivoForcado?: FormState["objetivo"]) {
    setEnviando(true);
    setErro(null);

    // Usa o valor passado explicitamente (vindo do clique no card) ou o do estado.
    // Isso evita race condition: clicar no card e disparar enviar() antes do React commit.
    const objetivoFinal = objetivoForcado || form.objetivo;

    try {
      const resposta = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          sexo: form.sexo,
          idade: Number(form.idade),
          peso: Number(form.peso),
          altura: Number(form.altura),
          nivelAtividade: form.nivelAtividade,
          objetivo: objetivoFinal,
        }),
      });

      const dados = await resposta.json();
      if (!resposta.ok) throw new Error(dados.erro || "Erro desconhecido");

      setAnalise(dados.analise as AnaliseBiotipo);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setEnviando(false);
    }
  }

  function resetar() {
    setAnalise(null);
    setForm(FORM_INICIAL);
    setPasso(1);
    setErro(null);
  }

  // Mostra o resultado se já tem análise gerada
  if (analise) {
    return (
      <AnaliseResultado
        analise={analise}
        nome={form.nome}
        onReset={resetar}
      />
    );
  }

  // Mostra tela de loading durante o envio
  if (enviando) {
    return <AnaliseCarregando />;
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-6 sm:py-10">
      <div className="w-full max-w-xl mx-auto flex flex-col flex-1">
        {/* Header com voltar + progresso */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center justify-between mb-4">
            {passo > 1 ? (
              <button
                onClick={voltar}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline flex items-center gap-1"
              >
                ← Voltar
              </button>
            ) : (
              <Link
                href="/"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:underline"
              >
                ← Início
              </Link>
            )}
            <span className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-500">
              {passo} de {TOTAL_PASSOS}
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${(passo / TOTAL_PASSOS) * 100}%` }}
            />
          </div>
        </div>

        {/* Conteúdo do passo atual */}
        <div
          key={passo}
          className="flex-1 flex flex-col animate-[slideIn_0.35s_ease-out]"
        >
          {passo === 1 && (
            <PassoNome
              valor={form.nome}
              onChange={(v) => update("nome", v)}
              onAvancar={avancar}
            />
          )}
          {passo === 2 && (
            <PassoSexo
              valor={form.sexo}
              onChange={(v) => {
                update("sexo", v);
                setTimeout(() => setPasso((p) => Math.min(p + 1, TOTAL_PASSOS)), 250);
              }}
            />
          )}
          {passo === 3 && (
            <PassoIdade
              valor={form.idade}
              onChange={(v) => update("idade", v)}
            />
          )}
          {passo === 4 && (
            <PassoMedidas
              peso={form.peso}
              altura={form.altura}
              onPeso={(v) => update("peso", v)}
              onAltura={(v) => update("altura", v)}
            />
          )}
          {passo === 5 && (
            <PassoAtividade
              valor={form.nivelAtividade}
              onChange={(v) => {
                update("nivelAtividade", v);
                setTimeout(() => setPasso((p) => Math.min(p + 1, TOTAL_PASSOS)), 250);
              }}
            />
          )}
          {passo === 6 && (
            <PassoObjetivo
              valor={form.objetivo}
              onChange={(v) => {
                update("objetivo", v);
                // último passo: dispara a análise direto com o valor escolhido
                if (v !== "") setTimeout(() => enviar(v), 250);
              }}
            />
          )}
        </div>

        {/* Botão Continuar (só aparece quando precisa input livre) */}
        {[1, 3, 4].includes(passo) && (
          <div className="mt-8 flex flex-col gap-2">
            <button
              onClick={avancar}
              disabled={!passoValido()}
              className="w-full h-14 rounded-full bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-semibold text-base sm:text-lg hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar
            </button>
            {/* Mostra dica em cinza quando preenchimento incompleto */}
            {erroPasso && (
              <p className="text-center text-xs sm:text-sm text-zinc-500 dark:text-zinc-500 animate-[fadeIn_0.2s_ease-out]">
                {erroPasso}
              </p>
            )}
          </div>
        )}

        {erro && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900">
            <p className="text-sm text-red-900 dark:text-red-100">
              <strong>Erro:</strong> {erro}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Passos individuais
   ============================================================ */

function PassoTitulo({
  emoji,
  titulo,
  subtitulo,
}: {
  emoji: string;
  titulo: string;
  subtitulo?: string;
}) {
  return (
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left mb-6 sm:mb-8">
      <div className="text-4xl sm:text-5xl mb-4">{emoji}</div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
        {titulo}
      </h1>
      {subtitulo && (
        <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          {subtitulo}
        </p>
      )}
    </div>
  );
}

function PassoNome({
  valor,
  onChange,
  onAvancar,
}: {
  valor: string;
  onChange: (v: string) => void;
  onAvancar: () => void;
}) {
  return (
    <>
      <PassoTitulo
        emoji="👋"
        titulo="Bem-vindo ao ShapeScan!"
        subtitulo="Pra começar, como podemos te chamar?"
      />
      <input
        type="text"
        autoFocus
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onAvancar();
        }}
        placeholder="Seu nome ou apelido"
        className="input h-14 text-lg"
      />
    </>
  );
}

function PassoSexo({
  valor,
  onChange,
}: {
  valor: FormState["sexo"];
  onChange: (v: FormState["sexo"]) => void;
}) {
  const opcoes: { id: FormState["sexo"]; label: string; emoji: string }[] = [
    { id: "masculino", label: "Masculino", emoji: "👨" },
    { id: "feminino", label: "Feminino", emoji: "👩" },
    { id: "outro", label: "Outro / Prefiro não dizer", emoji: "🧑" },
  ];

  return (
    <>
      <PassoTitulo
        emoji="👤"
        titulo="Qual seu sexo biológico?"
        subtitulo="Influencia no cálculo das calorias e necessidades."
      />
      <div className="flex flex-col gap-3">
        {opcoes.map((op) => (
          <CardSelecao
            key={op.id}
            selecionado={valor === op.id}
            onClick={() => onChange(op.id)}
            emoji={op.emoji}
            titulo={op.label}
          />
        ))}
      </div>
    </>
  );
}

function PassoIdade({
  valor,
  onChange,
}: {
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <>
      <PassoTitulo emoji="🎂" titulo="Quantos anos você tem?" />
      <div className="flex items-center justify-center my-6">
        <input
          type="number"
          autoFocus
          min="14"
          max="100"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-48 h-32 text-center text-6xl sm:text-7xl font-bold bg-transparent border-b-4 border-zinc-300 dark:border-zinc-700 focus:border-indigo-500 focus:outline-none text-zinc-900 dark:text-zinc-50 transition-colors"
        />
      </div>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
        anos
      </p>
    </>
  );
}

function PassoMedidas({
  peso,
  altura,
  onPeso,
  onAltura,
}: {
  peso: string;
  altura: string;
  onPeso: (v: string) => void;
  onAltura: (v: string) => void;
}) {
  return (
    <>
      <PassoTitulo
        emoji="📏"
        titulo="Suas medidas atuais"
        subtitulo="Pode estimar se não souber exato — depois você atualiza."
      />
      <div className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
            Peso atual (kg)
          </label>
          <input
            type="number"
            autoFocus
            step="0.1"
            min="30"
            max="300"
            value={peso}
            onChange={(e) => onPeso(e.target.value)}
            placeholder="Ex: 70.5"
            className="input h-14 text-lg"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
            Altura (cm)
          </label>
          <input
            type="number"
            min="100"
            max="250"
            value={altura}
            onChange={(e) => onAltura(e.target.value)}
            placeholder="Ex: 175"
            className="input h-14 text-lg"
          />
        </div>
      </div>
    </>
  );
}

function PassoAtividade({
  valor,
  onChange,
}: {
  valor: FormState["nivelAtividade"];
  onChange: (v: FormState["nivelAtividade"]) => void;
}) {
  const opcoes: {
    id: FormState["nivelAtividade"];
    label: string;
    desc: string;
    emoji: string;
  }[] = [
    {
      id: "sedentario",
      label: "Sedentário",
      desc: "Não pratico exercícios",
      emoji: "🛋️",
    },
    {
      id: "leve",
      label: "Leve",
      desc: "1 a 2 vezes por semana",
      emoji: "🚶",
    },
    {
      id: "moderado",
      label: "Moderado",
      desc: "3 a 4 vezes por semana",
      emoji: "🏃",
    },
    {
      id: "intenso",
      label: "Intenso",
      desc: "5 ou mais vezes por semana",
      emoji: "🔥",
    },
  ];

  return (
    <>
      <PassoTitulo
        emoji="🏃"
        titulo="Com que frequência você se exercita?"
        subtitulo="Considere academia, esporte, caminhada — qualquer atividade física."
      />
      <div className="flex flex-col gap-3">
        {opcoes.map((op) => (
          <CardSelecao
            key={op.id}
            selecionado={valor === op.id}
            onClick={() => onChange(op.id)}
            emoji={op.emoji}
            titulo={op.label}
            descricao={op.desc}
          />
        ))}
      </div>
    </>
  );
}

function PassoObjetivo({
  valor,
  onChange,
}: {
  valor: FormState["objetivo"];
  onChange: (v: FormState["objetivo"]) => void;
}) {
  const opcoes: {
    id: FormState["objetivo"];
    label: string;
    desc: string;
    emoji: string;
  }[] = [
    {
      id: "emagrecer",
      label: "Emagrecer",
      desc: "Perder gordura corporal",
      emoji: "⚖️",
    },
    {
      id: "ganhar_massa",
      label: "Ganhar massa",
      desc: "Aumentar músculos",
      emoji: "💪",
    },
    {
      id: "definir",
      label: "Definir",
      desc: "Marcar o corpo, reduzir gordura mantendo músculo",
      emoji: "🎯",
    },
    {
      id: "saude_geral",
      label: "Saúde geral",
      desc: "Bem-estar, disposição, longevidade",
      emoji: "❤️",
    },
  ];

  return (
    <>
      <PassoTitulo
        emoji="🎯"
        titulo="Qual seu objetivo principal?"
        subtitulo="Vamos personalizar tudo em torno disso."
      />
      <div className="flex flex-col gap-3">
        {opcoes.map((op) => (
          <CardSelecao
            key={op.id}
            selecionado={valor === op.id}
            onClick={() => onChange(op.id)}
            emoji={op.emoji}
            titulo={op.label}
            descricao={op.desc}
          />
        ))}
      </div>
    </>
  );
}

/* ============================================================
   Componente reutilizável: card de seleção (botão grande)
   ============================================================ */

function CardSelecao({
  selecionado,
  onClick,
  emoji,
  titulo,
  descricao,
}: {
  selecionado: boolean;
  onClick: () => void;
  emoji: string;
  titulo: string;
  descricao?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
        selecionado
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 shadow-md shadow-indigo-500/10"
          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
      }`}
    >
      <div className="text-3xl sm:text-4xl">{emoji}</div>
      <div className="flex-1">
        <p
          className={`font-semibold text-base sm:text-lg ${
            selecionado
              ? "text-indigo-900 dark:text-indigo-100"
              : "text-zinc-900 dark:text-zinc-50"
          }`}
        >
          {titulo}
        </p>
        {descricao && (
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
            {descricao}
          </p>
        )}
      </div>
      {selecionado && (
        <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm flex-shrink-0">
          ✓
        </div>
      )}
    </button>
  );
}
