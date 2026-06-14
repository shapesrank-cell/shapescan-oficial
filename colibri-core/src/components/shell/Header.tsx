import { useNavigate } from 'react-router-dom'
import { useSettings } from '@/context/AppContext'

export function Header() {
  const navigate = useNavigate()
  const { settings } = useSettings()

  // Pega a inicial do nome, ou 'C' como fallback do Colibri
  const inicial = settings.nome.trim().charAt(0).toUpperCase() || 'C'

  return (
    <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-md border-b border-outline-variant/30">
      <div className="flex items-center justify-between max-w-[800px] mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-gap-sm">
        <div className="flex items-center gap-3">
          <span className="font-headline text-headline-lg-mobile font-semibold text-primary tracking-tight">
            Colibri
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/configuracoes')}
            aria-label="Configurações"
            className="text-on-surface-variant hover:opacity-70 active:scale-95 transition-all duration-150"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button
            onClick={() => navigate('/configuracoes')}
            aria-label="Perfil"
            className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-on-surface font-semibold text-label-md select-none hover:opacity-80 active:scale-95 transition-all duration-150"
          >
            {inicial}
          </button>
        </div>
      </div>
    </header>
  )
}
