# ShapeScan — Contexto do Projeto

## 🎯 O que é

App de análise corporal por IA. Usuário preenche dados + foto opcional e recebe biotipo + dieta + plano de treino personalizado.

Roadmap:
1. ✅ MVP web — formulário + análise IA
2. ✅ Auth + persistência (Supabase)
3. ✅ Upload de foto (Gemini Vision)
4. ✅ Dashboard com histórico de análises
5. ✅ Página de detalhe de análise
6. ✅ Polish visual geral
7. 🔜 Landing page melhorada (próximo)
8. 🔜 Acompanhamento de progresso (peso/medidas + gráfico)
9. 🔜 Compartilhar análise via link público
10. 🔜 App nativo iOS via App Store

## 👤 Sobre o usuário

- **Não é desenvolvedor** — explicar sempre em linguagem simples
- Usa **VS Code** e **Claude Code**
- Prefere ser guiado passo a passo
- Idioma: **português brasileiro**
- Usar `AskUserQuestion` quando há decisões a tomar

## 🏗️ Stack

| Camada | Tecnologia | Status |
|---|---|---|
| Framework | Next.js **16.2.6** (Turbopack, App Router) | ✅ |
| Linguagem | TypeScript | ✅ |
| Estilo | Tailwind CSS v4 | ✅ |
| IA | Google Gemini `gemini-2.5-flash` (vision + texto) | ✅ |
| Banco/Auth | Supabase (PostgreSQL + Auth) | ✅ |
| Hospedagem | Vercel (auto-deploy via GitHub `main`) | ✅ |
| PWA | Manifest + ícones via `next/og` | ✅ |

> ⚠️ **Next.js 16 breaking changes:**
> - `middleware.ts` → renomeado para `proxy.ts` (função exportada: `proxy`)
> - `params` e `searchParams` são Promises → sempre usar `await`
> - `cookies()`, `headers()` são assíncronos

## 📁 Estrutura de arquivos

```
src/
├── proxy.ts                        # Protege rotas (Next.js 16)
├── app/
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page (dinâmica: logado vs deslogado)
│   ├── not-found.tsx               # 404 personalizada
│   ├── globals.css                 # Tailwind + keyframes slideIn/fadeIn/progress
│   ├── manifest.ts                 # PWA manifest
│   ├── icon.tsx / apple-icon.tsx   # Ícones PWA
│   ├── auth/actions.ts             # Server Actions: login, cadastro, logout
│   ├── login/                      # Página de login
│   ├── cadastro/                   # Página de cadastro
│   ├── dashboard/
│   │   ├── page.tsx                # Dashboard com histórico (emojis por biotipo)
│   │   ├── LogoutButton.tsx        # Botão de logout
│   │   └── analise/[id]/page.tsx   # Detalhe de análise salva
│   ├── onboarding/
│   │   ├── page.tsx                # Onboarding 7 passos (inclui foto)
│   │   ├── AnaliseCarregando.tsx   # Loading com barra de progresso
│   │   ├── AnaliseResultado.tsx    # Resultado + salva no banco + atualiza nome
│   │   └── AnaliseView.tsx         # Visual puro (reutilizado no detalhe)
│   └── api/analyze/route.ts        # POST: chama Gemini, retorna análise
└── lib/
    ├── gemini.ts                   # Cliente Gemini + tipos + prompt (suporta foto)
    └── supabase/
        ├── client.ts               # Browser client
        └── server.ts               # Server client (cookies)
```

## 🗄️ Banco de dados Supabase

```
auth.users          — gerenciado pelo Supabase Auth
public.profiles     — id, nome, criado_em (trigger no cadastro)
public.analyses     — id, user_id, dados_entrada(jsonb), resultado(jsonb), criado_em
```

- **"Confirm email" DESATIVADO** no Supabase (cadastro imediato)
- RLS ativo — usuário só vê seus próprios dados
- SQL de migração: `supabase/migrations/001_auth_setup.sql`

## 🔑 Credenciais

| Serviço | Info |
|---|---|
| GitHub | Conta: `shapesrank-cell` · Repo: `shapescan-oficial` |
| Supabase | `https://omoniqnveezoxbaakjrb.supabase.co` · Região: São Paulo |
| Gemini | Conta: `goldenf0408@gmail.com` · Var: `GEMINI_API_KEY` · Free tier |
| Vercel | URL: `https://shapescan-oficial.vercel.app` · Branch: `main` |

> ⚠️ Usuário tem 2 contas GitHub (shapesrank-cell e CaueSRU). Sempre confirmar push vai pra `shapesrank-cell`.

## ✅ Funcionando hoje

- Landing page responsiva e dinâmica (CTA muda se logado)
- Onboarding 7 passos: nome → sexo → idade → medidas → **foto (opcional)** → atividade → objetivo
- Análise por IA: Gemini Vision (com foto) ou texto puro (sem foto)
- Login / Cadastro / Logout com Supabase Auth
- Dashboard com histórico (emoji por biotipo, animações)
- Página de detalhe de análise (`/dashboard/analise/[id]`)
- Análise salva no banco ao terminar (se logado)
- Nome do perfil atualizado a cada análise
- 404 personalizada
- PWA instalável no celular
- Deploy automático na Vercel

## ❌ Próximos passos

1. **🔥 Landing page melhorada** — mais convincente, com seções, social proof
2. **Acompanhamento de progresso** — registrar peso/medidas, gráfico de evolução
3. **Compartilhar análise** — link público bonito para compartilhar resultado
4. **Página de perfil** — editar nome, ver stats

## 🛠️ Comandos úteis

```bash
cd C:\Users\cauer\shapescan-projeto
npm run dev          # http://localhost:3000
npm run build        # validar antes de push
git add . && git commit -m "feat: ..." && git push
```

## 🎨 Identidade visual

- **Gradiente:** `from-indigo-500 via-violet-500 to-purple-600`
- **Cor tema:** `#6366f1`
- **Background:** `bg-zinc-50` / `bg-zinc-950`
- **Bordas/cards:** `rounded-2xl`, hero: `rounded-3xl`, CTAs: `rounded-full`
