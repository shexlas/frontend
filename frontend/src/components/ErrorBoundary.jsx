import { Component } from 'react';

// Catches render-time errors anywhere below it in the tree. Without this,
// an unhandled exception in a page component unmounts the whole React tree
// and leaves the user staring at a blank white screen with no way back.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error, info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <p className="text-6xl font-black gradient-text mb-3">500</p>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 mb-6 max-w-md">
            An unexpected error occurred while rendering this page. Try reloading — if it keeps
            happening, please let us know.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.assign('/');
            }}
            className="gradient-bg px-6 py-2.5 rounded-full font-semibold"
          >
            Back to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
