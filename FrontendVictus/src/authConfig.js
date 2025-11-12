import { PublicClientApplication } from "@azure/msal-browser";

// Configuración base de MSAL para el tenant específico Victus.
// Forzamos redirect/postLogout al puerto 5174 (coincide con dev server configurado por el usuario).
export const msalConfig = {
  auth: {
    clientId: "2d0738af-42c5-47dd-84bc-2d42f1ae40b4",
    authority: "https://login.microsoftonline.com/6c886530-747b-4e10-a112-170efc4f6ac6",
    redirectUri: "http://localhost:5174/",
    postLogoutRedirectUri: "http://localhost:5174/",
  },
  cache: {
    // Usamos sessionStorage para evitar persistencia entre cierres de pestaña
    // y reforzar que siempre se pida seleccionar cuenta.
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// Petición de login mínima (User.Read) + prompt select_account para obligar al panel de cuentas SIEMPRE.
export const loginRequest = {
  scopes: ["User.Read"],
  prompt: "select_account",
  authority: "https://login.microsoftonline.com/6c886530-747b-4e10-a112-170efc4f6ac6",
  redirectUri: "http://localhost:5174/",
};

export const msalInstance = new PublicClientApplication(msalConfig);

if (typeof window !== "undefined" && import.meta.env.DEV) {
  window.msalInstance = msalInstance;
}
