import { useMsal } from "@azure/msal-react";
import { Navigate, useLocation } from "react-router-dom";

// Componente de ruta protegida: sólo deja pasar cuentas con rol "Administrador".
// No intenta logins silenciosos ni auto-redirecciones; valida el estado actual.
export default function ProtectedRoute({ children }) {
  const { instance } = useMsal();
  const location = useLocation();

  if (!instance) return null; // MSAL aún no listo

  const activeAccount = instance.getActiveAccount();
  if (!activeAccount) {
    // Sin sesión iniciada: volvemos a home (mostrar botón login)
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
