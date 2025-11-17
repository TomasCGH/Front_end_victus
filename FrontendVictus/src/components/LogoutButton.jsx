import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { clearSession, SESSION_STORAGE_KEY } from "../utils/msalSession";

export default function LogoutButton({ className = "ButtonAccept", text = "Cerrar sesión" }) {
  const { instance } = useMsal();
  const [loading, setLoading] = useState(false);

  if (!instance) {
    return null;
  }

  const handleLogout = async () => {
    setLoading(true);
    try {
      // Sólo limpiamos la caché MSAL y nuestras claves, sin borrar todo el localStorage
      await instance.logoutPopup({
        postLogoutRedirectUri: (typeof window !== 'undefined' && window.location?.origin) ? `${window.location.origin}/` : undefined,
      });
    } catch (error) {
      console.error("No se pudo cerrar sesión en Microsoft:", error);
    } finally {
      clearSession(); // elimina SESSION_STORAGE_KEY
      sessionStorage.removeItem("currentAdmin");
      sessionStorage.removeItem("accessDeniedMessage");
      // Eliminamos sólo la clave 'user' asociada a la cuenta activa
      localStorage.removeItem("user");
      setLoading(false);
      // Redirigimos vía asignación para limpiar el estado en memoria
      window.location.href = "/";
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={handleLogout}
      disabled={loading}
    >
      {loading ? "Cerrando..." : text}
    </button>
  );
}
