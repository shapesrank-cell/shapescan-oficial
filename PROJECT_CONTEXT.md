# ShapeScan — Contexto do Projeto

## 🎯 O que é

App de análise corporal por IA. Usuário cria conta, preenche perfil básico no onboarding e depois pode gerar análises (com foto opcional) que retornam biotipo + dieta + plano de treino personalizado.

**Fluxo atual (importante):**
```
Cadastro → Onboarding (6 passos, SEM foto) → Dashboard
                                              ↓
                                  Nova análise → /analise/nova
                                              ↓
                                  Foto opcional + Gerar
                                              ↓
                                  Resultado salvo
```

## 👤 Sobre o usuário

- **Não é desenvolvedor** — explicar sempre em linguagem simples
- Usa **VS Code** e **Claude Code**
- Prefere ser guiado passo a passo
- Idioma: **português brasileiro**
- Usar `AskUserQuestion` quando há decisões a tomar
- Estilo de comunicação: direto, sem firula, mostrar trade-offs

## 🏗️ Stack

| Camada | Tecnologia | Status |
|---|---|---|
| Framework | Next.js **16.2.6** (Turbopack, App Router) | ✅ |
| Linguagem | TypeScript | ✅ |
| Estilo | Tailwind CSS v4 | ✅ |
| IA | Google Gemini `gemini-2.5-flash` (vision + texto) | ✅ |
| Banco/Auth | Supabase (PostgreSQL + Auth) | ✅ |
| Hospedagem | Vercel (auto-deploy via GitHub `main`) | ✅ |
| Analytics | `@vercel/analytics` | ✅ |
| PWA | Manifest + ícones via `next/og` | ✅ |
| Fontes | Geist Sans/Mono + Bebas Neue (display) | ✅ |

> ⚠️ **Next.js 16 breaking changes:**
> - `middleware.ts` → renomeado para `proxy.ts` (função exportada: `proxy`)
> - `params` e `searchParams` são **Promises** → sempre usar `await`
> - `cookies()`, `headers()` são assíncronos

## 📁 Estrutura de arquivos

```
src/
├── proxy.ts                              # Protege rotas + admin check
├── lib/
│   ├── admin.ts                          # SUPER_ADMIN_EMAILS + isSuperAdmin()
│   ├── auditLog.ts                       # logAction() + custo IA helpers
│   ├── errorLog.ts                       # logError() + withErrorLogging()
│   ├── rateLimit.ts                      # checkRateLimit() persistente
│   ├── gemini.ts                         # Cliente Gemini + tipos
│   └── supabase/
│       ├── client.ts                     # Browser client
│       ├── server.ts                     # Server client (cookies)
│       └── admin.ts                      # Service role (bypass RLS)
└── app/
    ├── layout.tsx                        # Root + metadata + Analytics
    ├── page.tsx                          # Landing (stats reais, sem testimonials fake)
    ├── not-found.tsx                     # 404
    ├── manifest.ts / icon.tsx / apple-icon.tsx    # PWA (laranja)
    ├── opengraph-image.tsx               # OG image dinâmica
    ├── globals.css                       # Tailwind + animações
    ├── termos/page.tsx                   # Termos de Uso (LGPD)
    ├── privacidade/page.tsx              # Política de Privacidade (LGPD)
    ├── auth/actions.ts                   # login / cadastro / logout
    ├── login/                            # Login + LoginForm
    ├── cadastro/                         # Cadastro + checkbox termos obrigatório
    ├── dashboard/
    │   ├── page.tsx                      # Dashboard (stats, histórico)
    │   ├── LogoutButton.tsx
    │   ├── analise/[id]/page.tsx         # Detalhe de análise salva
    │   └── comparar/                     # Comparar 2 análises lado a lado
    ├── onboarding/
    │   ├── page.tsx                      # 6 passos (SEM foto): nome→sexo→idade→medidas→atividade→objetivo
    │   └── actions.ts                    # salvarPerfilOnboarding (só salva, NÃO gera análise)
    ├── analise/
    │   └── nova/
    │       ├── page.tsx                  # Lê perfil, redirect /onboarding se incompleto
    │       └── AnaliseNovaClient.tsx     # Foto opcional + gerar + redirect /dashboard/analise/[id]
    ├── perfil/                           # Editar nome + ver stats (não tem editar outros campos ainda)
    ├── configuracoes/
    │   ├── page.tsx                      # Mudar senha + LGPD download + deletar conta
    │   ├── ExportarDadosBotao.tsx        # LGPD: baixa JSON
    │   └── actions.ts                    # mudarSenha + deletarConta + baixarMeusDados
    ├── api/analyze/route.ts              # POST: auth + rate limit + valida + Gemini + salva server
    └── admin/                            # 🛡️ Painel super admin (RBAC + email allowlist)
        ├── layout.tsx                    # Auth gate + sidebar
        ├── AdminSidebar.tsx              # Sidebar agrupada (Visão geral/Dados/Operações)
        ├── BotaoExportar.tsx             # Export CSV reutilizável
        ├── actions.ts                    # Reexporta CSV exports
        ├── page.tsx                      # Dashboard rico: KPIs + custo IA + gráfico 7d + top users
        ├── sistema/page.tsx              # Health check + custo IA mês atual vs anterior
        ├── usuarios/
        │   ├── page.tsx                  # Lista com busca/filtros/sort/paginação
        │   ├── FiltrosUsuarios.tsx
        │   ├── RoleSelectorCliente.tsx
        │   ├── actions.ts                # alterarRole + suspender + reativar + deletar + exportCSV
        │   └── [id]/page.tsx             # Detalhe + ações destrutivas
        ├── analises/
        │   ├── page.tsx                  # Lista com filtros biotipo/IA/período
        │   ├── FiltrosAnalises.tsx
        │   ├── actions.ts
        │   └── [id]/page.tsx             # Input + output IA em JSON
        ├── auditoria/                    # Log de todas as ações admin
        ├── configuracoes/                # API keys + feature flags
        └── ...
```

## 🗄️ Banco de dados Supabase

**Project ID:** `omoniqnveezoxbaakjrb` (NÃO confundir com "shapesrank-cell's Project" que é OUTRO)

```
auth.users              — gerenciado pelo Supabase Auth
public.profiles         — id, nome, role, status, sexo, idade, peso, altura,
                          nivel_atividade, objetivo, perfil_completo,
                          perfil_atualizado_em, termos_aceitos_em, criado_em
public.analyses         — id, user_id, dados_entrada(jsonb), resultado(jsonb),
                          provider_ia ('gemini'|'claude'), criado_em
public.workspaces       — futuro multi-tenant B2B (existe, sem uso ainda)
public.app_settings     — gerenciado via /admin/configuracoes (API keys, feature flags)
public.audit_log        — toda ação admin é registrada aqui
public.error_log        — erros de produção (capturados via logError)
public.rate_limit_log   — sliding window rate limiting
```

- **"Confirm email" DESATIVADO** no Supabase (cadastro imediato)
- RLS ativo em TODAS as tabelas
- Migrações em `supabase/migrations/`:
  - `001_auth_setup.sql` — base (profiles, analyses, trigger)
  - `002_super_admin.sql` — role column, is_super_admin(), workspaces, app_settings
  - `003_admin_panel.sql` — status profile, provider_ia analyses, audit_log
  - `004_security_hardening.sql` — rate_limit_log, error_log, termos_aceitos_em
  - `005_profile_fields.sql` — campos do perfil (sexo, idade, peso, altura, etc)

**⚠️ Todas as migrations 001-005 já foram rodadas no projeto correto** (`omoniqnveezoxbaakjrb`).

## 🔑 Credenciais

| Serviço | Info |
|---|---|
| GitHub | Conta: `shapesrank-cell` · Repo: `shapescan-oficial` |
| Supabase | `https://omoniqnveezoxbaakjrb.supabase.co` · Região: AWS us-west |
| Gemini | Conta: `goldenf0408@gmail.com` · Var: `GEMINI_API_KEY` · Free tier |
| Vercel | URL: `https://shapescan-oficial.vercel.app` · Branch: `main` |
| Super Admin | `shapesrank@gmail.com` e `goldenf0408@gmail.com` (hardcoded em `lib/admin.ts`) |
| Env vars Vercel | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` |

> ⚠️ Usuário tem 2 contas GitHub (shapesrank-cell e CaueSRU). Sempre confirmar push vai pra `shapesrank-cell`.
> ⚠️ Usuário tem 2 projetos Supabase. O CORRETO é `omoniqnveezoxbaakjrb` (não `shapesrank-cell's Project`).

## 🛡️ Segurança implementada

- ✅ `/api/analyze` exige login (401 anon)
- ✅ Rate limit persistente: 10/hora + 30/dia por usuário
- ✅ Validação server-side completa (ranges, whitelists, mimeType)
- ✅ Limite 5MB na foto base64
- ✅ Save de análise SERVER-SIDE (sem race condition)
- ✅ Senha mínima 8 caracteres
- ✅ Audit log de toda ação admin
- ✅ Error log com contexto do usuário
- ✅ RLS em todas as tabelas + super_admin policy

## ⚖️ Legal/LGPD

- ✅ Termos de Uso em `/termos`
- ✅ Política de Privacidade em `/privacidade`
- ✅ Checkbox de aceite obrigatório no cadastro
- ✅ Botão "Baixar meus dados (JSON)" em `/configuracoes`
- ✅ Botão "Deletar conta" em `/configuracoes`
- ✅ Stats reais na landing (testimonials fake removidos)

## ✅ Funcionando hoje (estado real)

- Landing com stats reais do banco + 4 promessas honestas
- Cadastro com checkbox de termos obrigatório
- Onboarding 6 passos (sem foto, sem análise) → salva perfil → dashboard
- `/analise/nova` mostra perfil + foto opcional + gera análise
- Resultado salvo em `/dashboard/analise/[id]`
- Comparar 2 análises lado a lado
- Perfil edita nome (FALTA: editar os outros campos do perfil)
- Configurações: senha (8+ caracteres) + LGPD download + deletar conta
- 404 personalizada
- PWA instalável (cor laranja correta)
- OG image dinâmica (preview bonito em WhatsApp/redes)
- Vercel Analytics ativo
- Painel admin completo (`/admin`) com dashboard, usuários, análises, sistema, auditoria, configurações

## 🚀 Próximos passos (TIER 2)

Sugerido na auditoria GOD MODE — em ordem de prioridade:

1. **🔥 Forgot password funcional** (reset por email via Supabase) — ~1h
2. **🔥 Export PDF da análise** (botão "Salvar PDF" no detalhe) — ~2h
3. **🔥 Editar perfil completo** (`/perfil` ainda só edita nome; falta sexo/idade/peso/altura/atividade/objetivo) — ~1h
4. **Gráfico de evolução** (peso/IMC ao longo das análises no dashboard) — ~2h
5. **2FA pro super admin** (segurança crítica) — ~2h
6. **Custom domain** (.com.br) — 30min + R$ 40/ano
7. **Email de boas-vindas** via Resend — ~1h
8. **Loading skeletons** padronizados — ~1h
9. **Toast notification system** unificado — ~30min

> Próxima sessão: começar pelo **#1 (forgot password)** confirmado pelo usuário.

## 🛠️ Comandos úteis

```bash
cd C:\Users\cauer\shapescan-projeto
npm run dev          # http://localhost:3000
npm run build        # validar antes de push

# Worktree (onde edits acontecem)
cd C:\Users\cauer\shapescan-projeto\.claude\worktrees\quirky-tu-1cd236
git add . && git commit -m "feat: ..." && git push origin claude/quirky-tu-1cd236

# Merge pra main (deploy automático)
cd C:\Users\cauer\shapescan-projeto
git merge origin/claude/quirky-tu-1cd236 --no-ff
git push origin main
```

## 🎨 Identidade visual (ATUAL — dark/laranja)

- **Background:** `#111111` (body) / `#0a0a0a` (admin) / `#0d0d0d` (sidebar admin)
- **Accent principal:** `orange-400` (#fb923c) — usado em CTAs, highlights, ícones ativos
- **Bordas:** `border-white/[0.08]` a `border-white/[0.15]` (sutil dark)
- **Cards:** `bg-white/[0.04]` a `bg-white/[0.08]` (glass dark)
- **Texto:** `text-white` / `text-white/70` / `text-white/40` / `text-white/30` (hierarquia)
- **Fonte display:** `font-[family-name:var(--font-bebas)]` (Bebas Neue) em headings
- **Bordas/cards:** `rounded-2xl`, hero: `rounded-3xl`, CTAs: `rounded-full`
- **PWA themeColor:** `#fb923c` (laranja)

## 📐 Workflow de desenvolvimento

1. Edits acontecem no **worktree** (`C:\Users\cauer\shapescan-projeto\.claude\worktrees\quirky-tu-1cd236`)
2. Branch do worktree: `claude/quirky-tu-1cd236`
3. Push do worktree → branch remote
4. Merge na pasta principal (`C:\Users\cauer\shapescan-projeto`, branch `main`) com `--no-ff`
5. Push pro main → Vercel deploya automático
6. Migrations rodadas manualmente pelo usuário no Supabase SQL Editor
