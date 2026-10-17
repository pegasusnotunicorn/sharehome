import { Component, type ErrorInfo, type ReactNode } from "react";
import PageIntro from "./PageIntro";
import DefaultButton from "./DefaultButton";
import errorStyles from "../../css/pages/errorPage.module.css";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode; // (the site's "something went wrong" page if not given)
  resetKey?: unknown; // a change (a new page) tries again
}

// What's shown in place of a part of the site that crashed (or whose code couldn't be loaded, e.g. an
// old tab after a new version went up), rather than a blank page
class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  componentDidUpdate(before: ErrorBoundaryProps) {
    if (this.state.failed && before.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      this.props.fallback ?? (
        <div className={`content max-width ${errorStyles.errorPage}`}>
          <PageIntro eyebrow="Oops" title="Something went wrong" lead="Sorry, this page didn’t load properly. Reloading usually fixes it.">
            <DefaultButton onClick={() => window.location.reload()} variant="secondary" border="dark" icon="again" text="Reload" />
          </PageIntro>
        </div>
      )
    );
  }
}

export default ErrorBoundary;
