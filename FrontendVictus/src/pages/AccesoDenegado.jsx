import LogoutButton from "../components/LogoutButton";

// Página mostrada cuando el usuario no posee el rol requerido.
export default function AccesoDenegado() {
  const storedMessage = sessionStorage.getItem("accessDeniedMessage");
  if (storedMessage) {
    sessionStorage.removeItem("accessDeniedMessage");
  }
  const message = storedMessage || "Acceso denegado. No tiene permisos para acceder.";

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Acceso denegado</h2>
      <p>{message}</p>
      <LogoutButton text="Cerrar sesión" />
    </div>
  );
}
