import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { AppProviders, AppRoutes } from "./app/App";
import "./styles/global.css";
import "./styles/components.css";

const container = document.getElementById("root");
if (!container) {
  throw new Error("Missing #root element — index.html is broken");
}

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  </StrictMode>,
);
