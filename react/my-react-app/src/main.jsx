import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "496144110879-h0ss8jv658mi0lmrolls4despalo3hf5.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);