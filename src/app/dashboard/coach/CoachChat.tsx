"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Send,
  Sparkles,
  Trash2,
  Dumbbell,
} from "lucide-react";
import { limparConversa } from "./actions";

export type MensagemUI = {
  id: string;
  papel: "user" | "assistente";
  conteudo: string;
};

const SUGESTOES_COM_ANALISE = [
  "Por onde eu começo essa semana?",
  "Posso trocar algum alimento do meu plano?",
  "Estou travado no peso. O que ajustar?",
  "Monta um treino rápido pra hoje.",
];

const SUGESTOES_SEM_ANALISE = [
  "Como funciona uma boa alimentação pra ganhar massa?",
  "Quantas vezes por semana eu deveria treinar?",
  "O que é mais importante: dieta ou treino?",
  "Me dá dicas pra criar o hábito de treinar.",
];

export function CoachChat({
  iniciais,
  temAnalise,
  primeiroNome,
}: {
  iniciais: MensagemUI[];
  temAnalise: boolean;
  primeiroNome: string | null;
}) {
  const [mensagens, setMensagens] = useState<MensagemUI[]>(iniciais);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [limpando, setLimpando] = useState(false);

  const fimRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll pro fim sempre que a conversa muda (inclui o stream chegando).
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensagens]);

  // Auto-grow do textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  async function enviar(texto: string) {
    const mensagem = texto.trim();
    if (!mensagem || enviando) return;

    setErro(null);
    setInput("");

    const userId = crypto.randomUUID();
    const botId = crypto.randomUUID();
    setMensagens((prev) => [
      ...prev,
      { id: userId, papel: "user", conteudo: mensagem },
      { id: botId, papel: "assistente", conteudo: "" },
    ]);
    setEnviando(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem }),
      });

      if (!res.ok || !res.body) {
        let msg = "Algo deu errado. Tente de novo.";
        try {
          const j = (await res.json()) as { erro?: string };
          if (j?.erro) msg = j.erro;
        } catch {
          // resposta sem JSON
        }
        // Desfaz as mensagens otimistas e devolve o texto pro input.
        setMensagens((prev) =>
          prev.filter((m) => m.id !== userId && m.id !== botId)
        );
        setErro(msg);
        setInput(mensagem);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          setMensagens((prev) =>
            prev.map((m) =>
              m.id === botId ? { ...m, conteudo: m.conteudo + chunk } : m
            )
          );
        }
      }
    } catch {
      setMensagens((prev) =>
        prev.filter((m) => m.id !== userId && m.id !== botId)
      );
      setErro("Falha de conexão. Verifique sua internet e tente de novo.");
      setInput(mensagem);
    } finally {
      setEnviando(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    enviar(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar(input);
    }
  }

  async function onLimpar() {
    if (limpando) return;
    if (
      !window.confirm(
        "Apagar toda a conversa com o coach? Isso não pode ser desfeito."
      )
    )
      return;
    setLimpando(true);
    const r = await limparConversa();
    if ("erro" in r) {
      setErro(r.erro);
    } else {
      setMensagens([]);
      setErro(null);
    }
    setLimpando(false);
  }

  const vazio = mensagens.length === 0;
  const sugestoes = temAnalise ? SUGESTOES_COM_ANALISE : SUGESTOES_SEM_ANALISE;

  return (
    <div className="flex flex-1 flex-col bg-[#111111] animate-[fadeIn_0.4s_ease-out]">
      <div className="w-full max-w-3xl mx-auto flex flex-1 flex-col px-4 py-6 sm:py-8 min-h-0">
        {/* Header */}
        <header className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/20 text-white/70 hover:border-white/40 hover:text-white transition-all"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-[family-name:var(--font-bebas)] tracking-wide text-white flex items-center gap-2">
                <Sparkles size={20} className="text-orange-400" /> Coach IA
              </h1>
              <p className="text-sm text-white/50">
                Tire dúvidas sobre treino, dieta e sua evolução.
              </p>
            </div>
          </div>
          {!vazio && (
            <button
              type="button"
              onClick={onLimpar}
              disabled={limpando}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} /> {limpando ? "Limpando..." : "Limpar"}
            </button>
          )}
        </header>

        {/* Mensagens */}
        <div className="flex-1 min-h-0 overflow-y-auto -mx-1 px-1">
          {vazio ? (
            <EstadoVazio
              primeiroNome={primeiroNome}
              temAnalise={temAnalise}
              sugestoes={sugestoes}
              onEscolher={(s) => enviar(s)}
              desabilitado={enviando}
            />
          ) : (
            <ul className="flex flex-col gap-4 pb-2">
              {mensagens.map((m) => (
                <Bolha
                  key={m.id}
                  papel={m.papel}
                  conteudo={m.conteudo}
                  pensando={
                    m.papel === "assistente" && m.conteudo === "" && enviando
                  }
                />
              ))}
              <div ref={fimRef} />
            </ul>
          )}
        </div>

        {/* Erro */}
        {erro && (
          <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">{erro}</p>
          </div>
        )}

        {/* Sugestões rápidas quando já há conversa */}
        {!vazio && !enviando && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {sugestoes.slice(0, 3).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => enviar(s)}
                className="flex-shrink-0 text-xs text-white/60 px-3 py-1.5 rounded-full border border-white/15 hover:border-orange-400/40 hover:text-orange-400 transition-all whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={onSubmit} className="mt-3">
          <div className="flex items-end gap-2 p-2 rounded-2xl bg-white/[0.05] border border-white/[0.12] focus-within:border-orange-400/40 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              maxLength={4000}
              placeholder="Pergunte ao seu coach..."
              className="flex-1 bg-transparent resize-none outline-none text-sm text-white placeholder:text-white/30 px-2 py-2 max-h-40"
            />
            <button
              type="submit"
              disabled={enviando || !input.trim()}
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-orange-400 text-black hover:bg-orange-300 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Enviar mensagem"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="mt-2 text-[11px] text-white/25 text-center">
            O Coach IA pode errar e não substitui um médico, nutricionista ou
            educador físico.
          </p>
        </form>
      </div>
    </div>
  );
}

function EstadoVazio({
  primeiroNome,
  temAnalise,
  sugestoes,
  onEscolher,
  desabilitado,
}: {
  primeiroNome: string | null;
  temAnalise: boolean;
  sugestoes: string[];
  onEscolher: (s: string) => void;
  desabilitado: boolean;
}) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-5 py-8">
      <div className="h-16 w-16 rounded-2xl bg-orange-400/10 border border-orange-400/25 flex items-center justify-center text-orange-400">
        <Dumbbell size={28} />
      </div>
      <div className="flex flex-col gap-1.5 max-w-md">
        <h2 className="text-xl font-bold text-white">
          {primeiroNome ? `Bora, ${primeiroNome}!` : "Bora treinar?"}
        </h2>
        <p className="text-sm text-white/50">
          {temAnalise
            ? "Eu conheço seu perfil, sua última análise e seus check-ins. Pergunte o que quiser sobre seu plano."
            : "Posso te ajudar com treino, dieta e hábitos. Pra eu personalizar de verdade, gere uma análise no dashboard."}
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-md">
        {sugestoes.map((s) => (
          <button
            key={s}
            type="button"
            disabled={desabilitado}
            onClick={() => onEscolher(s)}
            className="text-left text-sm text-white/70 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-orange-400/30 hover:bg-white/[0.06] transition-all disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function Bolha({
  papel,
  conteudo,
  pensando,
}: {
  papel: "user" | "assistente";
  conteudo: string;
  pensando: boolean;
}) {
  const ehUser = papel === "user";
  return (
    <li className={`flex ${ehUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          ehUser
            ? "bg-orange-400 text-black rounded-br-md"
            : "bg-white/[0.06] border border-white/[0.08] text-white/90 rounded-bl-md"
        }`}
      >
        {pensando ? (
          <span className="inline-flex gap-1 py-1" aria-label="Digitando">
            <Ponto atraso={0} />
            <Ponto atraso={150} />
            <Ponto atraso={300} />
          </span>
        ) : (
          <Texto conteudo={conteudo} />
        )}
      </div>
    </li>
  );
}

function Ponto({ atraso }: { atraso: number }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-white/50 animate-bounce"
      style={{ animationDelay: `${atraso}ms` }}
    />
  );
}

/**
 * Renderiza o texto da IA de forma leve: quebra de linhas em parágrafos e
 * linhas que começam com "- " ou "• " viram itens de lista.
 */
function Texto({ conteudo }: { conteudo: string }) {
  const linhas = conteudo.split("\n");
  const blocos: React.ReactNode[] = [];
  let lista: string[] = [];

  const fecharLista = (chave: string) => {
    if (lista.length === 0) return;
    blocos.push(
      <ul key={`ul-${chave}`} className="my-1 flex flex-col gap-1">
        {lista.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-orange-400 flex-shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
    lista = [];
  };

  linhas.forEach((linha, i) => {
    const t = linha.trim();
    const m = t.match(/^[-•]\s+(.*)$/);
    if (m) {
      lista.push(m[1]);
    } else {
      fecharLista(String(i));
      if (t) {
        blocos.push(
          <p key={`p-${i}`} className={blocos.length ? "mt-2" : ""}>
            {t}
          </p>
        );
      }
    }
  });
  fecharLista("fim");

  return <>{blocos}</>;
}
