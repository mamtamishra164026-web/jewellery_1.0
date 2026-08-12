import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF5FF] px-4 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 border border-purple-200 shadow-sm">
            <span className="text-2xl text-purple-900 font-bold">!</span>
          </div>
          <h1 className="text-xl font-bold text-purple-950 mb-2 font-serif">Something went wrong</h1>
          <p className="text-purple-700 text-xs max-w-md mb-4">
            An unexpected error occurred while loading this view.
          </p>
          {this.state.error && (
            <pre className="text-[11px] bg-white border border-purple-200 text-rose-600 p-3 rounded-xl max-w-lg overflow-x-auto mb-6 text-left shadow-xs">
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={() => {
              localStorage.removeItem('guest_cart');
              this.setState({ hasError: false, error: null });
              window.location.href = '/';
            }}
            className="px-6 py-2.5 bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            Reload Storefront
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
