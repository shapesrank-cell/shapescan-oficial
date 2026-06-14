interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Compose all context providers here as the app grows
  // For now, just a pass-through wrapper
  return <>{children}</>;
}
