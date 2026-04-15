import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || '' };
  }

  componentDidCatch(error, info) {
    // Log for debugging without crashing
    try {
      console.error('[ErrorBoundary]', error, info?.componentStack);
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background">
          <div className="text-6xl mb-4">😵</div>
          <h2 className="font-display text-2xl font-bold mb-2">¡Algo salió mal!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Ocurrió un error inesperado. Por favor, intenta de nuevo.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, errorMessage: '' });
              try { window.location.href = '/'; } catch {}
            }}
            className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-display font-bold shadow-lg active:scale-95 transition-transform"
          >
            Volver al inicio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}