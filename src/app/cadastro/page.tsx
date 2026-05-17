import Link from "next/link";
import { CadastroForm } from "./CadastroForm";

export default function CadastroPage() {
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
              Crie sua conta
            </h1>
            <p className="text-sm text-white/50">
              Grátis e leva menos de 1 minuto
            </p>
          </div>

          <CadastroForm />

          <p className="text-center text-sm text-white/50">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-orange-400 hover:text-orange-300 transition-colors"
            >
              Faça login
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
