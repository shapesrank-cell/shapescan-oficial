# ShapeScan — Contexto do Projeto

Este arquivo é o "estado atual" do projeto. Atualize sempre que houver mudança importante.

## 🎯 O que é

App de análise corporal por IA. Usuário preenche dados (sexo, idade, peso, altura, atividade, objetivo) e recebe biotipo + dieta + plano de treino personalizado.

Roadmap:
1. ✅ MVP web — formulário + análise IA
2. ✅ Auth + persistência (Supabase) — login/cadastro/dashboard funcionando
3. 🔜 Salvar análise no banco após geração (ligar onboarding ao Supabase)
4. 🔜 Upload de foto (Gemini Vision para análise visual)
5. 🔜 Dashboard com histórico e acompanhamento de progresso
6. 🔜 App nativo iOS via App Store

## 👤 Sobre o usuário (dono do projeto)

- **Não é desenvolvedor** — explicar conceitos técnicos sempre em linguagem simples, com analogias
- Edita arquivos no **VS Code**
- Pergunta muito "por quê" — explicar o motivo antes do "como"
- Prefere ser **guiado passo a passo**, não receber instruções genéricas
- Idioma: **português brasileiro** em todo texto de UI e comunicação

## 🧑‍💻 Padrões de comunicação que ele gosta

- Usar `AskUserQuestion` quando há decisões a tomar
- Compartilhar dicas/atalhos úteis ao longo do caminho
- Listar trade-offs honestamente antes de recomendar
- Mostrar diff/resumo do que mudou após cada bloco
- Sugerir próximo passo concreto no final de cada ciclo

## 🏗️ Stack

| Camada | Tecnologia | Status |
|---|---|---|
| Framework | Next.js **16.2.6** (Turbopack, App Router) | ✅ |
| Linguagem | TypeScript | ✅ |
| Estilo | Tailwind CSS v4 | ✅ |
| IA | **Google Gemini** (`@google/genai`, modelo `gemini-2.5-flash`) | ✅ Funcionando |
| Banco/Auth | Supabase (PostgreSQL + Auth) | ✅ Funcionando |
| Hospedagem | Vercel | ✅ Auto-deploy via GitHub |
| PWA | Manifest + ícones programáticos via `next/og` | ✅ Instalável |

> ⚠️ **Next.js 16 tem breaking changes:**
> - `middleware.ts` foi renomeado para `proxy.ts` (função exportada é `proxy`, não `middleware`)
> - `params` e `searchParams` agora são Promises (sempre usar `await`)
> - `cookies()`, `headers()` agora são assíncronos

## 📁 Estrutura de arquivos importante

```
src/
├── proxy.ts                   # Proxy Next.js 16 (antigo middleware) — protege rotas
├── app/
│   ├── layout.tsx             # Root layout + viewport mobile + appleWebApp
│   ├── page.tsx               # Tela inicial / landing
│   ├── globals.css            # Tailwind + keyframes (slideIn, fadeIn)
│   ├── manifest.ts            # PWA manifest
│   ├── icon.tsx               # Ícone Android 192x192
│   ├── apple-icon.tsx         # Ícone iOS 180x180
│   ├── auth/
│   │   └── actions.ts         # Server Actions: login(), cadastro(), logout()
│   ├── login/
│   │   ├── page.tsx           # Página de login (Server Component)
│   │   └── LoginForm.tsx      # Formulário de login (Client Component)
│   ├── cadastro/
│   │   ├── page.tsx           # Página de cadastro (Server Component)
│   │   └── CadastroForm.tsx   # Formulário de cadastro (Client Component)
│   ├── dashboard/
│   │   ├── page.tsx           # Dashboard logado — lista análises salvas
│   │   └── LogoutButton.tsx   # Botão de logout (Client Component)
│   ├── onboarding/
│   │   ├── page.tsx           # Onboarding multi-step (6 telas)
│   │   ├── AnaliseCarregando.tsx
│   │   └── AnaliseResultado.tsx  # Tela de resultado — ainda NÃO salva no banco
│   └── api/
│       └── analyze/route.ts   # POST: recebe dados, chama Gemini, retorna análise
└── lib/
    ├── gemini.ts              # Cliente Gemini + tipos + prompt + schema JSON
    └── supabase/
        ├── client.ts          # createBrowserClient (Client Components)
        └── server.ts          # createServerClient com cookies (Server Components)
```

## 🗄️ Banco de dados Supabase

Tabelas criadas (SQL em `supabase/migrations/001_auth_setup.sql`):

```
auth.users          — gerenciado pelo Supabase Auth automaticamente
public.profiles     — id, nome, criado_em (criado via trigger no cadastro)
public.analyses     — id, user_id, dados_entrada (jsonb), resultado (jsonb), criado_em
```

Configurações importantes:
- **"Confirm email" está DESATIVADO** no Supabase (cadastro imediato, sem email de confirmação)
- Row Level Security (RLS) ativo — usuário só vê seus próprios dados

## 🔑 Credenciais e Contas

### GitHub
- **Conta correta:** `shapesrank-cell`
- **Repo:** https://github.com/shapesrank-cell/shapescan-oficial
- ⚠️ Usuário tem outra conta GitHub (`CaueSRU`) configurada em alguns lugares. Confirmar push vai pra `shapesrank-cell`.

### Supabase
- **URL:** `https://omoniqnveezoxbaakjrb.supabase.co`
- **Região:** South America (São Paulo)
- **Anon key:** no `.env.local` e nas env vars da Vercel

### Google Gemini
- **Conta:** `goldenf0408@gmail.com`
- **Modelo:** `gemini-2.5-flash` (grátis, ~250 análises/dia)
- **Variável:** `GEMINI_API_KEY`

### Vercel
- **URL pública:** https://shapescan-oficial.vercel.app
- **Branch de produção:** `main` (push = deploy automático)

## ✅ O que está funcionando hoje

- Landing page responsiva
- Onboarding 6 passos + análise por IA (Gemini)
- Tela de resultado com biotipo + macros + treino + aviso legal
- PWA instalável no celular
- **Login e cadastro com Supabase Auth** ✅
- **Dashboard logado** com boas-vindas e histórico (vazio por enquanto) ✅
- Proxy protegendo rotas `/dashboard` (redireciona não-logados pro login)
- Deploy automático Vercel a cada push na `main`

## ❌ Próximos passos (em ordem de impacto)

### 1. 🔥 PRÓXIMO — Salvar análise no banco após geração
Quando o usuário termina o onboarding e vê o resultado, a análise **não é salva** ainda.
Precisa:
- Detectar se usuário está logado em `AnaliseResultado.tsx`
- Chamar Supabase para inserir na tabela `analyses` com `dados_entrada` + `resultado`
- Mostrar no dashboard depois

### 2. Upload de foto (Gemini Vision)
- Feature principal que dá nome ao app
- Gemini 2.5 Flash já suporta visão — só precisa passar a imagem base64
- Adicionar campo de foto opcional no onboarding

### 3. Detalhe de análise salva
- Ao clicar em uma análise no dashboard, abrir a tela completa de resultado
- Criar rota `/dashboard/analise/[id]`

### 4. Acompanhamento de progresso
- Registrar peso/medidas ao longo do tempo
- Gráfico simples de evolução

### 5. App nativo iOS (App Store)
- Avaliar Capacitor.js ou React Native após MVP web consolidado

## 🛠️ Comandos úteis

```bash
# Servidor de desenvolvimento
cd C:\Users\cauer\shapescan-projeto
npm run dev   # http://localhost:3000

# Build de produção (validar antes de push)
npm run build

# Commit + push (Vercel republica automaticamente)
git add .
git commit -m "feat: descrição"
git push
```

## 🎨 Identidade visual

- **Gradiente primário:** `from-indigo-500 via-violet-500 to-purple-600`
- **Cor tema:** `#6366f1` (indigo-500)
- **Background:** `bg-zinc-50` (light) / `bg-zinc-950` (dark)
- **Cards:** `rounded-2xl`, hero/destaque: `rounded-3xl`, CTAs: `rounded-full`
- **Animações:** `slideIn` e `fadeIn` em `globals.css`

## 🐛 Bugs/quirks conhecidos

- **Race condition em setTimeout:** usar `setPasso((p) => p+1)` em vez de `avancar()` diretamente
- **`.env*` no `.gitignore`:** já protegido. Confirmar antes de commits.
- **Windows + terminal:** sempre rodar `cd C:\Users\cauer\shapescan-projeto` antes do `npm run dev`
- **Git push:** confirmar que vai pra conta `shapesrank-cell`, não `CaueSRU`
