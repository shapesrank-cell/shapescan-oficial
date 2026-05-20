"use client";

import { useState, useTransition } from "react";
import { atualizarPerfil } from "./actions";

type PerfilFormProps = {
  nome: string;
  sexo: string | null;
  idade: number | null;
  peso: number | null;
  altura: number | null;
  nivelAtividade: string | null;
  objetivo: string | null;
};

export function PerfilForm(props: PerfilFormProps) {
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [carregando, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setErro(null);
    setSucesso(false);
    startTransition(async () => {
      const r = await atualizarPerfil(formData);
      if (r.erro) setErro(r.erro);
      if (r.sucesso) {
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-5">

      {/* Nome */}
      <Field label="Nome de exibição" hint="Como você quer ser chamado nas análises.">
        <input
          id="nome" name="nome" type="text" required
          defaultValue={props.nome}
          maxLength={50}
          className="input"
        />
      </Field>

      {/* Sexo biológico */}
      <Field label="Sexo biológico" hint="Influencia no cálculo de calorias.">
        <div className="grid grid-cols-3 gap-2">
          {([
            { val: "masculino", label: "Masculino" },
            { val: "feminino",  label: "Feminino" },
            { val: "outro",     label: "Outro" },
          ] as const).map(({ val, label }) => (
            <RadioCard
              key={val}
              name="sexo"
              value={val}
              label={label}
              defaultChecked={props.sexo === val}
            />
          ))}
        </div>
      </Field>

      {/* Idade + Peso + Altura */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Idade (anos)">
          <input
            id="idade" name="idade" type="number"
            min="10" max="110" step="1"
            defaultValue={props.idade ?? ""}
            placeholder="Ex: 25"
            className="input"
          />
        </Field>
        <Field label="Peso (kg)">
          <input
            id="peso" name="peso" type="number"
            min="20" max="500" step="0.1"
            defaultValue={props.peso ?? ""}
            placeholder="Ex: 70.5"
            className="input"
          />
        </Field>
        <Field label="Altura (cm)">
          <input
            id="altura" name="altura" type="number"
            min="50" max="300" step="1"
            defaultValue={props.altura ?? ""}
            placeholder="Ex: 175"
            className="input"
          />
        </Field>
      </div>

      {/* Nível de atividade */}
      <Field label="Nível de atividade">
        <div className="grid grid-cols-2 gap-2">
          {([
            { val: "sedentario", label: "Sedentário",  desc: "Sem exercícios" },
            { val: "leve",       label: "Leve",        desc: "1–2x/semana" },
            { val: "moderado",   label: "Moderado",    desc: "3–4x/semana" },
            { val: "intenso",    label: "Intenso",     desc: "5+x/semana" },
          ] as const).map(({ val, label, desc }) => (
            <RadioCard
              key={val}
              name="nivel_atividade"
              value={val}
              label={label}
              desc={desc}
              defaultChecked={props.nivelAtividade === val}
            />
          ))}
        </div>
      </Field>

      {/* Objetivo */}
      <Field label="Objetivo principal">
        <div className="grid grid-cols-2 gap-2">
          {([
            { val: "emagrecer",    label: "Emagrecer",     desc: "Perder gordura" },
            { val: "ganhar_massa", label: "Ganhar massa",  desc: "Aumentar músculo" },
            { val: "definir",      label: "Definir",       desc: "Marcar o corpo" },
            { val: "saude_geral",  label: "Saúde geral",   desc: "Bem-estar" },
          ] as const).map(({ val, label, desc }) => (
            <RadioCard
              key={val}
              name="objetivo"
              value={val}
              label={label}
              desc={desc}
              defaultChecked={props.objetivo === val}
            />
          ))}
        </div>
      </Field>

      {erro && (
        <div role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
          {erro}
        </div>
      )}

      {sucesso && (
        <div role="status" className="text-sm text-green-400 bg-green-500/10 border border-green-500/30 rounded-2xl px-4 py-3 animate-[fadeIn_0.3s_ease-out]">
          ✓ Perfil atualizado com sucesso
        </div>
      )}

      <button
        type="submit" disabled={carregando}
        className="h-12 rounded-full bg-orange-400 text-black font-semibold hover:bg-orange-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {carregando ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white/70">{label}</label>
      {children}
      {hint && <p className="text-xs text-white/30">{hint}</p>}
    </div>
  );
}

function RadioCard({
  name,
  value,
  label,
  desc,
  defaultChecked,
}: {
  name: string;
  value: string;
  label: string;
  desc?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="group cursor-pointer">
      <input
        type="radio" name={name} value={value}
        defaultChecked={defaultChecked}
        className="sr-only peer"
      />
      <div className="flex flex-col gap-0.5 p-3 rounded-xl border-2 border-white/[0.10] bg-white/[0.04] transition-all peer-checked:border-orange-400 peer-checked:bg-orange-400/[0.08] group-hover:border-white/20">
        <span className="text-sm font-semibold text-white">{label}</span>
        {desc && <span className="text-xs text-white/40">{desc}</span>}
      </div>
    </label>
  );
}
