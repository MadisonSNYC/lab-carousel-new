import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env?.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-black text-white">
          <div className="text-center">
            <h2 className="text-xl mb-2">Something went wrong</h2>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded hover:bg-cyan-500/30"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;