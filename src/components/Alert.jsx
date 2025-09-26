// src/components/Alert.jsx
import React from "react";
import PropTypes from "prop-types";

const VARIANTS = {
  info:    { bg: "#eef2ff", text: "#1e3a8a", border: "#c7d2fe" },
  success: { bg: "#ecfdf5", text: "#065f46", border: "#a7f3d0" },
  error:   { bg: "#fef2f2", text: "#7f1d1d", border: "#fecaca" },
  warn:    { bg: "#fffbeb", text: "#78350f", border: "#fde68a" },
};

export default function Alert({ type = "info", children, onClose, className = "" }) {
  const colors = VARIANTS[type] || VARIANTS.info;

  return (
    <div
      role="status"
      aria-live="polite"
      className={className}
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        padding: "10px 12px",
        borderRadius: 8,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
      }}
    >
      <div>{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Chiudi avviso"
          style={{
            border: "none",
            background: "transparent",
            fontSize: 16,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

Alert.propTypes = {
  type: PropTypes.oneOf(["info", "success", "error", "warn"]),
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
  className: PropTypes.string,
};
