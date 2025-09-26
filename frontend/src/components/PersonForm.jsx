import React from "react";
import PropTypes from "prop-types";

export default function PersonForm({
  form, onChange, onNew, onCreate, onUpdate, onAskDelete,
  loading = false, cfDisabled = false
}) {
  // Send "path" + "value" to PersonsPage.update()
  const set = (k, v) => onChange(k, v);
  const setAddr = (k, v) => onChange(`address.${k}`, v);

  PersonForm.propTypes = {
  form: PropTypes.shape({
    codiceFiscale: PropTypes.string,
    nome: PropTypes.string,
    cognome: PropTypes.string,
    address: PropTypes.shape({
      via: PropTypes.string,
      numeroCivico: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      citta: PropTypes.string,
      provincia: PropTypes.string,
      nazione: PropTypes.string,
    }),
  }).isRequired,

  onChange: PropTypes.func.isRequired,
  onNew: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onAskDelete: PropTypes.func.isRequired,

  loading: PropTypes.bool,
  cfDisabled: PropTypes.bool,
};

PersonForm.defaultProps = {
  loading: false,
  cfDisabled: false,
};

  return (
    <section className="card">
      <div className="card-title">Dati Persona</div>

      <div className="toolbar">
        <button className="btn" onClick={onNew} disabled={loading}>Nuovo</button>
        <button className="btn primary" onClick={onCreate} disabled={loading}>Crea</button>
        <button className="btn warn" onClick={onUpdate} disabled={loading}>Aggiorna</button>
        <button className="btn danger" onClick={onAskDelete} disabled={loading}>Cancella</button>
      </div>

      <div className="grid two">
        <div className="field">
          <label>Codice Fiscale</label>
          <input
            value={form.codiceFiscale || ""}
            placeholder="RSSMRA80A01H501U"
            onChange={e => set("codiceFiscale", e.target.value.toUpperCase())}
            disabled={cfDisabled || loading}
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label>Nome</label>
          <input value={form.nome || ""} onChange={e => set("nome", e.target.value)} />
        </div>
        <div className="field">
          <label>Cognome</label>
          <input value={form.cognome || ""} onChange={e => set("cognome", e.target.value)} />
        </div>
        <div className="field">
          <label>Via</label>
          <input value={form.address?.via || ""} onChange={e => setAddr("via", e.target.value)} />
        </div>
        <div className="field">
          <label>Numero Civico</label>
          <input
            value={form.address?.numeroCivico ?? ""}
            onChange={e => setAddr("numeroCivico", e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
          />
        </div>
        <div className="field">
          <label>Città</label>
          <input value={form.address?.citta || ""} onChange={e => setAddr("citta", e.target.value)} />
        </div>
        <div className="field">
          <label>Provincia</label>
          <input value={form.address?.provincia || ""} onChange={e => setAddr("provincia", e.target.value)} />
        </div>
        <div className="field">
          <label>Nazione</label>
          <input value={form.address?.nazione || ""} onChange={e => setAddr("nazione", e.target.value)} />
        </div>
      </div>

      <p className="hint">
        Suggerimento: per aggiornare, cerca prima una persona oppure compila tutti i campi (il CF non può essere modificato).
      </p>
    </section>
  );
}
