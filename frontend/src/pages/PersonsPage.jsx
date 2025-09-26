// src/pages/PersonsPage.jsx
import React, { useCallback, useState } from "react";
import { getById, createPerson, updatePerson, deletePerson } from "../api/personService";
import { fromApi } from "../api/personMapper";
import { validateCF } from "../utils/cf";
import PersonForm from "../components/PersonForm";
import AdvancedFiltersModal from "../components/AdvancedFiltersModal";
import Alert from "../components/Alert";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// --- Local query-key helpers (functions) ------------------------------------
const qkPersonByCf = (cf) => ["personByCf", cf];
const qkPersonSearch = () => ["personSearch"];

export default function PersonsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // --- State -----------------------------------------------------------------
  const empty = {
    codiceFiscale: "",
    nome: "",
    cognome: "",
    address: { via: "", numeroCivico: "", citta: "", provincia: "", nazione: "" },
  };

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [cfDisabled, setCfDisabled] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [cfMsg, setCfMsg] = useState(null); // inline message under CF input

  // --- Inline message helpers (replace global banner) ------------------------
  const clearBanner = () => setCfMsg(null);
  const showSuccess = (text) => setCfMsg({ type: "success", text });
  const showError = (text) => setCfMsg({ type: "error", text });

  // --- Friendly error helper -------------------------------------------------
  const errText = (e, fallback) => e?.friendlyMessage || fallback;

  // --- Derived validity for CF length ---------------------------------------
  const cfLen = (form.codiceFiscale || "").length;
  const cfLengthValid = cfLen === 16;

  // --- Form update helper (supports nested address.*) ------------------------
  const update = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      if (path.startsWith("address.")) {
        const key = path.split(".")[1];
        next.address = { ...prev.address, [key]: value };
      } else {
        next[path] = value;
      }
      return next;
    });
  };

  // --- Mutations (create / update / delete) ----------------------------------
  const createMut = useMutation({
    mutationFn: (payload) => createPerson(payload),
    onSuccess: (created) => {
      setForm(fromApi(created));  // Normalize BE → UI and lock CF
      setCfDisabled(true);
      showSuccess(t("messages.personCreated", "Persona creata."));

      const cf = created?.taxCode || created?.codiceFiscale;
      if (cf) queryClient.setQueryData(qkPersonByCf(cf), created);
      queryClient.invalidateQueries({ queryKey: qkPersonSearch() });
    },
    onError: (e) => {
      showError(errText(e, t("errors.create", "Errore durante la creazione.")));
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ cf, payload }) => updatePerson(cf, payload),
    onSuccess: (updated, vars) => {
      setForm(fromApi(updated));
      showSuccess(t("messages.personUpdated", "Persona aggiornata."));

      const cf = vars?.cf || updated?.taxCode || updated?.codiceFiscale;
      if (cf) queryClient.setQueryData(qkPersonByCf(cf), updated);
      queryClient.invalidateQueries({ queryKey: qkPersonSearch() });
    },
    onError: (e) => {
      showError(errText(e, t("errors.update", "Errore durante l'aggiornamento.")));
    },
  });

  const deleteMut = useMutation({
    mutationFn: (cf) => deletePerson(cf),
    onSuccess: (_, cf) => {
      onNew();
      showSuccess(t("messages.personDeleted", "Persona cancellata."));

      queryClient.removeQueries({ queryKey: qkPersonByCf(cf), exact: true });
      queryClient.invalidateQueries({ queryKey: qkPersonSearch() });
    },
    onError: (e) => {
      showError(errText(e, t("errors.delete", "Errore durante la cancellazione.")));
    },
  });

  // --- CF exact search -------------------------------------------------------
  const onSearchByCF = async (e) => {
    e?.preventDefault?.();
    const cf = (form?.codiceFiscale || "").trim().toUpperCase();

    // Immediate inline length validation
    if (!cf) {
      showError(t("validation.cfRequired", "Inserisci il CF."));
      return;
    }
    if (cf.length !== 16) {
      showError(t("validation.cfLength", "Il Codice Fiscale deve essere di 16 caratteri."));
      return;
    }

    try {
      const p = await getById(cf); // GET /persons/{cf}
      setForm(p);
      setCfDisabled(true);
      showSuccess(t("messages.personFound", "Persona trovata."));
    } catch (err) {
      setCfDisabled(false);
      if (err?.code === "NOT_FOUND" || err?.response?.status === 404) {
        setForm((prev) => ({ ...empty, codiceFiscale: cf })); // keep CF, clear others
        showError(t("messages.notFound", "Nessuna persona trovata."));
      } else {
        showError(t("errors.search", "Errore durante la ricerca."));
        console.error(err);
      }
    }
  };

  // --- CRUD actions ----------------------------------------------------------
  const onNew = () => {
    clearBanner();
    setForm(empty);
    setCfDisabled(false);
  };

  const validateFormForSave = (isCreate) => {
    // Keep using full validator
    const chk = validateCF(form.codiceFiscale);
    if (!chk.ok) return chk.error;

    const a = form.address || {};
    if (!form.nome?.trim()) return t("validation.nomeRequired", "Inserisci il Nome.");
    if (!form.cognome?.trim()) return t("validation.cognomeRequired", "Inserisci il Cognome.");
    if (!a.via?.trim()) return t("validation.viaRequired", "Inserisci la Via.");
    if (a.numeroCivico === "" || isNaN(Number(a.numeroCivico)))
      return t("validation.numeroCivicoInvalid", "Numero Civico non valido.");
    if (!a.citta?.trim()) return t("validation.cittaRequired", "Inserisci la Città.");
    if (!a.provincia?.trim()) return t("validation.provinciaRequired", "Inserisci la Provincia.");
    if (!a.nazione?.trim()) return t("validation.nazioneRequired", "Inserisci la Nazione.");
    if (!isCreate && !cfDisabled)
      return t(
        "validation.cfLockedForUpdate",
        "Il CF deve essere bloccato per l'aggiornamento. Cerca o crea prima."
      );
    return null;
  };

  const onCreate = async () => {
    clearBanner();

    // Also block create if CF length ≠ 16 for immediate UX
    if (!cfLengthValid) {
      showError(t("validation.cfLength", "Il Codice Fiscale deve essere di 16 caratteri."));
      return;
    }

    const err = validateFormForSave(true);
    if (err) {
      showError(err);
      return;
    }
    try {
      setLoading(true);
      await createMut.mutateAsync(form);
    } finally {
      setLoading(false);
    }
  };

  const onUpdate = async () => {
    clearBanner();

    if (!cfLengthValid) {
      showError(t("validation.cfLength", "Il Codice Fiscale deve essere di 16 caratteri."));
      return;
    }

    const err = validateFormForSave(false);
    if (err) {
      showError(err);
      return;
    }
    try {
      setLoading(true);

      const cf = (form.codiceFiscale || "").trim().toUpperCase();
      const rawNc = (form.address?.numeroCivico ?? "").toString().trim();
      const numeroCivico = Number.parseInt(rawNc, 10);
      if (!Number.isInteger(numeroCivico) || numeroCivico < 1) {
        showError(t("validation.numeroCivicoInvalid", "Numero Civico non valido."));
        return;
      }

      const payload = {
        codiceFiscale: cf,
        nome: (form.nome || "").trim(),
        cognome: (form.cognome || "").trim(),
        address: {
          via: (form.address?.via || "").trim(),
          numeroCivico,
          citta: (form.address?.citta || "").trim(),
          provincia: (form.address?.provincia || "").trim().toUpperCase(),
          nazione: (form.address?.nazione || "").trim(),
        },
      };

      await updateMut.mutateAsync({ cf, payload });
    } finally {
      setLoading(false);
    }
  };

  const onAskDelete = async () => {
    if (!form.codiceFiscale?.trim()) {
      showError(t("validation.selectValidFirst", "Seleziona prima una persona valida."));
      return;
    }
    const ok = window.confirm(
      t("confirm.delete", "Confermi la cancellazione di {{cf}}?", { cf: form.codiceFiscale })
    );
    if (!ok) return;

    clearBanner();
    try {
      setLoading(true);
      await deleteMut.mutateAsync(form.codiceFiscale);
    } finally {
      setLoading(false);
    }
  };

  // --- Selection from Advanced Filters --------------------------------------
  const handleSelectFromModal = useCallback(
    async (row) => {
      try {
        setLoading(true);
        const data = await queryClient.ensureQueryData({
          queryKey: qkPersonByCf(row.taxCode),
          queryFn: ({ signal }) => getById(row.taxCode, signal),
        });

        setForm({
          codiceFiscale: data.codiceFiscale || row.taxCode,
          nome: data.nome || row.name || "",
          cognome: data.cognome || row.surname || "",
          address: {
            via: data.address?.via || "",
            numeroCivico: data.address?.numeroCivico ?? "",
            citta: data.address?.citta || "",
            provincia: data.address?.provincia || row.province || "",
            nazione: data.address?.nazione || "",
          },
        });

        setCfDisabled(true);
        setIsFiltersOpen(false);
        showSuccess(t("messages.personFound", "Persona trovata."));
      } catch (e) {
        setIsFiltersOpen(false);
        showError(
          errText(e, t("errors.loadSelected", "Impossibile caricare i dettagli della persona selezionata."))
        );
      } finally {
        setLoading(false);
      }
    },
    [queryClient, t]
  );

  // --- Render ----------------------------------------------------------------
  return (
    <div className="container">
      <header className="header">
        <h1>{t("header.title", "Anagrafica Persona")}</h1>
        <p>{t("header.subtitle", "CRUD: creazione, ricerca, aggiornamento (CF immutabile), cancellazione.")}</p>
      </header>

      {/* CF search */}
      <section className="card card--search">
        <header className="card__header">
          <h2 className="card__title">{t("search.title", "Ricerca per Codice Fiscale")}</h2>
        </header>

        <div className="card__body">
          {/* Combo pill: input + button inside the same pill */}
          <div className="pill-combo">
            <input
              id="cf"
              className="pill-input pill-input--combo"
              value={form.codiceFiscale}
              onChange={(e) => {
                const raw = (e.target.value || "").toUpperCase();
                update("codiceFiscale", raw);
                // live length feedback
                if (raw && raw.length !== 16) {
                  setCfMsg({ type: "error", text: t("validation.cfLength", "Il Codice Fiscale deve essere di 16 caratteri.") });
                } else {
                  setCfMsg(null);
                }
              }}
              placeholder={t("search.placeholder", "RSSMRA80A01H501U")}
              autoComplete="off"
              aria-invalid={!!cfMsg && cfMsg.type === "error"}
              aria-describedby={cfMsg ? "cf-inline-msg" : undefined}
            />
            <button
              type="button"
              className="btn primary pill-btn pill-btn--combo"
              onClick={onSearchByCF}
              disabled={loading || !form.codiceFiscale || !cfLengthValid}
            >
              {t("search.button", "Cerca")}
            </button>
          </div>

          {/* Inline CF message only */}
          {cfMsg && (
            <div id="cf-inline-msg" className="inline-alert">
              <Alert type={cfMsg.type} onClose={() => setCfMsg(null)}>
                {cfMsg.text}
              </Alert>
            </div>
          )}

          {/* Advanced filters helper */}
          <div className="helper-line">
            <button
              type="button"
              className="linklike"
              onClick={() => setIsFiltersOpen(true)}
              aria-haspopup="dialog"
              aria-controls="advanced-filters-modal"
              aria-expanded={isFiltersOpen}
            >
              {t("search.advanced", "Filtri avanzati")}
            </button>
            <span className="helper-hint">{t("search.hint", "(Cognome parziale, Provincia a 2 lettere)")}</span>
          </div>
        </div>
      </section>

      {/* Person form */}
      <main className="content">
        <PersonForm
          form={form}
          onChange={update}
          onNew={onNew}
          onCreate={onCreate}
          onUpdate={onUpdate}
          onAskDelete={onAskDelete}
          loading={loading}
          cfDisabled={cfDisabled}
        />
      </main>

      {/* Advanced filters modal */}
      {isFiltersOpen && (
        <AdvancedFiltersModal
          id="advanced-filters-modal"
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          onSelectPerson={handleSelectFromModal}
        />
      )}
    </div>
  );
}
