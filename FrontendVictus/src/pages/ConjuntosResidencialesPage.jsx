import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import ProtectedRoute from "../auth/ProtectedRoute";
import { listConjuntos, createConjunto, updateConjunto, deleteConjunto } from "../services/conjuntoService";
import { fetchDepartamentos, fetchCiudades } from "../services/locationService";
import ConjuntoForm from "../components/ConjuntoForm";
import { Link } from "react-router-dom";

export default function ConjuntosResidencialesPage() {
  return (
    <ProtectedRoute>
      <ConjuntosResidencialesInner />
    </ProtectedRoute>
  );
}

function ConjuntosResidencialesInner() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);

  // Filtros
  const [nombre, setNombre] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [ciudadId, setCiudadId] = useState("");

  // Listas dinámicas
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  // Cargar departamentos inicial + polling
  useEffect(() => {
    let mounted = true;
    let timer;
    const loadDeps = async () => {
      try {
        const deps = await fetchDepartamentos();
        if (mounted) setDepartamentos(deps);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la lista de departamentos. Verifica tu conexión con el servidor.");
      }
    };
    loadDeps();
    timer = setInterval(loadDeps, 45000);
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  // Cargar ciudades dependientes + polling
  useEffect(() => {
    let mounted = true;
    let timer;
    const loadCities = async () => {
      try {
        const cities = await fetchCiudades(departamentoId);
        if (mounted) setCiudades(cities);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la lista de ciudades. Verifica tu conexión con el servidor.");
      }
    };
    loadCities();
    timer = setInterval(loadCities, 45000);
    return () => { mounted = false; clearInterval(timer); };
  }, [departamentoId]);

  // Cargar conjuntos según filtros
  const refresh = async () => {
    setLoading(true);
    try {
      const { items } = await listConjuntos({ nombre, departamentoId, ciudadId });
      setItems(items);
      setError("");
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la lista de conjuntos residenciales. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => items, [items]);

  const handleCreate = async (payload) => {
    try {
      await createConjunto(payload);
      setCreating(false);
      await refresh();
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el conjunto residencial. Verifica los datos e intenta nuevamente.");
    }
  };

  return (
    <>
      <Header />
      <div className="admin-management-container">
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="ButtonBack" to="/dashboard">Regresar</Link>
        </div>
        <h2>Conjuntos residenciales</h2>

        {/* Filtros */}
        <div className="admin-form" style={{ marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <select value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)}>
            <option value="">Selecciona un departamento</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
          <select value={ciudadId} onChange={(e) => setCiudadId(e.target.value)} disabled={!departamentoId}>
            <option value="">{departamentoId ? "Selecciona una ciudad" : "Selecciona un departamento"}</option>
            {ciudades.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <button type="button" onClick={refresh}>Buscar</button>
          <button type="button" onClick={() => setCreating((v) => !v)}>
            {creating ? "Ocultar formulario" : "Crear nuevo conjunto residencial"}
          </button>
        </div>

        {creating && (
          <ConjuntoForm onCancel={() => setCreating(false)} onSaved={handleCreate} />
        )}
        {editing && (
          <ConjuntoForm
            initialData={editing}
            onCancel={() => setEditing(null)}
            onSaved={async (payload) => {
              try {
                await updateConjunto(editing.id, payload);
                setEditing(null);
                await refresh();
              } catch (err) {
                console.error(err);
                alert("No se pudo actualizar el conjunto residencial. Intenta nuevamente.");
              }
            }}
          />
        )}

        {loading && <p>Cargando conjuntos...</p>}
        {error && <p style={{ color: "#c0392b" }}>{error}</p>}

        {/* Tabla */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre del conjunto</th>
              <th>Departamento</th>
              <th>Ciudad</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.nombre}</td>
                <td>{item.departamentoNombre ?? item.departamentoId ?? "N/D"}</td>
                <td>{item.ciudadNombre ?? item.ciudadId ?? "N/D"}</td>
                <td>{item.direccion}</td>
                <td>{item.telefono}</td>
                <td>
                  <Link className="ButtonAccept" to={`/conjuntos/${item.id}`}>Entrar</Link>
                  <button type="button" onClick={() => setEditing(item)}>Editar</button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm("¿Eliminar este conjunto?")) return;
                      try {
                        await deleteConjunto(item.id);
                        await refresh();
                      } catch (err) {
                        console.error(err);
                        alert("No se pudo eliminar el conjunto residencial.");
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
