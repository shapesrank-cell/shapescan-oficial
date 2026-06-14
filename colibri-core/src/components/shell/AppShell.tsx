import type { ReactNode } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col h-dvh">
      <Header />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <BottomNav />
    </div>
  )
}
