// src/index.js
import "./i18n";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { logError } from "./utils/logError";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import queryClient from "./query/client";

// In production, capture hard crashes globally
if (process.env.NODE_ENV === "production") {
  window.addEventListener("error", (e) =>
    logError(e.error || e.message, { scope: "window.error" })
  );
  window.addEventListener("unhandledrejection", (e) =>
    logError(e.reason, { scope: "unhandledrejection" })
  );
}

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <App />
      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  </AppErrorBoundary>
);
