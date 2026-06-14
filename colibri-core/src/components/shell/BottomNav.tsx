import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/',        icon: 'home',              label: 'Home'    },
  { to: '/tarefas', icon: 'checklist',         label: 'Tarefas' },
  { to: '/timer',   icon: 'timer',             label: 'Timer'   },
  { to: '/chat',    icon: 'chat_bubble',       label: 'Chat'    },
]

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-50 flex justify-around items-center px-4 pb-8 pt-3 bg-surface-container-lowest/90 backdrop-blur-md soft-shadow rounded-t-lg border-t border-outline-variant/20">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-full transition-all duration-200 font-body text-label-md ${
              isActive
                ? 'bg-primary-container text-on-primary-container font-semibold'
                : 'text-secondary hover:bg-surface-container'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
