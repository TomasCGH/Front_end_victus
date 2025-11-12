import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";

// Página intermedia tras login exitoso de un Administrador.
// Permite continuar manualmente al dashboard protegido.
export default function ShowAdmins() {
  const { instance } = useMsal();
  const navigate = useNavigate();
  const account = instance?.getActiveAccount();
  const name = account?.name || account?.username || "Administrador";

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bienvenido Administrador</h1>
      <p>Has iniciado sesión como: <strong>{name}</strong></p>
      <p>Tu rol ha sido validado. Haz clic para continuar.</p>
      <button
        type="button"
        className="ButtonAccept"
        onClick={() => navigate("/dashboard")}
      >
        Ir al Dashboard
      </button>
    </div>
  );
}
