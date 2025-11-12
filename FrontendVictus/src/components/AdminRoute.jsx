import { InteractionType } from "@azure/msal-browser";
import {
  AuthenticatedTemplate,
  MsalAuthenticationTemplate,
  useMsal,
} from "@azure/msal-react";
import { Navigate } from "react-router-dom";

const loadingView = () => <p>Verificando sesión...</p>;
const errorView = ({ error }) => (
  <p style={{ color: "red" }}>No fue posible iniciar sesión: {error?.message}</p>
);

const hasAdminRole = (accounts) => {
  return accounts.some((account) => {
    const claims = account?.idTokenClaims ?? {};
    const rolesClaim = claims?.roles ?? claims?.role;

    if (Array.isArray(rolesClaim)) {
      return rolesClaim.some((role) =>
        ["Admin", "Administrador"].includes(String(role))
      );
    }

    if (typeof rolesClaim === "string") {
      return rolesClaim
        .split(",")
        .map((role) => role.trim())
        .some((role) => ["Admin", "Administrador"].includes(role));
    }

    return false;
  });
};

function AdminRoute({ children }) {
  const { accounts } = useMsal();
  const placeholderClientId = "00000000-0000-0000-0000-000000000000";
  const configuredClientId = import.meta.env.VITE_AZURE_CLIENT_ID ?? placeholderClientId;
  const isMsalConfigured = configuredClientId !== placeholderClientId;

  let legacyAdmin = false;
  try {
    legacyAdmin = Boolean(sessionStorage.getItem("currentAdmin"));
  } catch (error) {
    console.warn("No se pudo acceder a sessionStorage para validar administrador local", error);
  }

  if (!isMsalConfigured) {
    return legacyAdmin ? <>{children}</> : <Navigate to="/loginAdmin" replace />;
  }

  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
      loadingComponent={loadingView}
      errorComponent={errorView}
    >
      <AuthenticatedTemplate>
        {hasAdminRole(accounts) ? children : <Navigate to="/" replace />}
      </AuthenticatedTemplate>
    </MsalAuthenticationTemplate>
  );
}

export default AdminRoute;
