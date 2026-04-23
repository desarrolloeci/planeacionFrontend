import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { PublicClientApplication, EventType } from "@azure/msal-browser";

import { App } from "./app";
import { msalConfig } from "./authConfig";


export const msalInstance = new PublicClientApplication(msalConfig);


const accounts = msalInstance.getAllAccounts();

if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload;
    const account = payload.account;
    msalInstance.setActiveAccount(account);
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>

    <App pca={msalInstance} />

  </StrictMode>
);
