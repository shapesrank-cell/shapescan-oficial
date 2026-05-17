import Link from "next/link";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            ShapeScan
          </span>
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              Bem-vindo de volta
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Entre para acessar suas análises
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            Não tem conta?{" "}
            <Link
              href="/cadastro"
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Cadastre-se grátis
            </Link>
          </p>
        </div>

        <Link
          href="/"
          className="text-center text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
        >
          ← Voltar pra home
        </Link>
      </div>
    </div>
  );
}
