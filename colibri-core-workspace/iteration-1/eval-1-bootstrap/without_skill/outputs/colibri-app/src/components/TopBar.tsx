import type { TabId } from './BottomNav';

const tabTitles: Record<TabId, string> = {
  timer: 'Timer',
  mood: 'Humor',
  tasks: 'Tarefas',
  chat: 'Chat',
  profile: 'Perfil',
};

interface TopBarProps {
  activeTab: TabId;
}

export default function TopBar({ activeTab }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-colibri-border bg-colibri-surface/95 backdrop-blur-md">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-hidden="true">
            🐦
          </span>
          <span className="text-sm font-semibold text-colibri-primary tracking-wide uppercase">
            Colibri
          </span>
        </div>
        <h1 className="text-base font-semibold text-colibri-text">
          {tabTitles[activeTab]}
        </h1>
        <div className="w-12" aria-hidden="true" />
      </div>
    </header>
  );
}
