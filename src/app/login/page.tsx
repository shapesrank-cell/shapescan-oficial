import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
  description:
    "Acesse sua conta ShapeScan e veja suas análises de biotipo, dieta e treino.",
};

export default async function LoginPage(props: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await props.searchParams;
  const cadastroHref = redirect ? `/cadastro?redirect=${encodeURIComponent(redirect)}` : "/cadastro";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 bg-[#111111]">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-orange-400 flex items-center justify-center">
            <span className="text-black font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            ShapeScan
          </span>
        </Link>

        {/* Card */}
        <div className="bg-white/[0.08] border border-white/[0.15] backdrop-blur-2xl rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-bebas)] tracking-wide text-white">
              Bem-vindo de volta
            </h1>
            <p className="text-sm text-white/50">
              Entre para acessar suas análises
            </p>
          </div>

          <LoginForm redirect={redirect} />

          <p className="text-center text-sm text-white/50">
            Não tem conta?{" "}
            <Link
              href={cadastroHref}
              className="font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              Cadastre-se grátis
            </Link>
          </p>
        </div>

        <Link
          href="/"
          className="text-center text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          ← Voltar pra home
        </Link>
      </div>
    </div>
  );
}
