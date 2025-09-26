const CF_REGEX = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;

export function normalizeCF(value) {
  return (value || "").trim().toUpperCase();
}

export function validateCF(value) {
  const v = normalizeCF(value);
  if (!v) return { ok: false, error: "Inserisci il Codice Fiscale." };
  if (v.length !== 16) return { ok: false, error: "Il CF deve avere 16 caratteri." };
  if (!CF_REGEX.test(v)) return { ok: false, error: "Formato CF non valido." };
  return { ok: true };
}
