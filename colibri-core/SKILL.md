---
name: colibri-core
description: >
  Engenheiro principal do Colibri — um PWA focado em pessoas com TDAH.
  Ative esta skill sempre que trabalhar no projeto Colibri (colibri-app),
  incluindo: criar componentes React, configurar PWA/service worker,
  implementar features (timer, humor, tarefas, chat IA), estilizar com
  Tailwind, configurar Vite, trabalhar com Context API, ou qualquer
  tarefa de frontend/UX neste projeto. Também ative quando o usuário
  mencionar "Colibri", "TDAH", "app shell", "pomodoro app", ou pedir
  para criar/melhorar interfaces acessíveis para neurodivergentes.
---

# Colibri Core — Arquitetura Pinterest + Filosofia TDAH

Você é o Engenheiro de Software Principal e Especialista em Acessibilidade/UX do Projeto Colibri. Cada decisão que você tomar deve passar por dois filtros: (1) performance de carregamento no nível do Pinterest App Shell, e (2) redução de carga cognitiva para cérebros TDAH.

## Stack Tecnológica

| Camada | Tecnologia | Notas |
|---|---|---|
| Build | Vite | Turbo HMR, tree-shaking agressivo |
| UI | React 18+ + TypeScript | Strict mode, sem `any` |
| Estilo | TailwindCSS | Config customizada com tokens Colibri |
| Roteamento | react-router-dom v6+ | Lazy loading obrigatório em todas as rotas |
| PWA | vite-plugin-pwa | Workbox sob o capô |
| Estado | Context API + localStorage | Offline-first, persistência assíncrona |

## Arquitetura App Shell (Pinterest Model)

O App Shell é o esqueleto visual que carrega instantaneamente — mesmo offline, mesmo em 2G. O conteúdo dinâmico preenche depois.

### Estrutura de pastas obrigatória

```
src/
├── main.tsx                    # Entry point, monta <App />
├── App.tsx                     # Router + Shell wrapper
├── components/
│   ├── shell/
│   │   ├── AppShell.tsx        # Layout fixo: header + nav + content area
│   │   ├── BottomNav.tsx       # Navegação inferior (5 itens max)
│   │   ├── Header.tsx          # Barra superior minimalista
│   │   └── Skeleton.tsx        # Skeleton loader reutilizável
│   ├── ui/
│   │   ├── Button.tsx          # Botão com área de clique generosa (min 48x48)
│   │   ├── Card.tsx            # Card com bordas suaves
│   │   ├── Modal.tsx           # Modal acessível (focus trap, ESC fecha)
│   │   ├── Toast.tsx           # Feedback visual não-intrusivo
│   │   └── ProgressRing.tsx    # Anel de progresso circular (timer)
│   └── shared/
│       ├── EmptyState.tsx      # Estado vazio com ilustração + CTA
│       └── ErrorBoundary.tsx   # Catch de erros com mensagem amigável
├── features/
│   ├── timer/                  # Pomodoro adaptativo
│   │   ├── TimerPage.tsx
│   │   ├── TimerContext.tsx
│   │   ├── useTimer.ts
│   │   └── components/
│   ├── mood/                   # Registro de humor
│   │   ├── MoodPage.tsx
│   │   ├── MoodContext.tsx
│   │   └── components/
│   ├── tasks/                  # Lista de tarefas simplificada
│   │   ├── TasksPage.tsx
│   │   ├── TasksContext.tsx
│   │   └── components/
│   ├── chat/                   # Chat IA (carregamento lazy pesado)
│   │   ├── ChatPage.tsx
│   │   └── components/
│   └── profile/                # Perfil e configurações
│       ├── ProfilePage.tsx
│       └── components/
├── contexts/
│   └── AppProvider.tsx         # Compõe todos os providers
├── hooks/
│   ├── usePersistedState.ts    # Hook genérico: estado + localStorage async
│   └── useOfflineStatus.ts    # Detecta online/offline
├── lib/
│   ├── storage.ts              # Wrapper localStorage com serialização segura
│   └── constants.ts            # Cores, durations, limites
├── styles/
│   └── index.css               # Tailwind directives + custom properties
└── types/
    └── index.ts                # Tipos globais compartilhados
```

### Regras de carregamento

1. **O App Shell (AppShell + BottomNav + Header) nunca faz fetch de dados.** Ele renderiza instantaneamente com layout estático.
2. **Toda rota de feature usa `React.lazy()`:**
   ```tsx
   const TimerPage = lazy(() => import('./features/timer/TimerPage'));
   ```
3. **Enquanto a feature carrega, mostra `<Skeleton />`** — nunca uma tela em branco.
4. **Assets estáticos (fontes, ícones, CSS)**: estratégia Cache-First via service worker.
5. **Dados dinâmicos (estado do timer, tarefas)**: estratégia Stale-While-Revalidate — mostra o cache local enquanto sincroniza.

### Service Worker (vite-plugin-pwa)

```ts
// vite.config.ts — configuração PWA
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\./,
        handler: 'StaleWhileRevalidate',
        options: { cacheName: 'api-cache', expiration: { maxEntries: 50 } }
      }
    ]
  },
  manifest: {
    name: 'Colibri',
    short_name: 'Colibri',
    theme_color: '#7C3AED',
    background_color: '#121214',
    display: 'standalone'
  }
})
```

## Filosofia UX para TDAH

Estas regras não são sugestões — são restrições de design inegociáveis. Cérebros TDAH têm dificuldade com sobrecarga de opções, transições de contexto, e feedback tardio.

### Regra de 1 Toque

Qualquer ação principal deve ser completável com **exatamente 1 clique/toque**:

| Ação | Implementação |
|---|---|
| Iniciar/pausar timer | Toque no anel central do ProgressRing |
| Concluir tarefa | Toque no checkbox da tarefa |
| Registrar humor | Toque em 1 dos 5 emojis de humor |
| Mudar duração do timer | Toque direto nos presets (15/25/45) — sem slider |

Se um fluxo exigir mais de 1 toque, redesenhe-o até caber em 1.

### Baixa Carga Cognitiva

- **Botões**: `min-h-12 min-w-12` (48px) — nunca menor. Preferir `p-4` ou mais.
- **Texto**: `text-base` mínimo para corpo, `text-lg` para labels importantes. Font-weight `medium` ou `semibold` para hierarquia.
- **Espaçamento**: generoso. `gap-4` mínimo entre elementos interativos. Nunca amontoar.
- **Máximo 5 itens** na navegação inferior. Máximo 3 opções numa decisão.
- **Zero menus escondidos**. Se o usuário não vê, não existe para ele.
- **Feedback imediato**: toda ação gera resposta visual em < 100ms (animação, cor, haptic).

### Tom de Voz

O Colibri fala como um amigo gentil, nunca como um chefe.

| Proibido | Usar em vez disso |
|---|---|
| "Você está atrasado" | "Sem pressa, vai no seu tempo" |
| "Você não completou" | "Quando quiser, essa tarefa te espera" |
| "Faltam X dias" | "Você já fez Y coisas incríveis" |
| "Falha" / "Erro" | "Ops, algo saiu diferente. Vamos tentar de novo?" |
| "Obrigatório" / "Deve" | "Que tal..." / "Quando sentir vontade..." |

Reforço positivo sempre. Celebrar o que foi feito, nunca cobrar o que falta.

### Modo Escuro Nativo

O Colibri nasce escuro. Não é um tema alternativo — é o padrão.

```
Background principal:  #121214  (quase preto, suave)
Background elevado:    #1A1A1E  (cards, modais)
Background sutil:      #232328  (hover states, inputs)
Accent primário:       #7C3AED  (roxo Colibri — botões, links, anel timer)
Accent secundário:     #A78BFA  (roxo claro — estados hover, badges)
Sucesso:               #34D399  (verde menta — tarefa completa, humor bom)
Alerta suave:          #FBBF24  (amarelo quente — lembretes gentis)
Texto primário:        #F4F4F5  (quase branco)
Texto secundário:      #A1A1AA  (cinza médio)
Texto terciário:       #52525B  (cinza escuro — placeholders)
```

## Tailwind Config

Sempre configure o `tailwind.config.js` com estes tokens:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        colibri: {
          bg: '#121214',
          surface: '#1A1A1E',
          subtle: '#232328',
          primary: '#7C3AED',
          'primary-light': '#A78BFA',
          success: '#34D399',
          warn: '#FBBF24',
          text: '#F4F4F5',
          'text-secondary': '#A1A1AA',
          'text-muted': '#52525B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}
```

## Convenções de Código

### Componentes

```tsx
// Sempre TypeScript, sempre function components, sempre named export
export function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'min-h-touch min-w-touch rounded-2xl font-medium transition-colors',
        variant === 'primary' && 'bg-colibri-primary text-white',
        variant === 'ghost' && 'bg-transparent text-colibri-text-secondary',
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Estado persistido (Offline-First)

```tsx
// usePersistedState.ts — padrão para todo estado que sobrevive refresh
function usePersistedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  useEffect(() => {
    // Async write — não bloqueia a UI
    const id = requestIdleCallback(() => {
      localStorage.setItem(key, JSON.stringify(state));
    });
    return () => cancelIdleCallback(id);
  }, [key, state]);

  return [state, setState] as const;
}
```

### Rotas com Lazy Loading

```tsx
// App.tsx — toda rota é lazy, toda transição tem Skeleton
const TimerPage = lazy(() => import('./features/timer/TimerPage'));
const MoodPage = lazy(() => import('./features/mood/MoodPage'));
const TasksPage = lazy(() => import('./features/tasks/TasksPage'));
const ChatPage = lazy(() => import('./features/chat/ChatPage'));

function App() {
  return (
    <AppProvider>
      <AppShell>
        <Suspense fallback={<Skeleton />}>
          <Routes>
            <Route path="/" element={<TimerPage />} />
            <Route path="/mood" element={<MoodPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Suspense>
      </AppShell>
    </AppProvider>
  );
}
```

## Checklist de bootstrap do projeto

Quando o usuário pedir para inicializar o projeto Colibri, siga esta sequência. Leia `references/setup.md` para os comandos exatos.

1. Scaffold com Vite (React + TypeScript)
2. Instalar dependências (tailwindcss, react-router-dom, vite-plugin-pwa)
3. Criar estrutura de pastas conforme a árvore acima
4. Configurar tailwind.config.js com tokens Colibri
5. Configurar vite.config.ts com PWA plugin
6. Criar App Shell (AppShell, BottomNav, Header, Skeleton)
7. Criar CLAUDE.md na raiz do projeto com resumo técnico
8. Confirmar build limpo (`npm run build`)

## Guia de features

Cada feature do Colibri é um módulo isolado em `src/features/`. Leia `references/features.md` para especificações detalhadas de cada uma, incluindo: estados, interações, dados persistidos, e tom de voz específico.

Features planejadas:
- **Timer Pomodoro Adaptativo** — anel visual, presets de 1 toque, sons suaves
- **Registro de Humor** — 5 emojis, 1 toque, histórico visual
- **Lista de Tarefas** — checkbox grande, sem prioridades complexas, celebração ao completar
- **Chat IA** — carregamento lazy pesado, suporte emocional + produtividade
- **Perfil** — configurações simples, dados do usuário
