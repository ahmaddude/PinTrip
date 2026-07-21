import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-[#F2ECE0]">
          <div className="text-center px-6">
            <p
              className="text-3xl text-[#202A22] mb-3"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Something went wrong
            </p>
            <p className="text-sm text-[#6B6558] mb-6">
              An unexpected error occurred. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#202A22] text-[#F2ECE0] rounded-md text-sm font-medium hover:bg-[#35503F] transition"
            >
              Refresh page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
