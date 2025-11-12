import { Link } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import Header from "../components/Header";
import LogoutButton from "../components/LogoutButton";
import ProtectedRoute from "../auth/ProtectedRoute";
import "../cssComponents/HomePage.css";

function Card({ title, description, to, disabled = false }) {
  if (disabled) {
    return (
      <div
        className="card disabled"
        title="Disponible próximamente"
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          background: "#f3f4f6",
          color: "#6b7280",
          textDecoration: "none",
        }}
      >
        <h3>{title}</h3>
        <p>{description}</p>
        <button className="ButtonDisabled" disabled>
          Próximamente
        </button>
      </div>
    );
  }
  return (
    <Link
      to={to}
      className="card"
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 20,
        background: "white",
        textDecoration: "none",
        color: "inherit",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="link-cta">Entrar</span>
    </Link>
  );
}

function SelectionDashboardInner() {
  const { instance } = useMsal();
  const account = instance?.getActiveAccount();
  const roles = Array.isArray(account?.idTokenClaims?.roles)
    ? account.idTokenClaims.roles
    : [];

  return (
    <>
      <Header />
      <main className="home-hero">
        <section className="home-hero-content" style={{ maxWidth: 1100 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
            <div>
              <h1 style={{ marginBottom: 4 }}>Panel de administración</h1>
              <p style={{ margin: 0 }}>Selecciona un módulo para continuar.</p>
              {account && (
                <small style={{ display: "block", marginTop: 8, opacity: 0.8 }}>
                  Sesión: {account?.name} ({account?.username}) · Roles: {roles.join(", ") || "N/D"}
                </small>
              )}
            </div>
            <div>
              <LogoutButton className="ButtonBack" text="Cerrar sesión" />
            </div>
          </div>

          <div className="dashboard-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 16,
            marginTop: 24,
          }}>
            <Card
              title="Conjuntos residenciales"
              description="Consultar, buscar y crear conjuntos residenciales"
              to="/conjuntos"
            />
            <Card
              title="Administraciones"
              description="Gestión de administraciones"
              disabled
            />
            <Card
              title="Residentes"
              description="Control de residentes"
              disabled
            />
            <Card
              title="Zonas Comunes"
              description="Reservas y administración"
              disabled
            />
          </div>
        </section>
      </main>
    </>
  );
}

export default function SelectionDashboard() {
  return (
    <ProtectedRoute>
      <SelectionDashboardInner />
    </ProtectedRoute>
  );
}
