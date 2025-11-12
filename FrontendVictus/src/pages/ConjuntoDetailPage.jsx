import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import Header from "../components/Header";
import { listConjuntos } from "../services/conjuntoService";
import { createViviendaForConjunto, listViviendasByConjunto } from "../services/viviendaService";

const TIPO_OPTIONS = ["Apartamento", "Casa", "Dúplex"];
const ESTADO_OPTIONS = ["Disponible", "Ocupada", "Mantenimiento"];

export default function ConjuntoDetailPage() {
  return (
    <ProtectedRoute>
      <ConjuntoDetailInner />
    </ProtectedRoute>
  );
}

function ConjuntoDetailInner() {
  const { id } = useParams();
  const [conjunto, setConjunto] = useState(null);
  const [viviendas, setViviendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form
  const [numero, setNumero] = useState("");
  const [tipo, setTipo] = useState("Apartamento");
  const [estado, setEstado] = useState("Disponible");
  const [q, setQ] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      // Obtenemos info de conjunto desde list (simplificado). Si existiera endpoint /conjuntos/:id, úsalo aquí.
      const { items } = await listConjuntos({});
      const found = items.find((x) => String(x.id) === String(id));
      setConjunto(found ?? { id });
      const list = await listViviendasByConjunto(id, { q });
      setViviendas(list);
      setError("");
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el conjunto o sus viviendas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const filtered = useMemo(() => {
    if (!q) return viviendas;
    const s = q.toLowerCase();
    return viviendas.filter((v) =>
      String(v.numero ?? "").toLowerCase().includes(s) || String(v.tipo ?? "").toLowerCase().includes(s) || String(v.estado ?? "").toLowerCase().includes(s)
    );
  }, [q, viviendas]);

  const handleCreateVivienda = async (e) => {
    e.preventDefault();
    try {
      await createViviendaForConjunto(id, { numero: numero.trim(), tipo, estado });
      setNumero("");
      setTipo("Apartamento");
      setEstado("Disponible");
      await refresh();
      alert("Vivienda creada correctamente");
    } catch (err) {
      console.error(err);
      alert("No se pudo crear la vivienda. Verifica tu conexión con el servidor.");
    }
  };

  return (
    <>
      <Header />
      <div className="admin-management-container">
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="ButtonBack" to="/conjuntos">Regresar</Link>
          <Link className="ButtonLogOut" to="/dashboard">Panel</Link>
        </div>

        <h2>Conjunto: {conjunto?.nombre ?? conjunto?.id}</h2>

        {/* Crear vivienda rápida */}
        <form className="admin-form" onSubmit={handleCreateVivienda}>
          <input type="text" placeholder="Número de vivienda" value={numero} onChange={(e) => setNumero(e.target.value)} required />
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPO_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            {ESTADO_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit">Crear vivienda</button>
          <input type="text" placeholder="Buscar vivienda (número/tipo/estado)" value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="button" onClick={refresh}>Refrescar</button>
        </form>

        {loading && <p>Cargando...</p>}
        {error && <p style={{ color: "#c0392b" }}>{error}</p>}

        <table className="admin-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Tipo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id ?? v.numero}>
                <td>{v.numero ?? "N/D"}</td>
                <td>{v.tipo ?? "N/D"}</td>
                <td>{v.estado ?? "N/D"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
