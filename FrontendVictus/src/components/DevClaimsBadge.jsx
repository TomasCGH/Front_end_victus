import { useMemo } from "react";
import { useMsal } from "@azure/msal-react";

const DEFAULT_ENABLED = import.meta.env.DEV;

export default function DevClaimsBadge({ enabled = DEFAULT_ENABLED }) {
  const { accounts, instance } = useMsal();

  const info = useMemo(() => {
    if (!enabled || !instance) {
      return null;
    }

    const accountList = Array.isArray(accounts) ? accounts : [];
    const account = instance.getActiveAccount() ?? accountList[0] ?? null;

    if (!account) {
      return null;
    }

    const claims = account.idTokenClaims ?? {};
    const roles = Array.isArray(claims.roles) ? claims.roles : [];

    return {
      username: claims.preferred_username ?? claims.email ?? account.username,
      roles,
    };
  }, [accounts, enabled, instance]);

  if (!info) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        padding: "0.5rem 0.75rem",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        fontSize: "0.75rem",
        borderRadius: "0.5rem",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div><strong>Usuario:</strong> {info.username ?? "Desconocido"}</div>
      <div><strong>Roles:</strong> {info.roles.length ? info.roles.join(", ") : "Ninguno"}</div>
    </div>
  );
}
