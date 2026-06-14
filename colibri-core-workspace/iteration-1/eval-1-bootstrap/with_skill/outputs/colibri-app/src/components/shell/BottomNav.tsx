import { useLocation, useNavigate } from 'react-router-dom';

interface NavItemDef {
  path: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItemDef[] = [
  { path: '/', label: 'Timer', icon: '⏱' },
  { path: '/mood', label: 'Humor', icon: '😊' },
  { path: '/tasks', label: 'Tarefas', icon: '✓' },
  { path: '/chat', label: 'Chat', icon: '💬' },
  { path: '/profile', label: 'Perfil', icon: '👤' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-around bg-colibri-surface border-t border-colibri-subtle/50 px-2 pb-safe">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`
              flex flex-col items-center justify-center gap-1
              min-h-touch min-w-touch py-2 px-3
              rounded-xl transition-colors duration-150
              ${isActive
                ? 'text-colibri-primary'
                : 'text-colibri-text-muted hover:text-colibri-text-secondary'
              }
            `}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className={`text-xs font-medium ${isActive ? 'text-colibri-primary' : ''}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
