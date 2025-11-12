// Backup of original HomePage.jsx before Tailwind integration
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import NavBurguer from "../components/NavBurguer";
import "../cssComponents/HomePage.css";

function HomePage() {
  const { accounts, instance } = useMsal();
  const navigate = useNavigate();
  const hasInstance = Boolean(instance);

  useEffect(() => {
    if (!hasInstance) {
      return;
    }

    const accountList = Array.isArray(accounts) ? accounts : [];
    const account = instance.getActiveAccount() ?? accountList[0] ?? null;
    const roles = Array.isArray(account?.idTokenClaims?.roles)
      ? account.idTokenClaims.roles
      : [];

    if (roles.includes("Administrador")) {
      navigate("/dashboard", { replace: true });
    }
  }, [accounts, hasInstance, instance, navigate]);

  if (!hasInstance) {
    return null;
  }

  return (
    <>
      <NavBurguer />
      <main className="home-hero">
        <section className="home-hero-content">
          <h1>Bienvenido a Victus Viviendas</h1>
          <p>
            Gestiona conjuntos, viviendas y servicios desde un panel diseñado
            para administradores. Inicia sesión para acceder al panel de
            control.
          </p>
          <div className="home-hero-actions">
            <Link className="ButtonAccept" to="/loginAdmin">
              Iniciar sesión como Administrador
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export default HomePage;
