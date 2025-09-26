// src/api/personSchema.js
import { z } from "zod";

// Friendly error aggregator
export function zodToMessage(err, fallback = "Dati non validi.") {
  try {
    const lines = err.issues?.map(i => {
      const path = i.path?.length ? `(${i.path.join(".")})` : "";
      return `• ${i.message} ${path}`.trim();
    }) || [];
    return lines.length ? lines.join("\n") : fallback;
  } catch { return fallback; }
}

// UI → SAVE schema (strict for create/update)
export const PersonSaveSchema = z.object({
  codiceFiscale: z.string().min(1, "Inserisci il Codice Fiscale."),
  nome:          z.string().min(1, "Inserisci il Nome."),
  cognome:       z.string().min(1, "Inserisci il Cognome."),
  address: z.object({
    via:          z.string().min(1, "Inserisci la Via."),
    numeroCivico: z.union([z.string(), z.number()])
      .transform(v => typeof v === "string" ? v.trim() : v)
      .refine(v => {
        const n = typeof v === "number" ? v : Number.parseInt(v, 10);
        return Number.isInteger(n) && n >= 1;
      }, "Numero Civico non valido (deve essere un intero ≥ 1)."),
    citta:        z.string().min(1, "Inserisci la Città."),
    provincia:    z.string().min(1, "Inserisci la Provincia."),
    nazione:      z.string().min(1, "Inserisci la Nazione.")
  })
});

// Search row (EN keys) coming from /person/search
export const SearchRowSchema = z.object({
  taxCode:  z.string(),
  name:     z.string(),
  surname:  z.string(),
  address:  z.string().optional().nullable(),
  province: z.string().optional().nullable(),
});
