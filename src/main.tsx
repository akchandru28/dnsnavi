import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import faviconUrl from "./assets/ciq-icon.ico";

const ensureFavicon = () => {
  const selector = "link[rel*='icon']";
  const existing = document.querySelector<HTMLLinkElement>(selector);
  if (existing) {
    existing.href = faviconUrl;
    return;
  }

  const link = document.createElement("link");
  link.rel = "icon";
  link.href = faviconUrl;
  document.head.appendChild(link);
};

ensureFavicon();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>
);
