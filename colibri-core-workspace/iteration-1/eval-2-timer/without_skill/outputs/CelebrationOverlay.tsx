import React from 'react';

interface CelebrationOverlayProps {
  message: string;
  onNewSession: () => void;
  onBack: () => void;
}

export function CelebrationOverlay({ message, onNewSession, onBack }: CelebrationOverlayProps) {
  return (
    <div className="flex flex-col items-center gap-8 animate-fade-in">
      {/* Confetti-like decorative dots */}
      <div className="relative">
        <div className="absolute -top-4 -left-6 w-3 h-3 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="absolute -top-2 left-8 w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '200ms' }} />
        <div className="absolute top-0 -right-4 w-2.5 h-2.5 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: '400ms' }} />
        <div className="absolute top-6 -left-3 w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '100ms' }} />
        <div className="absolute top-4 right-2 w-3 h-3 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />

        <span className="text-6xl block" role="img" aria-label="celebracao">
          🎉
        </span>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">
          {message}
        </h2>
        <p className="text-white/50 text-sm">
          Cada minuto de foco conta. Continue assim!
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onNewSession}
          className="w-full py-4 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 active:scale-[0.97] transition-all duration-150 text-white font-semibold text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          Mais uma rodada
        </button>
        <button
          onClick={onBack}
          className="w-full py-3 px-6 rounded-2xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] active:scale-[0.97] transition-all duration-150 text-white/60 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
        >
          Trocar tempo
        </button>
      </div>
    </div>
  );
}
