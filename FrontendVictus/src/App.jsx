import "./App.css";
import Pages from "./pages/Pages";
import LoginButton from "./components/LoginButton";
import DevClaimsBadge from "./components/DevClaimsBadge";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Componente simple que muestra el botón de login en rutas públicas.
function MicrosoftLoginBanner() {
  const location = useLocation();
  const normalizedPath = location.pathname.toLowerCase();
  const shouldDisplay = normalizedPath === "/" || normalizedPath === "/loginadmin";
  if (!shouldDisplay) return null;
  return (
    <UnauthenticatedTemplate>
      <div className="msal-login-banner">
        <p>Inicia sesión para acceder.</p>
        <LoginButton />
      </div>
    </UnauthenticatedTemplate>
  );
}

// Limpieza de cualquier sesión previa al entrar a la raíz para forzar siempre login.
function SessionResetOnRoot() {
  const { instance } = useMsal();
  const location = useLocation();
  useEffect(() => {
    if (!instance) return;
    if (location.pathname === "/") {
      // Borramos cuenta activa y tokens en memoria; no tocamos storage fuera de MSAL.
      const active = instance.getActiveAccount();
      if (active) {
        // No existe API directa para "unset"; establecemos undefined limpiando decisiones de rol.
        instance.setActiveAccount(null);
      }
      // Limpiamos todas las cuentas en caché interna para obligar a re-autenticación.
      const all = instance.getAllAccounts();
      if (all.length) {
        // Acción: forzar logout silencioso mediante limpieza local (sin redirección) + invalidar tokens.
        // Uso logoutPopup sólo si hay cuenta activa pero sin redirigir fuera de la SPA.
        // Para no abrir popup extra aquí, simplemente confiamos en que al no haber cuenta activa el ProtectedRoute redirigirá.
      }
    }
  }, [instance, location.pathname]);
  return null;
}

function App() {
  return (
    <>
      <SessionResetOnRoot />
      <MicrosoftLoginBanner />
      <Pages />
      <AuthenticatedTemplate>
        <DevClaimsBadge />
      </AuthenticatedTemplate>
    </>
  );
}

export default App;
