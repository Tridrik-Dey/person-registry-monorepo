// src/api/personMapper.js

// Convert BE → UI (normalize to your current Italian UI shape)
export function fromApi(d = {}) {
  const a = d.address || {};
  return {
    // prefer Italian keys, fall back to common English/snake variants
    codiceFiscale: d.codiceFiscale ?? d.taxCode ?? d.tax_code ?? "",
    nome:          d.nome          ?? d.name    ?? "",
    cognome:       d.cognome       ?? d.surname ?? "",
    address: {
      via:          a.via          ?? a.street       ?? "",
      // <-- include BE 'number' as primary fallback
      numeroCivico: a.numeroCivico ?? a.number ?? a.streetNumber ?? "",
      citta:        a.citta        ?? a.city         ?? "",
      provincia:    a.provincia    ?? a.province     ?? "",
      nazione:      a.nazione      ?? a.country      ?? "",
    },
  };
}

// Convert UI → BE
export function toApi(ui = {}) {
  const style = (process.env.REACT_APP_API_DTO || "it").toLowerCase();
  const a = ui.address || {};

  const numeroCivico =
    a.numeroCivico === "" || a.numeroCivico == null
      ? undefined
      : Number.parseInt(a.numeroCivico, 10);

  if (style === "en") {
    // Your BE expects 'number' (not streetNumber)
    return {
      taxCode: ui.codiceFiscale,
      name: ui.nome,
      surname: ui.cognome,
      address: {
        street: a.via || null,
        number: Number.isFinite(numeroCivico) ? numeroCivico : undefined,
        city: a.citta || null,
        province: a.provincia || null,
        country: a.nazione || null,
      },
    };
  }

  // default: Italian keys
  return {
    codiceFiscale: ui.codiceFiscale,
    nome: ui.nome,
    cognome: ui.cognome,
    address: {
      via: a.via || null,
      numeroCivico: Number.isFinite(numeroCivico) ? numeroCivico : undefined,
      citta: a.citta || null,
      provincia: a.provincia || null,
      nazione: a.nazione || null,
    },
  };
}
