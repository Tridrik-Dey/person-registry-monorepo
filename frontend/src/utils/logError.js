// src/utils/logError.js
export function logError(error, context = {}) {
  try {
    const payload = {
      message: typeof error === "string" ? error : error?.message || "Unknown error",
      stack: error?.stack || null,
      context,
      url: window.location.href,
      ts: new Date().toISOString(),
    };

    // TODO: send to your backend or Sentry/ELK here
    // fetch('/log', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[logError]", payload);
    }
  } catch {
    // swallow
  }
}
