# Features Colibri — Especificações Detalhadas

Cada feature é um módulo isolado em `src/features/<nome>/`. Contém sua própria page, context (se necessário), hooks, e subcomponentes.

---

## 1. Timer Pomodoro Adaptativo

**Caminho:** `src/features/timer/`

### O que faz
Timer visual com anel de progresso circular. O usuário escolhe uma duração com 1 toque em um preset e inicia/pausa tocando no anel central.

### Interações (todas em 1 toque)
- Tocar no anel: inicia/pausa
- Tocar em preset (15/25/45 min): muda duração instantaneamente
- Timer completo: vibração suave + mensagem de celebração

### Componentes
- `TimerPage.tsx` — página principal, compõe os outros
- `ProgressRing.tsx` (em `components/ui/`) — SVG circular animado
- `PresetSelector.tsx` — 3 botões grandes lado a lado
- `TimerContext.tsx` — estado: `{ duration, remaining, isRunning, sessionsCompleted }`

### Estado persistido
```ts
{
  duration: number;        // duração escolhida em segundos
  remaining: number;       // tempo restante
  isRunning: boolean;
  sessionsCompleted: number; // total de sessões hoje
  lastSessionDate: string;   // para resetar contador diário
}
```

### Tom de voz
- Ao completar: "Incrível! Mais uma sessão no bolso. Você tá voando!"
- Ao pausar: "Tudo bem, respira. O timer te espera."
- Ao abrir pela manhã: "Bom dia! Pronto pra mais um dia no seu ritmo?"

### Detalhes técnicos
- O anel usa SVG `stroke-dasharray` + `stroke-dashoffset` animado via CSS transition
- Timer roda via `setInterval` com correção de drift (comparar timestamps, não contar ticks)
- Notificação via Notification API quando timer completa (pedir permissão no primeiro uso)
- Sons: áudio HTML5, arquivos curtos em `/public/sounds/` (pre-cacheados pelo SW)

---

## 2. Registro de Humor

**Caminho:** `src/features/mood/`

### O que faz
5 emojis representando estados de humor. 1 toque registra. Histórico visual dos últimos 7 dias.

### Interações (todas em 1 toque)
- Tocar em emoji: registra humor do momento
- Feedback imediato: emoji selecionado faz animação de pulse + mensagem

### Componentes
- `MoodPage.tsx` — página principal
- `MoodSelector.tsx` — 5 emojis em linha (muito feliz → muito mal)
- `MoodHistory.tsx` — últimos 7 dias em dots coloridos
- `MoodContext.tsx` — estado: array de registros

### Estado persistido
```ts
{
  entries: Array<{
    mood: 1 | 2 | 3 | 4 | 5;  // 1=ótimo, 5=difícil
    timestamp: string;          // ISO date
    note?: string;              // opcional, texto livre curto
  }>;
}
```

### Emojis e cores
| Valor | Emoji | Cor de fundo | Mensagem |
|---|---|---|---|
| 1 | Radiante | colibri-success | "Que bom que você tá bem!" |
| 2 | Contente | #86EFAC (verde claro) | "Dia tranquilo, que bom!" |
| 3 | Neutro | colibri-warn | "Tudo bem estar no meio-termo" |
| 4 | Cansado | #FB923C (laranja) | "Dia puxado, né? Tá tudo bem" |
| 5 | Difícil | #F87171 (vermelho suave) | "Tô aqui com você. Respira fundo" |

### Tom de voz
Nunca julgar. Nunca perguntar "por quê?". Apenas acolher o que o usuário sentir.

---

## 3. Lista de Tarefas

**Caminho:** `src/features/tasks/`

### O que faz
Lista simples de tarefas. Sem prioridades, sem categorias, sem datas. Apenas uma lista com checkboxes grandes.

### Interações (todas em 1 toque)
- Checkbox grande: completa tarefa (animação de confetti sutil)
- Campo de input: adicionar nova tarefa (Enter submete)
- Swipe ou botão X: deletar tarefa

### Componentes
- `TasksPage.tsx` — página principal
- `TaskItem.tsx` — item individual com checkbox animado
- `TaskInput.tsx` — campo para nova tarefa
- `TasksContext.tsx` — estado: array de tarefas

### Estado persistido
```ts
{
  tasks: Array<{
    id: string;
    text: string;
    completed: boolean;
    createdAt: string;
    completedAt?: string;
  }>;
}
```

### Design decisions para TDAH
- **Sem prioridades**: escolher prioridade é carga cognitiva. Tudo é igualmente válido.
- **Sem datas/deadlines**: datas geram ansiedade. Se quiser, faz; se não quiser, tá ali.
- **Celebração ao completar**: confetti leve ou animação de check, nunca silencioso.
- **Tarefas completas somem depois de 24h**: visual limpo, sem acúmulo.
- **Contador "Você completou X tarefas hoje"**: reforço positivo permanente.

### Tom de voz
- Ao completar: "Feito! Mais uma conquista!"
- Lista vazia: "Nada pendente — ou talvez você só não escreveu ainda. Tá tudo certo"
- Muitas tarefas: "Uma de cada vez, sem pressa. Qual parece mais leve pra começar?"

---

## 4. Chat IA

**Caminho:** `src/features/chat/`

### O que faz
Interface de chat com IA focada em suporte emocional e produtividade para TDAH. Carregamento lazy obrigatório (é a feature mais pesada).

### Carregamento
```tsx
const ChatPage = lazy(() => import('./features/chat/ChatPage'));
```
Enquanto carrega, mostra Skeleton específico com bolhas de chat simuladas.

### Componentes
- `ChatPage.tsx` — página principal
- `MessageBubble.tsx` — bolha de mensagem (user vs IA)
- `ChatInput.tsx` — campo de input com botão enviar
- `ChatSkeleton.tsx` — skeleton específico para chat

### Design
- Bolhas do usuário: `bg-colibri-primary text-white` (direita)
- Bolhas da IA: `bg-colibri-surface text-colibri-text` (esquerda)
- Input fixo no bottom, sempre visível
- Scroll automático para última mensagem
- A IA nunca usa linguagem técnica sobre TDAH como diagnóstico

### Tom de voz da IA
A IA do chat segue as mesmas regras de tom do Colibri:
- Nunca usa termos clínicos frios
- Sempre valida o que o usuário sente
- Sugere em vez de ordenar
- Frases curtas, parágrafos curtos

### Integração futura
A API do chat será definida depois. Por enquanto, criar a interface com mensagens mock para demonstrar o fluxo visual.

---

## 5. Perfil

**Caminho:** `src/features/profile/`

### O que faz
Tela simples com nome do usuário, preferências, e acesso a configurações básicas.

### Componentes
- `ProfilePage.tsx` — página principal
- `SettingsToggle.tsx` — toggle para notificações, sons, etc.

### Configurações disponíveis
- Nome (texto livre)
- Notificações do timer (on/off)
- Sons (on/off)
- Duração padrão do Pomodoro (15/25/45)

### Estado persistido
```ts
{
  name: string;
  notifications: boolean;
  sounds: boolean;
  defaultDuration: 15 | 25 | 45;
}
```
