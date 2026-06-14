import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppProvider } from '@/context/AppContext'
import { AppShell } from '@/components/shell/AppShell'
import { AppRoutes } from '@/routes'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
