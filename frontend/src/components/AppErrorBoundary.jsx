// src/components/AppErrorBoundary.jsx
import React from "react";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { logError } from "../utils/logError";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorId: null, error: null };
  }

  static getDerivedStateFromError(err) {
    const suffix = Math.random().toString(36).slice(2, 7);
    return { hasError: true, errorId: `${Date.now()}-${suffix}`, error: err };
  }

  componentDidCatch(error, info) {
    logError(error, { scope: "ErrorBoundary", info });
  }

  handleRefresh = () => {
    // small UX: reset to let user try again without full reload
    this.setState({ hasError: false, errorId: null, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    const { hasError, errorId, error } = this.state;
    const { children, t } = this.props;

    if (!hasError) return children;

    const isDev = process.env.NODE_ENV !== "production";

    return (
      <div style={{
        maxWidth: 760, margin: "40px auto", padding: 20,
        background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)", color: "#1f2937"
      }}>
        <h2 style={{ margin: "0 0 8px" }}>
          {t("errors.fatal.title", "Si è verificato un errore imprevisto")}
        </h2>
        <p style={{ margin: "0 0 12px", color: "#6b7280" }}>
          {t("errors.fatal.subtitle", "Riprova l’operazione oppure aggiorna la pagina.")}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button
            onClick={this.handleRefresh}
            className="btn"
            style={{ padding: "10px 14px", borderRadius: 10 }}
          >
            {t("errors.fatal.ctaRetry", "Riprova")}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn warn"
            style={{ padding: "10px 14px", borderRadius: 10 }}
          >
            {t("errors.fatal.ctaRefresh", "Aggiorna pagina")}
          </button>
        </div>

        <small style={{ display: "block", color: "#6b7280" }}>
          {t("errors.fatal.errorId", "ID errore")}: <code>{errorId}</code>
        </small>

        {isDev && error && (
          <details style={{ marginTop: 12, whiteSpace: "pre-wrap" }} open>
            <summary style={{ cursor: "pointer" }}>
              {t("errors.fatal.details", "Dettagli (solo sviluppo)")}
            </summary>
            {error.stack || String(error)}
          </details>
        )}
      </div>
    );
  }
}

AppErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onReset: PropTypes.func,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(AppErrorBoundary);
