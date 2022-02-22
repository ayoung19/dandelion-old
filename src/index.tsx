import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import "@elastic/eui/dist/eui_theme_light.css";

import { EuiProvider } from "@elastic/eui";
import { App } from "./App";

ReactDOM.render(
  <StrictMode>
    <EuiProvider colorMode="light">
      <App />
    </EuiProvider>
  </StrictMode>,
  document.getElementById("root")
);
