import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <span className="text-4xl">🌸</span>
          <p className="text-lg font-medium text-colibri-text">
            Ops, algo saiu diferente.
          </p>
          <p className="text-sm text-colibri-text-secondary">
            Vamos tentar de novo?
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-6 py-3 min-h-touch rounded-2xl bg-colibri-primary text-white font-medium transition-colors hover:bg-colibri-primary-light"
          >
            Tentar de novo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
