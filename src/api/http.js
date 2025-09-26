// src/api/http.js
import axios from "axios";

// Resolve base URL from env; DO NOT append '/api'
const base = process.env.REACT_APP_API_BASE || "";

console.log("HTTP baseURL ->", base);

const http = axios.create({
  baseURL: base,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Centralized error policy: attach a user-friendly message once
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const msg =
      err?.response?.data?.message ||
      (status ? `Errore ${status}` : "Errore di rete");
    err.friendlyMessage = msg; // <- use e.friendlyMessage in your catches
    return Promise.reject(err);
  }
);

export default http;
export { http }; // optional named export if you prefer importing { http }
