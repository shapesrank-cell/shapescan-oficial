/**
 * TimerPage — Página principal do Pomodoro Colibri.
 *
 * Composição:
 * - ProgressRing (anel SVG clicável)
 * - PresetSelector (15 / 25 / 45 min)
 * - Contador de sessões do dia
 * - Mensagem de celebração ao completar
 *
 * Fluxo (tudo em 1 toque):
 * 1. Usuário escolhe preset tocando num botão
 * 2. Toca no anel para iniciar
 * 3. Toca novamente para pausar
 * 4. Ao completar → vibração + celebração
 */

import { useEffect } from 'react';
import { TimerProvider } from './TimerContext';
import { useTimer } from './useTimer';
import { ProgressRing } from './ProgressRing';
import { PresetSelector } from './PresetSelector';

// ── Mensagens de celebração (rotativas) ──────────────────────

const CELEBRATION_MESSAGES = [
  'Incrível! Mais uma sessão no bolso. Você tá voando! ✨',
  'Mandou muito bem! Seu foco tá afiado hoje! 🎯',
  'Sessão completa! Você é demais! 🚀',
  'Arrasou! Cada sessão é uma vitória. 💪',
  'Pronto! Que tal uma pausa merecida? ☕',
];

function pickCelebration(sessionsCompleted: number): string {
  return CELEBRATION_MESSAGES[sessionsCompleted % CELEBRATION_MESSAGES.length];
}

// ── Mensagens de bom dia / saudação ──────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia! Pronto pra mais um dia no seu ritmo?';
  if (hour < 18) return 'Boa tarde! Que tal uma sessão de foco?';
  return 'Boa noite! Ainda dá tempo de uma sessão leve.';
}

// ── Solicitar permissão de notificação ───────────────────────

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

// ── Conteúdo interno (precisa do contexto) ───────────────────

function TimerContent() {
  const {
    progress,
    display,
    isRunning,
    sessionsCompleted,
    showCelebration,
    currentPreset,
    toggle,
    selectPreset,
    dismissCelebration,
  } = useTimer();

  // Pedir permissão de notificação no primeiro uso
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-8 gap-8">
      {/* Saudação */}
      <p className="text-colibri-text-secondary text-base text-center max-w-xs">
        {getGreeting()}
      </p>

      {/* Anel de progresso — 1 toque inicia/pausa */}
      <ProgressRing
        progress={progress}
        display={display}
        isRunning={isRunning}
        onTap={toggle}
        size={280}
      />

      {/* Presets — 1 toque muda duração */}
      <PresetSelector
        current={currentPreset}
        isRunning={isRunning}
        onSelect={selectPreset}
      />

      {/* Contador de sessões do dia */}
      {sessionsCompleted > 0 && (
        <p className="text-colibri-text-secondary text-sm text-center">
          Você completou{' '}
          <span className="text-colibri-success font-semibold">
            {sessionsCompleted} {sessionsCompleted === 1 ? 'sessão' : 'sessões'}
          </span>{' '}
          hoje. Tá mandando bem!
        </p>
      )}

      {/* ── Overlay de celebração ────────────────────────────── */}
      {showCelebration && (
        <div
          className="
            fixed inset-0 z-50
            flex flex-col items-center justify-center
            bg-colibri-bg/90 backdrop-blur-sm
            px-6
          "
        >
          <div className="flex flex-col items-center gap-6 max-w-sm text-center animate-fade-in">
            {/* Emoji grande */}
            <span className="text-7xl" role="img" aria-label="Celebração">
              🎉
            </span>

            {/* Mensagem positiva */}
            <h2 className="text-2xl font-semibold text-colibri-text leading-snug">
              {pickCelebration(sessionsCompleted)}
            </h2>

            {/* Sub-texto gentil */}
            <p className="text-colibri-text-secondary text-base">
              Quando quiser, comece outra sessão. Sem pressa.
            </p>

            {/* Botão grande para dispensar */}
            <button
              type="button"
              onClick={dismissCelebration}
              className="
                min-h-touch w-full max-w-xs
                bg-colibri-primary text-white
                rounded-2xl font-semibold text-lg
                transition-all active:scale-95
                shadow-lg shadow-colibri-primary/25
                cursor-pointer
              "
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Export default (para lazy loading) ────────────────────────

export default function TimerPage() {
  return (
    <TimerProvider>
      <TimerContent />
    </TimerProvider>
  );
}
