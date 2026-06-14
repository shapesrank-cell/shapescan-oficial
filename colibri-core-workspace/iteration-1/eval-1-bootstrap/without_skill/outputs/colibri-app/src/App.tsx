import { useState } from 'react';
import BottomNav, { type TabId } from './components/BottomNav';
import TopBar from './components/TopBar';
import TimerPage from './pages/TimerPage';
import MoodPage from './pages/MoodPage';
import TasksPage from './pages/TasksPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';

const pages: Record<TabId, React.FC> = {
  timer: TimerPage,
  mood: MoodPage,
  tasks: TasksPage,
  chat: ChatPage,
  profile: ProfilePage,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('timer');

  const ActivePage = pages[activeTab];

  return (
    <div className="flex flex-col min-h-dvh bg-colibri-bg">
      <TopBar activeTab={activeTab} />

      <main
        className="flex-1 pb-20"
        role="main"
        aria-label={`Conteudo da aba ${activeTab}`}
      >
        <ActivePage />
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
