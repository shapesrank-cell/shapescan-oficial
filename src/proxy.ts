/**
 * Proxy do Next.js 16 (antigo "middleware").
 *
 * Roda ANTES de cada requisição e:
 * 1. Mantém a sessão do Supabase atualizada (refresh do token nos cookies)
 * 2. Redireciona usuários não autenticados quando tentam acessar rotas protegidas
 *
 * 📚 Doc Next.js 16: node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSuperAdmin } from "@/lib/admin";

// Rotas que exigem login. Adicione novas rotas protegidas aqui.
const ROTAS_PROTEGIDAS = ["/dashboard", "/minhas-analises", "/onboarding", "/analise", "/perfil", "/configuracoes", "/admin"];

// Rotas que exigem role 'super_admin'
const ROTAS_ADMIN = ["/admin"];

// Rotas de auth — se o usuário JÁ está logado, redireciona pro dashboard
const ROTAS_AUTH = ["/login", "/cadastro"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: getUser() valida o token no servidor do Supabase
  // (não confie em getSession() que só lê cookie sem validar)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Não logado tentando entrar em rota protegida → manda pro login
  const ehRotaProtegida = ROTAS_PROTEGIDAS.some((rota) =>
    pathname.startsWith(rota)
  );
  if (!user && ehRotaProtegida) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Logado tentando entrar em /login ou /cadastro → manda pro dashboard
  const ehRotaAuth = ROTAS_AUTH.some((rota) => pathname.startsWith(rota));
  if (user && ehRotaAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Rota de admin: aceita se email está no allowlist OU role = 'super_admin'
  const ehRotaAdmin = ROTAS_ADMIN.some((rota) => pathname.startsWith(rota));
  if (user && ehRotaAdmin) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!isSuperAdmin(user.email, perfil?.role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Roda em tudo, EXCETO arquivos estáticos e imagens
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
