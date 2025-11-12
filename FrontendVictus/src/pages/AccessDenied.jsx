import { useEffect, useState } from "react";
import LogoutButton from "../components/LogoutButton";

function AccessDenied() {
  const [message, setMessage] = useState(
    "Acceso denegado. No tiene permisos para acceder."
  );

  useEffect(() => {
    const storedMessage = sessionStorage.getItem("accessDeniedMessage");
    if (storedMessage) {
      setMessage(storedMessage);
      sessionStorage.removeItem("accessDeniedMessage");
    }
  }, []);

  return (
    <div className="access-denied-page">
      <h2>Acceso denegado</h2>
      <p>{message}</p>
      <LogoutButton className="ButtonAccept" text="Cerrar sesión" />
    </div>
  );
}

export default AccessDenied;
