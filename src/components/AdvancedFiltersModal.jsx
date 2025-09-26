// src/components/AdvancedFiltersModal.jsx
import React, { useEffect, useRef, useState } from "react";
import { searchPersons } from "../api/personService";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import useDebounce from "../hooks/useDebounce";
import PropTypes from "prop-types";

function formatAddress(addr = {}) {
  // Accept both Italian and English DTO keys
  const street = addr.via ?? addr.street ?? "";
  const num = addr.numeroCivico ?? addr.number ?? "";
  const city = addr.citta ?? addr.city ?? "";
  const prov = addr.provincia ?? addr.province ?? "";

  const line1 = [street, num].filter(Boolean).join(" ").trim();
  const line2 = [city, prov].filter(Boolean).join(" ").trim();

  const parts = [];
  if (line1) parts.push(line1);
  if (line2) parts.push(line2);

  return parts.join(", ") || "—";
}

export default function AdvancedFiltersModal({
  id = "advanced-filters-modal",
  isOpen,
  onClose,
  onSelectPerson,
}) {
  const { t } = useTranslation();

  const [surname, setSurname] = useState("");
  const [province, setProvince] = useState("");

  const dialogRef = useRef(null);
  const surnameInputRef = useRef(null);

  // Focus on open + lock background scroll
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => surnameInputRef.current?.focus(), 0);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close
  const onOverlayClick = (e) => {
    if (e.target.getAttribute("data-overlay") === "1") onClose?.();
  };

  // Province: keep only letters, force uppercase, max 2
  const handleProvinceChange = (e) => {
    const v = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 2);
    setProvince(v);
  };

  // Debounce inputs to cut chatter
  const debouncedSurname = useDebounce(surname.trim(), 350);
  const debouncedProvince = useDebounce(province.trim().toUpperCase(), 350);

  const sOk = debouncedSurname.length >= 2;
  const pOk = debouncedProvince.length === 2;

  // Cached, cancel-safe query
  const { data, isFetching, error } = useQuery({
    queryKey: [
      "person-search",
      {
        // IMPORTANT: your BE expects "lastName"
        lastName: sOk ? debouncedSurname : undefined,
        province: pOk ? debouncedProvince : undefined,
        size: 20,
      },
    ],
    queryFn: ({ signal, queryKey }) => {
      const [, params] = queryKey;
      return searchPersons(params, signal);
    },
    enabled: isOpen && (sOk || pOk),
  });

  // ---- Minimal normalization so we can render safely -----------------------
  const rawRows = Array.isArray(data) ? data : [];
  const rows = rawRows.map((p) => {
    const addr = p.address ?? {};
    return {
      taxCode: p.taxCode ?? p.codiceFiscale ?? "",
      name: p.name ?? p.nome ?? "",
      surname: p.surname ?? p.cognome ?? "",
      address: addr, // keep object; we format it when rendering
      province:
        p.province ??
        addr.province ??
        addr.provincia ??
        (typeof p.provincia === "string" ? p.provincia : "") ??
        "",
    };
  });

  const errText = error?.friendlyMessage || null;

  const handleSelect = (row) => {
    if (!row) return;
    onSelectPerson?.(row);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div
      data-overlay="1"
      onClick={onOverlayClick}
      className="modal-overlay"
      aria-hidden="false"
    >
      <div
        ref={dialogRef}
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
      >
        <div className="modal-header">
          <h2 id={`${id}-title`}>{t("filters.title", "Filtri avanzati")}</h2>
          <button
            type="button"
            className="modal-close"
            aria-label={t("buttons.close", "Chiudi")}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div id={`${id}-desc`} className="modal-body">
          <div className="filters-grid">
            <label className="field">
              <span>{t("filters.surname.label", "Cognome (anche parziale)")}</span>
              <input
                ref={surnameInputRef}
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder={t("filters.surname.placeholder", "Ros")}
                autoComplete="off"
              />
              <small>{t("filters.surname.help", "Minimo 2 caratteri")}</small>
            </label>

            <label className="field">
              <span>{t("filters.province.label", "Provincia")}</span>
              <input
                value={province}
                onChange={handleProvinceChange}
                placeholder={t("filters.province.placeholder", "MI")}
                maxLength={2}
                autoComplete="off"
                style={{ textTransform: "uppercase" }}
              />
              <small>{t("filters.province.help", "2 lettere (es. MI)")}</small>
            </label>
          </div>

          <div className="results" aria-busy={isFetching}>
            {isFetching && (
              <div className="hint" aria-live="polite">
                {t("status.searching", "Ricerca…")}
              </div>
            )}
            {errText && (
              <div className="error">
                {errText || t("errors.networkRetry", "Errore di rete. Riprova.")}
              </div>
            )}

            {!isFetching && !errText && (
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("table.headers.taxCode", "Codice Fiscale")}</th>
                    <th>{t("table.headers.name", "Nome")}</th>
                    <th>{t("table.headers.surname", "Cognome")}</th>
                    <th>{t("table.headers.address", "Indirizzo")}</th>
                    <th>{t("table.headers.province", "Provincia")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="muted">
                        {t(
                          "table.empty",
                          "Nessun risultato. Digita almeno 2 lettere nel cognome o 2 nella provincia."
                        )}
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr
                        key={r.taxCode}
                        className="row-click"
                        onClick={() => handleSelect(r)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSelect(r);
                        }}
                        title="Seleziona"
                      >
                        <td>{r.taxCode || "—"}</td>
                        <td>{r.name || "—"}</td>
                        <td>{r.surname || "—"}</td>
                        {/* IMPORTANT: render address as a STRING, not an object */}
                        <td>{formatAddress(r.address)}</td>
                        <td>{(r.province || "").toString().toUpperCase() || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose}>
            {t("buttons.close", "Chiudi")}
          </button>
        </div>
      </div>
    </div>
  );
}

AdvancedFiltersModal.propTypes = {
  id: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectPerson: PropTypes.func.isRequired,
};

AdvancedFiltersModal.defaultProps = {
  id: "advanced-filters-modal",
};
