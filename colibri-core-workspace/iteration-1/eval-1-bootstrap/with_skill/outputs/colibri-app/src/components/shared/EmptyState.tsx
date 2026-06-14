interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon = '🌿', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="text-5xl">{icon}</span>
      <p className="text-lg font-medium text-colibri-text">{title}</p>
      {description && (
        <p className="text-sm text-colibri-text-secondary max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 px-6 py-3 min-h-touch rounded-2xl bg-colibri-primary text-white font-medium transition-colors hover:bg-colibri-primary-light"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
