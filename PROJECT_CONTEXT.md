# ShapeScan — Contexto do Projeto

Este arquivo é o "estado atual" do projeto. Atualize sempre que houver mudança importante.

## 🎯 O que é

App de análise corporal por IA. Usuário preenche dados (sexo, idade, peso, altura, atividade, objetivo) e recebe biotipo + dieta + plano de treino personalizado.

Roadmap:
1. ✅ MVP web (atual) — formulário + análise IA
2. 🔜 Auth + persistência (Supabase)
3. 🔜 Upload de foto (Gemini Vision para análise visual)
4. 🔜 Dashboard logado + acompanhamento de progresso
5. 🔜 App nativo iOS via App Store

## 👤 Sobre o usuário (dono do projeto)

- **Não é desenvolvedor** — explicar conceitos técnicos sempre em linguagem simples, com analogias
- Edita arquivos no **VS Code**
- Pergunta muito "por quê" — explicar o motivo antes do "como"
- Prefere ser **guiado passo a passo**, não receber instruções genéricas
- Cometeu o erro de colar uma chave da Anthropic no chat (já revogada). Reforçar segurança quando lidar com chaves
- Idioma: **português brasileiro** em todo texto de UI e comunicação

## 🧑‍💻 Padrões de comunicação que ele gosta

- Usar `AskUserQuestion` quando há decisões a tomar
- Compartilhar dicas/atalhos úteis ao longo do caminho (Ctrl+Shift+I, F12, etc.)
- Listar trade-offs honestamente antes de recomendar
- Mostrar diff/resumo do que mudou após cada bloco
- Sugerir próximo passo concreto no final de cada ciclo

## 🏗️ Stack

| Camada | Tecnologia | Status |
|---|---|---|
| Framework | Next.js **16.2.6** (Turbopack, App Router) | ✅ Configurado |
| Linguagem | TypeScript | ✅ |
| Estilo | Tailwind CSS v4 | ✅ |
| IA | **Google Gemini** (`@google/genai`, modelo `gemini-2.5-flash`) | ✅ Funcionando, grátis |
| Banco/Auth | Supabase (PostgreSQL + Auth) | ⚙️ Clients criados em `src/lib/supabase/`, ainda NÃO usados |
| Hospedagem | Vercel | ✅ Auto-deploy via GitHub |
| PWA | Manifest + ícones programáticos via `next/og` | ✅ Instalável |

> ⚠️ **Next.js 16 tem breaking changes.** Antes de escrever código novo, consulte `node_modules/next/dist/docs/` — APIs, `params`/`searchParams` agora são Promises etc. Veja `AGENTS.md`.

## 📁 Estrutura de arquivos importante

```
src/
├── app/
│   ├── layout.tsx             # Root layout + viewport mobile + appleWebApp
│   ├── page.tsx               # Tela inicial / landing
│   ├── globals.css            # Tailwind + @utility input + keyframes (slideIn, fadeIn)
│   ├── manifest.ts            # PWA manifest
│   ├── icon.tsx               # Ícone Android 192x192 (gerado por código, gradient roxo + "S")
│   ├── apple-icon.tsx         # Ícone iOS 180x180
│   ├── onboarding/
│   │   ├── page.tsx           # Onboarding multi-step (6 telas)
│   │   ├── AnaliseCarregando.tsx  # Loading animado com mensagens rotativas
│   │   └── AnaliseResultado.tsx   # Tela de resultado (cards + gradientes)
│   └── api/
│       └── analyze/route.ts   # POST: recebe dados, chama Gemini, retorna análise
└── lib/
    ├── gemini.ts              # Cliente Gemini + tipos + prompt + schema JSON
    └── supabase/
        ├── client.ts          # createBrowserClient (Client Components)
        └── server.ts          # createServerClient com cookies (Server Components/Actions)
```

## 🔑 Credenciais e Contas

### GitHub
- **Conta correta:** `shapesrank-cell`
- **Repo:** https://github.com/shapesrank-cell/shapescan-oficial
- ⚠️ O usuário tem outra conta GitHub (`CaueSRU`) ainda configurada no Git local em alguns lugares. Sempre confirmar que o push vai pra `shapesrank-cell`.
- Git Credential Manager (Windows) gerencia auth — se der 403, limpar com `git credential-manager erase`

### Supabase (público — pode estar no código)
- **URL:** `https://omoniqnveezoxbaakjrb.supabase.co`
- **Anon key:** sim, está no `.env.local` e nas env vars da Vercel
- **Região:** South America (São Paulo)
- ⚠️ Ainda não tem tabelas criadas — Supabase está pronto para ser usado mas vazio

### Google Gemini (chave secreta — só no `.env.local` e Vercel)
- **Conta:** `goldenf0408@gmail.com`
- **Modelo:** `gemini-2.5-flash` (grátis, ~250 análises/dia, suporta vision)
- **Variável:** `GEMINI_API_KEY`
- Plano: **Free Tier** (sem cartão cadastrado, sem risco de cobrança)

### Vercel
- **Projeto:** `shapescan-oficial`
- **URL pública:** https://shapescan-oficial.vercel.app
- **Branch de produção:** `main` (push = deploy automático)
- **Env vars configuradas:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`

## ✅ O que está funcionando hoje

- Tela inicial responsiva com 3 cards de features
- Onboarding em **6 passos** com cards selecionáveis, barra de progresso animada, validação com mensagens visíveis
- Tela de loading com 5 mensagens rotativas
- Tela de resultado com biotipo + pontos fortes/desafios + macros + treino + aviso legal
- API `/api/analyze` integrada com Gemini retornando JSON estruturado
- PWA instalável no celular (manifest + ícones + viewport correto)
- Deploy automático Vercel a cada push na `main`

## ❌ O que NÃO está feito (próximos passos sugeridos, em ordem de impacto)

1. **Autenticação + persistência da análise** (Supabase já configurado, falta usar)
   - Tabela `users`, `analyses`
   - Páginas `/login`, `/cadastro`
   - Middleware Next.js para proteger rotas
   - Salvar análise gerada ligada ao user_id
2. **Dashboard logado** (`/app` ou `/dashboard`) com resumo do biotipo, atalhos
3. **Upload de foto + análise visual** (Gemini Vision suporta — feature que dá nome ao app)
4. **Acompanhamento de progresso** — registrar peso/medidas ao longo do tempo, gráfico
5. **Service Worker / offline** — apenas se desejarmos modo offline real

## 🐛 Bugs/quirks conhecidos

- **Race condition em setTimeout(state-reading-fn)**: já corrigido usando `setPasso((p) => p+1)` em vez de `avancar()`. Em formulários reativos, sempre usar functional setters ou passar valores explicitamente.
- **next dev em background pode duplicar:** se `Run taskkill /PID xxx /F to stop it`, matar o PID antigo antes de subir novo.
- **`.env*` no `.gitignore`:** já está protegido. Confirmar antes de commits.
- **Windows + Git Bash + caminhos com `\`:** comandos com paths Windows funcionam, mas heredoc requer cuidado com aspas.

## 🛠️ Comandos úteis no projeto

```bash
# Servidor de desenvolvimento (hot reload)
cd C:\Users\cauer\shapescan-projeto
npm run dev                    # http://localhost:3000

# Build de produção (validar antes de push)
npm run build

# Ver mudanças não commitadas
git status

# Commit + push (Vercel detecta e republica)
git add .
git commit -m "feat: descrição"
git push
```

## 🎨 Identidade visual

- **Logo:** letra "S" em gradiente `from-indigo-500 via-violet-500 to-purple-600`
- **Cor primária (theme_color):** `#6366f1` (indigo-500)
- **Background:** `bg-zinc-50` (light) / `bg-zinc-950` (dark)
- **Bordas/cards:** `rounded-2xl` para componentes, `rounded-3xl` para hero/destaque, `rounded-full` para CTAs
- **Animações:** keyframes `slideIn` (transição entre passos) e `fadeIn` (entradas suaves), ambos em `globals.css`

## 💬 Decisões de produto registradas

- **Foto opcional**, dados manuais obrigatórios — privacidade
- **100% IA** no MVP, sem validação humana
- **Português primeiro**, internacionalização depois
- **Freemium** como modelo de negócio (free + premium futuro)
- **MVP web** → **PWA** → **App Store nativo** (caminho de evolução)
- **AVISO LEGAL obrigatório** em toda análise: "não substitui acompanhamento profissional"
