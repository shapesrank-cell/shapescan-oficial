import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppProvider';
import { AppShell } from './components/shell/AppShell';
import { Skeleton } from './components/shell/Skeleton';
import { ErrorBoundary } from './components/shared/ErrorBoundary';

const TimerPage = lazy(() => import('./features/timer/TimerPage'));
const MoodPage = lazy(() => import('./features/mood/MoodPage'));
const TasksPage = lazy(() => import('./features/tasks/TasksPage'));
const ChatPage = lazy(() => import('./features/chat/ChatPage'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'));

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ErrorBoundary>
          <AppShell>
            <Suspense fallback={<Skeleton />}>
              <Routes>
                <Route path="/" element={<TimerPage />} />
                <Route path="/mood" element={<MoodPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Routes>
            </Suspense>
          </AppShell>
        </ErrorBoundary>
      </AppProvider>
    </BrowserRouter>
  );
}
