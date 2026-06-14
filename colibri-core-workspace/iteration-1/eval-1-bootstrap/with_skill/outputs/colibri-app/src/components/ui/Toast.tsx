import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warn';
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, type = 'info', visible, onDismiss, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [visible, onDismiss, duration]);

  if (!visible) return null;

  const colors = {
    success: 'bg-colibri-success/20 text-colibri-success border-colibri-success/30',
    info: 'bg-colibri-primary/20 text-colibri-primary-light border-colibri-primary/30',
    warn: 'bg-colibri-warn/20 text-colibri-warn border-colibri-warn/30',
  };

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl border text-sm font-medium ${colors[type]}`}>
      {message}
    </div>
  );
}
