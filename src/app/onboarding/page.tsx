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
  foto: string;
  fotoMimeType: string;
  fotoPreview: string;
  nivelAtividade: "sedentario" | "leve" | "moderado" | "intenso" | "";
  objetivo: "emagrecer" | "ganhar_massa" | "definir" | "saude_geral" | "";
};

const FORM_INICIAL: FormState = {
  nome: "",
  sexo: "",
  idade: "",
  peso: "",
  altura: "",
  foto: "",
  fotoMimeType: "",
  fotoPreview: "",
  nivelAtividade: "",
  objetivo: "",
};

const TOTAL_PASSOS = 7;

export default function OnboardingPage() {
  const [passo, setPasso] = useState(1);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [analise, setAnalise] = useState<AnaliseBiotipo | null>(null);

  function update<K extends keyof FormState>(campo: K, valor: FormState[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

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
        return null;
      case 6:
        return form.nivelAtividade === "" ? "Selecione uma opção" : null;
      case 7:
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
          ...(form.foto && {
            foto: form.foto,
            fotoMimeType: form.fotoMimeType,
          }),
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

  if (analise) {
    return (
      <AnaliseResultado
        analise={analise}
        nome={form.nome}
        onReset={resetar}
        dadosEntrada={form}
      />
    );
  }

  if (enviando) {
    return <AnaliseCarregando temFoto={!!form.foto} />;
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-6 sm:py-10 bg-[#111111]">
      <div className="w-full max-w-xl mx-auto flex flex-col flex-1">
        {/* Header com voltar + progresso */}
        <div className="mb-6 sm:mb-10">
          <div className="flex items-center justify-between mb-4">
            {passo > 1 ? (
              <button
                onClick={voltar}
                className="text-sm text-white/50 hover:text-white/80 transition-colors flex items-center gap-1"
              >
                ← Voltar
              </button>
            ) : (
              <Link
                href="/"
                className="text-sm text-white/50 hover:text-white/80 transition-colors"
              >
                ← Início
              </Link>
            )}
            <span className="text-xs sm:text-sm font-medium text-white/30">
              {passo} de {TOTAL_PASSOS}
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 transition-all duration-500 ease-out"
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
            <PassoFoto
              fotoPreview={form.fotoPreview}
              onFoto={(base64, mimeType, preview) => {
                update("foto", base64);
                update("fotoMimeType", mimeType);
                update("fotoPreview", preview);
              }}
              onRemover={() => {
                update("foto", "");
                update("fotoMimeType", "");
                update("fotoPreview", "");
              }}
            />
          )}
          {passo === 6 && (
            <PassoAtividade
              valor={form.nivelAtividade}
              onChange={(v) => {
                update("nivelAtividade", v);
                setTimeout(() => setPasso((p) => Math.min(p + 1, TOTAL_PASSOS)), 250);
              }}
            />
          )}
          {passo === 7 && (
            <PassoObjetivo
              valor={form.objetivo}
              onChange={(v) => {
                update("objetivo", v);
                if (v !== "") setTimeout(() => enviar(v), 250);
              }}
            />
          )}
        </div>

        {/* Botão Continuar */}
        {[1, 3, 4, 5].includes(passo) && (
          <div className="mt-8 flex flex-col gap-2">
            <button
              onClick={avancar}
              disabled={!passoValido()}
              className="w-full h-14 rounded-full bg-orange-400 text-black font-semibold text-base sm:text-lg hover:bg-orange-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {passo === 5
                ? form.foto
                  ? "Continuar com foto"
                  : "Continuar sem foto"
                : "Continuar"}
            </button>
            {erroPasso && (
              <p className="text-center text-xs sm:text-sm text-white/30 animate-[fadeIn_0.2s_ease-out]">
                {erroPasso}
              </p>
            )}
          </div>
        )}

        {erro && (
          <div className="mt-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">
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
  titulo,
  subtitulo,
}: {
  titulo: string;
  subtitulo?: string;
}) {
  return (
    <div className="flex flex-col items-center sm:items-start text-center sm:text-left mb-6 sm:mb-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-[family-name:var(--font-bebas)] tracking-wide text-white leading-tight">
        {titulo}
      </h1>
      {subtitulo && (
        <p className="mt-2 text-sm sm:text-base text-white/50">
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
  const opcoes: { id: FormState["sexo"]; label: string; desc: string }[] = [
    { id: "masculino", label: "Masculino", desc: "Corpo biológico masculino" },
    { id: "feminino", label: "Feminino", desc: "Corpo biológico feminino" },
    { id: "outro", label: "Outro / Prefiro não dizer", desc: "Será considerado na análise" },
  ];

  return (
    <>
      <PassoTitulo
        titulo="Qual seu sexo biológico?"
        subtitulo="Influencia no cálculo das calorias e necessidades."
      />
      <div className="flex flex-col gap-3">
        {opcoes.map((op) => (
          <CardSelecao
            key={op.id}
            selecionado={valor === op.id}
            onClick={() => onChange(op.id)}
            titulo={op.label}
            descricao={op.desc}
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
      <PassoTitulo titulo="Quantos anos você tem?" />
      <div className="flex items-center justify-center my-6">
        <input
          type="number"
          autoFocus
          min="14"
          max="100"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-48 h-32 text-center text-6xl sm:text-7xl font-bold bg-transparent border-b-2 border-white/20 focus:border-orange-400 focus:outline-none text-white transition-colors"
        />
      </div>
      <p className="text-center text-sm text-white/30">
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
        titulo="Suas medidas atuais"
        subtitulo="Pode estimar se não souber exato — depois você atualiza."
      />
      <div className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-medium text-white/60 mb-2 block">
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
          <label className="text-sm font-medium text-white/60 mb-2 block">
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
  }[] = [
    { id: "sedentario", label: "Sedentário", desc: "Não pratico exercícios" },
    { id: "leve", label: "Leve", desc: "1 a 2 vezes por semana" },
    { id: "moderado", label: "Moderado", desc: "3 a 4 vezes por semana" },
    { id: "intenso", label: "Intenso", desc: "5 ou mais vezes por semana" },
  ];

  return (
    <>
      <PassoTitulo
        titulo="Com que frequência você se exercita?"
        subtitulo="Considere academia, esporte, caminhada — qualquer atividade física."
      />
      <div className="flex flex-col gap-3">
        {opcoes.map((op) => (
          <CardSelecao
            key={op.id}
            selecionado={valor === op.id}
            onClick={() => onChange(op.id)}
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
  }[] = [
    { id: "emagrecer", label: "Emagrecer", desc: "Perder gordura corporal" },
    { id: "ganhar_massa", label: "Ganhar massa", desc: "Aumentar músculos" },
    { id: "definir", label: "Definir", desc: "Marcar o corpo, reduzir gordura mantendo músculo" },
    { id: "saude_geral", label: "Saúde geral", desc: "Bem-estar, disposição, longevidade" },
  ];

  return (
    <>
      <PassoTitulo
        titulo="Qual seu objetivo principal?"
        subtitulo="Vamos personalizar tudo em torno disso."
      />
      <div className="flex flex-col gap-3">
        {opcoes.map((op) => (
          <CardSelecao
            key={op.id}
            selecionado={valor === op.id}
            onClick={() => onChange(op.id)}
            titulo={op.label}
            descricao={op.desc}
          />
        ))}
      </div>
    </>
  );
}

async function redimensionarImagem(
  file: File
): Promise<{ base64: string; mimeType: string; preview: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let w = img.width;
        let h = img.height;

        if (w > MAX || h > MAX) {
          if (w > h) {
            h = Math.round((h * MAX) / w);
            w = MAX;
          } else {
            w = Math.round((w * MAX) / h);
            h = MAX;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        const base64 = dataUrl.split(",")[1];

        resolve({
          base64,
          mimeType: "image/jpeg",
          preview: dataUrl,
        });
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function PassoFoto({
  fotoPreview,
  onFoto,
  onRemover,
}: {
  fotoPreview: string;
  onFoto: (base64: string, mimeType: string, preview: string) => void;
  onRemover: () => void;
}) {
  const [processando, setProcessando] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessando(true);
    try {
      const { base64, mimeType, preview } = await redimensionarImagem(file);
      onFoto(base64, mimeType, preview);
    } catch {
      // Silencia erro se imagem inválida
    } finally {
      setProcessando(false);
    }
  }

  return (
    <>
      <PassoTitulo
        titulo="Quer enviar uma foto?"
        subtitulo="Opcional. A IA usa para refinar a análise visual do seu biotipo. Sua foto não é armazenada."
      />

      {fotoPreview ? (
        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fotoPreview}
            alt="Preview da foto enviada"
            className="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-2xl border-2 border-orange-400/50 shadow-lg shadow-orange-400/10"
          />
          <button
            type="button"
            onClick={onRemover}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Remover foto
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center gap-3 p-8 sm:p-10 rounded-2xl border-2 border-dashed border-white/[0.15] bg-white/[0.04] hover:border-orange-400/40 hover:bg-white/[0.06] transition-colors cursor-pointer">
          <div className="w-14 h-14 rounded-xl bg-white/[0.08] flex items-center justify-center text-white/40">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <p className="text-sm sm:text-base font-medium text-white/60">
            {processando
              ? "Processando..."
              : "Toque para tirar foto ou escolher da galeria"}
          </p>
          <p className="text-xs text-white/30">
            JPG, PNG — máx. 10MB
          </p>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
            disabled={processando}
          />
        </label>
      )}

      <p className="text-center text-xs text-white/30 mt-2">
        Se preferir, pule este passo — a análise funciona sem foto.
      </p>
    </>
  );
}

/* ============================================================
   Componente reutilizável: card de seleção
   ============================================================ */

function CardSelecao({
  selecionado,
  onClick,
  titulo,
  descricao,
}: {
  selecionado: boolean;
  onClick: () => void;
  titulo: string;
  descricao?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
        selecionado
          ? "border-orange-400 bg-orange-400/[0.08]"
          : "border-white/[0.10] bg-white/[0.04] hover:border-white/[0.20] hover:bg-white/[0.07]"
      }`}
    >
      <div className="flex-1">
        <p className={`font-semibold text-base sm:text-lg ${selecionado ? "text-orange-400" : "text-white"}`}>
          {titulo}
        </p>
        {descricao && (
          <p className="text-xs sm:text-sm text-white/40 mt-0.5">
            {descricao}
          </p>
        )}
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
        selecionado ? "border-orange-400 bg-orange-400" : "border-white/20"
      }`}>
        {selecionado && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </button>
  );
}
