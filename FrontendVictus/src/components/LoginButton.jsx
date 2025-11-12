import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { clearSession } from "../utils/msalSession";
import { useNavigate } from "react-router-dom";

function LoginButton({
  className = "ButtonAccept",
  text = "Iniciar sesión con Microsoft",
}) {
  const { instance } = useMsal();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      // 🔹 Forzamos el login SIEMPRE en el tenant Victus
      const loginResponse = await instance.loginPopup({
        ...loginRequest,
        authority: "https://login.microsoftonline.com/6c886530-747b-4e10-a112-170efc4f6ac6",
        prompt: "select_account",
      });

      const account = loginResponse.account;
      if (!account) throw new Error("No se obtuvo la cuenta tras loginPopup.");

      instance.setActiveAccount(account);
      localStorage.setItem("user", JSON.stringify(account));

      // 🔹 Validar tenant correcto
      const tenantId = loginResponse.idTokenClaims?.tid;
      if (tenantId !== "6c886530-747b-4e10-a112-170efc4f6ac6") {
        alert("Tu cuenta no pertenece al tenant Victus. Usa una cuenta de administrador autorizada.");
        await instance.logoutPopup();
        clearSession();
        localStorage.removeItem("user");
        sessionStorage.removeItem("currentAdmin");
        navigate("/", { replace: true });
        return;
      }

      // 🔹 Validar roles
      const roles = Array.isArray(loginResponse.idTokenClaims?.roles)
        ? loginResponse.idTokenClaims.roles
        : [];

      console.log("[MSAL] Usuario autenticado:", {
        name: account.name,
        username: account.username,
        tenantId,
        roles,
      });

      const hasAdminRole = roles.includes("Administrador");
      if (!hasAdminRole) {
        alert("Acceso denegado. No tiene permisos para acceder.");
        clearSession();
        localStorage.removeItem("user");
        sessionStorage.removeItem("currentAdmin");
        navigate("/acceso-denegado", { replace: true });
        return;
      }

      // 🔹 Si pasa todo, al dashboard
      navigate("/dashboard", { replace: true });

    } catch (error) {
      console.error("Error al iniciar sesión con Microsoft:", error);
      const code = error.errorCode || error.code || "";
      if (code === "AADSTS500208" || /AADSTS500208/.test(error.message)) {
        setErrorMsg("Tu cuenta no pertenece al tenant Victus. Usa una cuenta de administrador autorizada.");
      } else {
        setErrorMsg("No se pudo iniciar sesión. Intenta nuevamente.");
      }
      window.alert(errorMsg || "No se pudo iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-button-wrapper">
      {!instance ? (
        <p style={{ color: "#c0392b" }}>Servicio de autenticación no disponible.</p>
      ) : null}
      <button
        type="button"
        className={className}
        onClick={handleLogin}
        disabled={loading || !instance}
      >
        {loading ? "Conectando..." : text}
      </button>
      {errorMsg && (
        <p style={{ color: "#c0392b", marginTop: "0.5rem", fontSize: "0.9rem" }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
}

export default LoginButton;
