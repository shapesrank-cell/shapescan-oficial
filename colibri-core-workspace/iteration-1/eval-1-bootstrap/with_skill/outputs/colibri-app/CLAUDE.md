# Colibri — PWA para TDAH

## Stack
- **Build:** Vite + React 18 + TypeScript (strict, sem `any`)
- **Estilo:** TailwindCSS v4 com tokens customizados Colibri
- **Roteamento:** react-router-dom v6 (lazy loading em todas as rotas)
- **PWA:** vite-plugin-pwa (Workbox, autoUpdate)
- **Estado:** Context API + localStorage (offline-first)

## Estrutura de pastas
```
src/
  components/shell/   — AppShell, BottomNav, Header, Skeleton
  components/ui/      — Button, Card, Modal, Toast, ProgressRing
  components/shared/  — ErrorBoundary, EmptyState
  features/           — timer, mood, tasks, chat, profile (cada um isolado)
  contexts/           — AppProvider (compoe providers)
  hooks/              — usePersistedState, useOfflineStatus
  lib/                — storage, constants
  styles/             — index.css (Tailwind directives + custom props)
  types/              — tipos globais
```

## Paleta de cores
- Background: `#121214` | Surface: `#1A1A1E` | Subtle: `#232328`
- Primary: `#7C3AED` | Primary Light: `#A78BFA`
- Success: `#34D399` | Warn: `#FBBF24`
- Text: `#F4F4F5` | Text Secondary: `#A1A1AA` | Text Muted: `#52525B`

## Regras UX TDAH
- **1 toque** para qualquer acao principal
- **min 48x48** area de clique em tudo interativo
- **Max 5 itens** na nav inferior, max 3 opcoes numa decisao
- **Zero menus escondidos** — se nao ve, nao existe
- **Feedback em < 100ms** — toda acao gera resposta visual
- **Tom gentil** — reforco positivo, nunca cobrar

## Comandos
```bash
npm run dev      # localhost:5173
npm run build    # build de producao
npm run preview  # preview do build
```
