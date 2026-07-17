import ReactDOM from "react-dom/client";
import { StrictMode } from "react";

import * as store from "./data/store";
import { importSeed, importSeedFromStatic } from "./data/importSeed";
import App from "./App";

if (import.meta.env.DEV) {
  Object.assign(window, { importSeed, store });
}

// void importSeedFromStatic();

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
