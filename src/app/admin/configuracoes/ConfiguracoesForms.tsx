"use client";

import { useState, useTransition } from "react";
import { salvarApiKey, salvarFeatureFlags } from "./actions";

function mascarar(valor: string): string {
  if (!valor || valor.length < 8) return valor || "";
  return valor.slice(0, 6) + "•".repeat(Math.min(valor.length - 10, 20)) + valor.slice(-4);
}

export function FormApiKey({
  chave,
  label,
  valorAtual,
}: {
  chave: string;
  label: string;
  valorAtual: string;
}) {
  const [editando, setEditando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErro(null);
    setSucesso(false);
    startTransition(async () => {
      const r = await salvarApiKey(formData);
      if (r.erro) {
        setErro(r.erro);
      } else {
        setSucesso(true);
        setEditando(false);
        setTimeout(() => setSucesso(false), 3000);
      }
    });
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">{label}</span>
        {valorAtual && valorAtual.length > 4 ? (
          <span className="text-xs text-green-400 font-medium bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
            Configurada
          </span>
        ) : (
          <span className="text-xs text-red-400 font-medium bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
            Não configurada
          </span>
        )}
      </div>

      {valorAtual && valorAtual.length > 4 && (
        <p className="text-xs font-mono text-white/30 bg-white/[0.03] px-3 py-2 rounded-lg border border-white/[0.05]">
          {mascarar(valorAtual)}
        </p>
      )}

      {!editando ? (
        <button
          type="button"
          onClick={() => setEditando(true)}
          className="self-start text-xs text-orange-400 hover:text-orange-300 transition-colors"
        >
          {valorAtual && valorAtual.length > 4 ? "✎ Atualizar chave" : "+ Adicionar chave"}
        </button>
      ) : (
        <form action={handleSubmit} className="flex flex-col gap-2">
          <input type="hidden" name="chave" value={chave} />
          <input
            name="valor"
            type="password"
            required
            placeholder={`Nova chave ${label}`}
            className="input text-xs"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="flex-1 text-xs h-9 rounded-full border border-white/20 text-white/50 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="flex-1 text-xs h-9 rounded-full bg-orange-400 text-black font-semibold hover:bg-orange-300 disabled:opacity-50 transition-all"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}

      {sucesso && (
        <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          ✓ Chave atualizada com sucesso
        </p>
      )}
      {erro && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {erro}
        </p>
      )}
    </div>
  );
}

export function FormFeatureFlags({
  fotoUpload,
  claudeAi,
}: {
  fotoUpload: boolean;
  claudeAi: boolean;
}) {
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErro(null);
    setSucesso(false);
    startTransition(async () => {
      const r = await salvarFeatureFlags(formData);
      if (r.erro) setErro(r.erro);
      else {
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <ToggleRow
        name="foto_upload"
        label="Upload de foto"
        descricao="Permite que usuários enviem foto para análise visual"
        defaultChecked={fotoUpload}
      />
      <ToggleRow
        name="claude_ai"
        label="Claude AI (Anthropic)"
        descricao="Usar Claude como provedor de IA principal ao invés do Gemini"
        defaultChecked={claudeAi}
      />

      {sucesso && (
        <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
          ✓ Features atualizadas
        </p>
      )}
      {erro && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={salvando}
        className="h-10 rounded-full bg-orange-400 text-black text-sm font-semibold hover:bg-orange-300 disabled:opacity-50 transition-all"
      >
        {salvando ? "Salvando..." : "Salvar features"}
      </button>
    </form>
  );
}

function ToggleRow({
  name,
  label,
  descricao,
  defaultChecked,
}: {
  name: string;
  label: string;
  descricao: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center justify-between gap-4 p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl cursor-pointer hover:bg-white/[0.05] transition-colors">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="text-xs text-white/40">{descricao}</span>
      </div>
      {/* O input e os divs visuais são irmãos para que peer-checked: funcione */}
      <div className="relative w-10 h-6 flex-shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="sr-only peer"
        />
        <div className="absolute inset-0 rounded-full border bg-white/[0.08] border-white/[0.12] peer-checked:bg-orange-400 peer-checked:border-orange-400 transition-all" />
        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-4" />
      </div>
    </label>
  );
}
