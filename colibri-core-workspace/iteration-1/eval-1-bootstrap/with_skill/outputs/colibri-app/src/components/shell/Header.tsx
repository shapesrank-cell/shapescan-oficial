import { useOfflineStatus } from '../../hooks/useOfflineStatus';

export function Header() {
  const isOffline = useOfflineStatus();

  return (
    <header className="flex items-center justify-between px-5 py-4 bg-colibri-bg border-b border-colibri-subtle/50">
      <h1 className="text-lg font-semibold tracking-tight text-colibri-text">
        Colibri
      </h1>
      {isOffline && (
        <span className="text-xs font-medium text-colibri-warn bg-colibri-warn/10 px-2 py-1 rounded-full">
          Offline
        </span>
      )}
    </header>
  );
}
