import Link from "next/link";
import {
  UserPlus,
  ClipboardList,
  Camera,
  Sparkles,
  Target,
  Zap,
  Gift,
  CheckCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ParticleCanvas from "./ParticleCanvas";
import ScrollReveal from "./ScrollReveal";
import ResultadoCardAnimado from "./ResultadoCardAnimado";

const steps = [
  {
    icon: <UserPlus size={24} />,
    title: "Crie sua conta",
    desc: "Gratuita, sem cartão de crédito",
  },
  {
    icon: <ClipboardList size={24} />,
    title: "Preencha seus dados",
    desc: "Altura, peso, idade e objetivo",
  },
  {
    icon: <Camera size={24} />,
    title: "Tire uma foto",
    desc: "Opcional, melhora a precisão",
  },
  {
    icon: <Sparkles size={24} />,
    title: "IA analisa",
    desc: "Gemini processa seu biotipo",
  },
  {
    icon: <Target size={24} />,
    title: "Receba seu plano",
    desc: "Dieta e treino personalizados",
  },
];

const differentials = [
  "Biotipo identificado com base em dados reais do seu corpo",
  "Plano de treino e dieta 100% personalizados para você",
  "Resultado em menos de 2 minutos, sem custo algum",
];

const testimonials = [
  {
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80",
    name: "Carlos M.",
    age: "31 anos",
    biotype: "Ectomorfo identificado",
    quote:
      "Sempre treinei sem resultado. O ShapeScan mostrou que eu comia de menos pro meu biotipo. Em 2 meses, ganhei 4kg de massa.",
  },
  {
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80",
    name: "Juliana R.",
    age: "26 anos",
    biotype: "Endomorfa identificada",
    quote:
      "Descobri que meu corpo responde melhor a força do que cardio. Perdi 6kg em 3 meses sem passar fome.",
  },
  {
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&h=80&q=80",
    name: "Rafael S.",
    age: "35 anos",
    biotype: "Mesomorfo identificado",
    quote:
      "Já paguei nutricionista e o ShapeScan foi igualmente personalizado. Voltei a evoluir depois de meses estagnado.",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex-1 bg-[#111111] relative overflow-x-hidden">
      <ParticleCanvas />

      {/* ── HEADER MINIMALISTA ── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-5 sm:px-10 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] rounded-2xl px-5 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shrink-0">
              <span className="text-black font-black text-sm">S</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">ShapeScan</span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm text-zinc-400">
            <a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a>
            <a href="#resultados" className="hover:text-white transition-colors">Resultados</a>
            {user && (
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            )}
          </nav>

          {/* CTA */}
          <Link
            href={user ? "/dashboard" : "/onboarding"}
            className="inline-flex items-center justify-center h-9 px-5 rounded-full bg-orange-400 text-black font-bold text-sm hover:bg-orange-300 transition-all whitespace-nowrap"
          >
            {user ? "Meu dashboard" : "Analisar grátis"}
          </Link>
        </div>
      </header>

      {/* ── HERO — foto de fundo + texto sobreposto ── */}
      <section className="relative z-10 min-h-screen overflow-hidden">
        {/* Foto de fundo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1400&h=900&q=90"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        {/* Gradientes de profundidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-[#111111]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        {/* Orbs decorativos */}
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Card flutuante — só desktop (lg+) */}
        <div className="hidden lg:block absolute top-28 right-20 z-20 w-72 animate-[fadeIn_0.8s_ease-out]">
          <ResultadoCardAnimado />
        </div>

        {/* Texto sobreposto — rodapé do hero */}
        <div className="relative z-10 flex flex-col justify-end min-h-screen px-5 sm:px-10 pt-24 pb-16 sm:pb-24">
          <div className="max-w-5xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-400/40 bg-orange-400/10 text-orange-400 text-xs font-bold tracking-widest uppercase mb-6 animate-[fadeIn_0.4s_ease-out]">
              Powered by Google AI
            </div>

            <h1 className="font-[family-name:var(--font-bebas)] text-[100px] sm:text-[150px] lg:text-[190px] leading-[0.85] text-white uppercase animate-[fadeIn_0.5s_ease-out]">
              Seu corpo
              <br />
              <span className="text-orange-400">tem um plano.</span>
            </h1>

            <p className="text-zinc-300 text-xl sm:text-2xl max-w-lg leading-relaxed mt-6 mb-8 animate-[fadeIn_0.6s_ease-out]">
              Biotipo, dieta e treino 100% personalizados por IA — em menos de 2 minutos, de graça.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 animate-[fadeIn_0.7s_ease-out]">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center h-14 px-10 rounded-full bg-orange-400 text-black font-bold text-lg hover:-translate-y-0.5 hover:bg-orange-300 transition-all shadow-lg shadow-orange-400/25"
              >
                {user ? "Nova análise" : "Fazer minha análise grátis"}
              </Link>
              <Link
                href={user ? "/dashboard" : "/login"}
                className="inline-flex items-center justify-center h-14 px-8 rounded-full border border-white/25 text-white font-semibold text-lg hover:bg-white/10 hover:border-white/40 transition-all"
              >
                {user ? "Meu dashboard" : "Já tenho conta"}
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-7 gap-y-2 mt-6 text-base text-zinc-400 animate-[fadeIn_0.8s_ease-out]">
              <span className="flex items-center gap-2">
                <Zap size={14} className="text-orange-400" /> 2 minutos de análise
              </span>
              <span className="flex items-center gap-2">
                <Gift size={14} className="text-orange-400" /> 100% gratuito
              </span>
              <span className="flex items-center gap-2">
                <Target size={14} className="text-orange-400" /> Plano personalizado
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CARD ANIMADO — só mobile/tablet (< lg) ── */}
      <div className="lg:hidden relative z-10 px-5 sm:px-10 py-8 -mt-4">
        <div className="max-w-xs mx-auto">
          <p className="text-white/40 text-xs uppercase tracking-widest text-center mb-3 font-bold">Exemplo de análise</p>
          <ResultadoCardAnimado />
        </div>
      </div>

      {/* ── POR QUE FUNCIONA ── */}
      <section className="relative z-10 py-28 sm:py-36 px-5 sm:px-10 overflow-hidden">
        {/* Orb decorativo */}
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-orange-500/8 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-24 items-center">
          {/* Foto */}
          <ScrollReveal direction="left" className="w-full order-2 lg:order-1">
            <div className="w-full aspect-[3/4] rounded-3xl overflow-hidden ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&h=1100&q=85"
                alt="Pessoa treinando"
                className="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>

          {/* Texto */}
          <ScrollReveal direction="right" delay={100} className="order-1 lg:order-2 flex flex-col gap-7">
            <span className="text-orange-400 text-xs font-bold uppercase tracking-[0.2em]">
              Por que funciona
            </span>
            <h2 className="font-[family-name:var(--font-bebas)] text-7xl sm:text-8xl lg:text-9xl text-white uppercase leading-[0.88]">
              Ciência por trás do resultado
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Cada corpo responde de forma diferente ao treino e à dieta. O
              ShapeScan usa inteligência artificial para identificar seu biotipo
              e criar um plano que realmente funciona para a sua genética.
            </p>
            <ul className="flex flex-col gap-4">
              {differentials.map((d, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-300 text-base">
                  <CheckCircle size={20} className="text-orange-400 mt-0.5 shrink-0" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* ── COMO FUNCIONA ── */}
      <section id="como-funciona" className="relative z-10 py-28 sm:py-36 px-5 sm:px-10 overflow-hidden">
        {/* Orb decorativo */}
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-orange-500/8 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-16">
            <span className="text-orange-400 text-xs font-bold uppercase tracking-[0.2em]">
              Como funciona
            </span>
            <h2 className="font-[family-name:var(--font-bebas)] text-7xl sm:text-8xl text-white uppercase leading-[0.88] mt-3">
              Do zero ao plano
              <br />
              em 5 passos
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {steps.map((step, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 70}>
                <div className="h-full flex flex-col gap-5 p-7 rounded-2xl bg-white/[0.08] border border-white/[0.15] backdrop-blur-2xl hover:border-orange-400/30 hover:bg-white/[0.11] transition-all shadow-lg shadow-black/20">
                  <div className="flex items-start justify-between">
                    <div className="w-13 h-13 w-[52px] h-[52px] rounded-xl bg-orange-400/15 border border-orange-400/25 flex items-center justify-center text-orange-400">
                      {step.icon}
                    </div>
                    <span className="text-6xl font-black text-white/[0.06] leading-none select-none">
                      {i + 1}
                    </span>
                  </div>
                  <p className="font-bold text-white text-base leading-snug">{step.title}</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESULTADOS ── */}
      <section id="resultados" className="relative z-10 py-28 sm:py-36 px-5 sm:px-10 overflow-hidden">
        {/* Orb decorativo */}
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-orange-500/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <ScrollReveal direction="up" className="text-center mb-16">
            <span className="text-orange-400 text-xs font-bold uppercase tracking-[0.2em]">
              Resultados reais
            </span>
            <h2 className="font-[family-name:var(--font-bebas)] text-7xl sm:text-8xl text-white uppercase leading-[0.88] mt-3">
              Quem usou,
              <br />
              transformou
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div className="h-full flex flex-col gap-5 p-7 sm:p-8 rounded-2xl bg-white/[0.08] border border-white/[0.15] backdrop-blur-2xl hover:border-orange-400/25 hover:bg-white/[0.11] transition-all shadow-lg shadow-black/20">
                  <div className="text-orange-400 text-xl tracking-tight">★★★★★</div>
                  <p className="text-zinc-300 text-base leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.photo}
                      alt={t.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                    />
                    <div>
                      <p className="font-bold text-white text-base">
                        {t.name}, {t.age}
                      </p>
                      <p className="text-sm text-orange-400 font-semibold">{t.biotype}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative z-10 py-28 sm:py-36 px-5 sm:px-10">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal direction="up">
            <div className="p-12 sm:p-20 rounded-3xl bg-white/[0.08] border border-white/[0.15] backdrop-blur-2xl text-center shadow-xl shadow-black/20">
              <h2 className="font-[family-name:var(--font-bebas)] text-7xl sm:text-8xl text-white uppercase leading-[0.88] mb-5">
                Pronto para descobrir o que seu corpo precisa?
              </h2>
              <p className="text-zinc-400 mb-10 text-xl">
                Gratuito. Sem cartão. Resultado em 2 minutos.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex w-full sm:w-auto items-center justify-center h-14 px-8 sm:px-12 rounded-full bg-orange-400 text-black font-bold text-lg whitespace-nowrap hover:-translate-y-0.5 hover:bg-orange-300 transition-all shadow-lg shadow-orange-400/20"
              >
                {user ? "Nova análise" : "Começar agora — é grátis"}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 py-8 px-5 border-t border-white/[0.06]">
        <p className="text-center text-sm text-zinc-600">
          © 2025 ShapeScan. Todos os direitos reservados. · Não substitui acompanhamento profissional de saúde.
        </p>
      </footer>
    </div>
  );
}
