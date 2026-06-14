import { Timer, Smile, CheckSquare, MessageCircle, User } from 'lucide-react';

export type TabId = 'timer' | 'mood' | 'tasks' | 'chat' | 'profile';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'timer', label: 'Timer', icon: Timer },
  { id: 'mood', label: 'Humor', icon: Smile },
  { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'profile', label: 'Perfil', icon: User },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      role="navigation"
      aria-label="Navegacao principal"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-colibri-border bg-colibri-surface/95 backdrop-blur-md safe-bottom"
    >
      <ul className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <li key={item.id} className="flex-1">
              <button
                onClick={() => onTabChange(item.id)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
                className={`
                  flex flex-col items-center justify-center w-full h-14 gap-0.5
                  rounded-xl transition-colors duration-150
                  focus-visible:outline-2 focus-visible:outline-colibri-primary focus-visible:outline-offset-2
                  ${
                    isActive
                      ? 'text-colibri-primary'
                      : 'text-colibri-text-dim hover:text-colibri-text-muted'
                  }
                `}
              >
                <Icon
                  size={22}
                  className={
                    isActive
                      ? 'text-colibri-primary'
                      : 'text-colibri-text-dim'
                  }
                />
                <span className="text-[11px] font-medium leading-tight">
                  {item.label}
                </span>
                {isActive && (
                  <span className="sr-only">(aba atual)</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
