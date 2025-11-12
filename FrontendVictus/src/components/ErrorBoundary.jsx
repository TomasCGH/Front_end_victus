import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h2 style={{ color: "red" }}>⚠️ Ocurrió un error inesperado.</h2>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
