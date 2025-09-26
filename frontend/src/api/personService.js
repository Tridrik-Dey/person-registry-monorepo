// src/api/personService.js
import http from "./http";
import { fromApi, toApi } from "./personMapper";

/**
 * Normalize list responses coming from the API.
 * Supports both plain arrays and Spring-style Page<{ content: [] }>.
 */
function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}

/**
 * Try GET with fallback: first hit /persons/search, then /persons if 404/405/Not implemented.
 */
async function getWithSearchFallback(params, signal) {
  try {
    return await http.get("/persons/search", { params, signal });
  } catch (e) {
    const status = e?.response?.status;
    // fall back when the dedicated search endpoint doesn't exist/allowed
    if (status === 404 || status === 405 || status === 501) {
      return await http.get("/persons", { params, signal });
    }
    throw e;
  }
}

/**
 * Live search for people.
 * - Accepts either `surnameLike` or `lastName` (or other common aliases)
 * - Sends multiple param aliases so different BE implementations still filter
 * - Falls back between /persons/search and /persons
 * - Applies client-side filtering as a safety net
 *
 * @param {Object} [opts]
 * @param {string} [opts.surnameLike]  partial surname (>= 2 chars)
 * @param {string} [opts.lastName]     partial surname (>= 2 chars)
 * @param {string} [opts.province]     2-letter province code
 * @param {number} [opts.size=20]      max rows
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array>}           array of Person rows (raw list DTO shape)
 */
export async function searchPersons(opts = {}, signal) {
  const {
    surnameLike: inSurnameLike,
    lastName: inLastName,
    province: inProvince,
    size = 20,
  } = opts || {};

  const surnameLike = (inSurnameLike ?? inLastName ?? "").toString().trim();
  const province = (inProvince ?? "").toString().trim().toUpperCase();

  // Build a broad params set; BE will ignore unknown keys
  const q = {};
  if (surnameLike.length >= 2) {
    q.lastName = surnameLike;      // common EN
    q.surnameLike = surnameLike;   // another EN variant
    q.surname = surnameLike;       // plain fallback
    q.cognome = surnameLike;       // IT
    q.cognomeLike = surnameLike;   // IT like
  }
  if (province.length === 2) {
    q.province = province;         // EN
    q.provincia = province;        // IT
  }
  if (Number.isFinite(size)) q.size = size;

  // Request with endpoint fallback
  const { data } = await getWithSearchFallback(q, signal);
  const list = normalizeList(data);

  // -------- Client-side safety net (if BE ignored filters) --------
  const sNeed = surnameLike.length >= 2 ? surnameLike.toLowerCase() : null;
  const pNeed = province.length === 2 ? province : null;

  const filtered = list.filter((row) => {
    let ok = true;

    if (sNeed) {
      const s =
        (row.surname ?? row.cognome ?? row.lastName ?? "").toString().toLowerCase();
      ok = ok && s.includes(sNeed);
    }

    if (pNeed) {
      const a = row.address || {};
      const prov =
        (row.province ??
          row.provincia ??
          a.province ??
          a.provincia ??
          "").toString().toUpperCase();
      ok = ok && prov === pNeed;
    }

    return ok;
  });

  return filtered;
}

/**
 * Get a person by Codice Fiscale.
 * Maps BE payload -> Italian UI shape.
 *
 * @param {string} cf
 * @param {AbortSignal} [signal]
 * @returns {Promise<Object>}       Italian UI shape
 */
export async function getPerson(cf, signal) {
  const id = String(cf || "").trim().toUpperCase();
  if (!id) {
    const err = new Error("Codice Fiscale mancante");
    err.friendlyMessage = "Inserisci il Codice Fiscale.";
    throw err;
  }
  const { data } = await http.get(`/persons/${encodeURIComponent(id)}`, { signal });
  return fromApi(data);
}

/**
 * Create a person.
 */
export async function createPerson(payload, signal) {
  const body = toApi(payload);
  const { data } = await http.post("/persons", body, { signal });
  return fromApi(data);
}

/**
 * Update a person by Codice Fiscale.
 */
export async function updatePerson(cf, payload, signal) {
  const id = String(cf || "").trim().toUpperCase();
  const body = toApi(payload);
  const { data } = await http.put(`/persons/${encodeURIComponent(id)}`, body, { signal });
  return fromApi(data);
}

/**
 * Delete a person by Codice Fiscale.
 */
export async function deletePerson(cf, signal) {
  const id = String(cf || "").trim().toUpperCase();
  const { data } = await http.delete(`/persons/${encodeURIComponent(id)}`, { signal });
  return data;
}

/* ------------------------------
 * Additional helpers (kept as-is)
 * ------------------------------ */

// READ by Codice Fiscale (CF)
export async function getById(cf, signal) {
  console.log("getById called with", cf, "baseURL:", http.defaults.baseURL);
  const { data } = await http.get(`/persons/${encodeURIComponent(cf)}`, { signal });
  return fromApi(data);
}

// SEARCH (advanced list, NOT CF) – generic passthrough if you need raw access
export async function search(params, signal) {
  const { data } = await http.get(`/persons`, { params, signal });
  return (data?.content ?? data ?? []).map(fromApi);
}

// CREATE / UPDATE / DELETE (raw helpers)
export async function create(person, signal) {
  return (await http.post(`/persons`, toApi(person), { signal })).data;
}

export async function update(cf, payload, signal) {
  return (await http.put(`/persons/${encodeURIComponent(cf)}`, toApi(payload), { signal })).data;
}

export async function remove(cf, signal) {
  await http.delete(`/persons/${encodeURIComponent(cf)}`, { signal });
}
