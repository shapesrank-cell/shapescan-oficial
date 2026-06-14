interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-colibri-surface rounded-2xl p-5 border border-colibri-subtle/30 ${className}`}>
      {children}
    </div>
  );
}
