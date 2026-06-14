import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import {
  FocoSkeleton,
  TarefasSkeleton,
  TimerSkeleton,
  ChatSkeleton,
  ConfiguracoesSkeleton,
  RotinaSkeleton,
} from '@/components/shell/Skeleton'

// Cada tela é um chunk separado — carregado só quando o usuário navegar até ela
const HomePage          = lazy(() => import('@/features/home'))
const TarefasPage       = lazy(() => import('@/features/tarefas'))
const TimerPage         = lazy(() => import('@/features/timer'))
const ChatPage          = lazy(() => import('@/features/chat'))
const ConfiguracoesPage = lazy(() => import('@/features/configuracoes'))
const RotinaPage        = lazy(() => import('@/features/rotina'))

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<FocoSkeleton />}>
            <HomePage />
          </Suspense>
        }
      />
      <Route
        path="/tarefas"
        element={
          <Suspense fallback={<TarefasSkeleton />}>
            <TarefasPage />
          </Suspense>
        }
      />
      <Route
        path="/timer"
        element={
          <Suspense fallback={<TimerSkeleton />}>
            <TimerPage />
          </Suspense>
        }
      />
      <Route
        path="/chat"
        element={
          <Suspense fallback={<ChatSkeleton />}>
            <ChatPage />
          </Suspense>
        }
      />
      <Route
        path="/configuracoes"
        element={
          <Suspense fallback={<ConfiguracoesSkeleton />}>
            <ConfiguracoesPage />
          </Suspense>
        }
      />
      <Route
        path="/rotina"
        element={
          <Suspense fallback={<RotinaSkeleton />}>
            <RotinaPage />
          </Suspense>
        }
      />
    </Routes>
  )
}
