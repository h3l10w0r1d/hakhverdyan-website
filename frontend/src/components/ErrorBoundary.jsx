import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-loader" style={{ flexDirection: "column", gap: 14 }}>
          <p style={{ color: "var(--grey-600)", fontSize: 14 }}>Something went wrong loading this page.</p>
          <button className="btn-secondary" onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
