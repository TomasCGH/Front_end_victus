import { useMsal } from "@azure/msal-react";
import { Navigate, useLocation } from "react-router-dom";

// Ruta protegida: sólo permite acceso a cuentas con rol "Administrador".
// No realiza login automático ni intentos silenciosos.
export default function ProtectedRoute({ children }) {
  const { instance } = useMsal();
  const location = useLocation();

  if (!instance) return null; // Aún inicializando MSAL

  const activeAccount = instance.getActiveAccount();
  if (!activeAccount) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  const roles = Array.isArray(activeAccount.idTokenClaims?.roles)
    ? activeAccount.idTokenClaims.roles
    : [];

  if (!roles.includes("Administrador")) {
    sessionStorage.setItem(
      "accessDeniedMessage",
      "Acceso denegado. No tiene permisos para acceder."
    );
    return <Navigate to="/acceso-denegado" replace />;
  }

  return children;
}
