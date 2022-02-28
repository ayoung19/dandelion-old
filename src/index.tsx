import React from "react";
import ReactDOM from "react-dom";
import { App } from "./App";

import { Provider } from "react-redux";
import { store } from "./store";

import { BrowserRouter as Router } from "react-router-dom";
import { Auth0ProviderWithHistory } from "./auth/Auth0ProviderWithHistory";

import { EuiProvider } from "@elastic/eui";

import "./index.css";
import "@elastic/eui/dist/eui_theme_light.css";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Router>
        <Auth0ProviderWithHistory>
          <EuiProvider colorMode="light">
            <App />
          </EuiProvider>
        </Auth0ProviderWithHistory>
      </Router>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
