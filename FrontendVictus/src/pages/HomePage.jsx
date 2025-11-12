import NavBurguer from "../components/NavBurguer";
import LoginButton from "../components/LoginButton";
import "../cssComponents/HomePage.css";

function HomePage() {
  return (
    <>
      <NavBurguer />
      <main className="home-hero">
        <section className="home-hero-content" style={{ textAlign: "center" }}>
          <h1>Bienvenido a Victus Viviendas</h1>
          <p>
            Gestiona conjuntos, viviendas y servicios desde un panel diseñado
            para administradores. Inicia sesión para acceder al panel de
            control.
          </p>
          <div className="home-hero-actions">
            <LoginButton className="ButtonAccept" text="Iniciar sesión con Microsoft" />
          </div>
        </section>
      </main>
    </>
  );
}

export default HomePage;
