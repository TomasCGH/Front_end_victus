import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import ProtectedRoute from "../auth/ProtectedRoute";
import { listConjuntos, createConjunto, updateConjunto, deleteConjunto } from "../services/conjuntoService";
import { normalizarConjunto } from "../utils/normalizers";
import useCatalogs from "../contexts/useCatalogs";
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
  const [conjuntos, setConjuntos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const { departamentos, ciudades, conjuntos: conjuntosCtx } = useCatalogs();
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);
  const [filtros, setFiltros] = useState({ nombre: "", departamentoId: "", ciudadId: "" });
  const filtrosRef = useRef(filtros);
  useEffect(() => { filtrosRef.current = filtros; }, [filtros]);
  
  // Mantener conjuntos desde el contexto
  useEffect(() => {
    setConjuntos(conjuntosCtx.map(completarNombresDesdeCatalogos));
  }, [conjuntosCtx]);

  // Derivar ciudades filtradas en memoria según departamento seleccionado
  useEffect(() => {
    if (!filtros.departamentoId) {
      setCiudadesFiltradas(ciudades);
    } else {
      setCiudadesFiltradas(
        ciudades.filter(c => String(c.departamentoId ?? c.departamento_id ?? c.departamento?.id ?? "") === String(filtros.departamentoId))
      );
    }
  }, [filtros.departamentoId, ciudades]);

  // Cargar conjuntos según filtros

  const completarNombresDesdeCatalogos = (c) => {
    if (!c) return c;
    const dep = departamentos.find(d => String(d.id) === String(c.departamentoId));
    const city = ciudades.find(ci => String(ci.id) === String(c.ciudadId));
    return {
      ...c,
      nombreDepartamento: c.nombreDepartamento || dep?.nombre || "",
      nombreCiudad: c.nombreCiudad || city?.nombre || "",
    };
  };

  const refresh = async () => {
    // Rehidratar desde contexto; sin llamadas extra
    setConjuntos(conjuntosCtx.map(completarNombresDesdeCatalogos));
  };

  // Derivar lista filtrada en memoria (nombre / departamento / ciudad)
  const conjuntosFiltrados = useMemo(() => {
    return conjuntos.filter(c => {
      if (filtros.departamentoId && String(c.departamentoId) !== String(filtros.departamentoId)) return false;
      if (filtros.ciudadId && String(c.ciudadId) !== String(filtros.ciudadId)) return false;
      if (filtros.nombre && !c.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) return false;
      return true;
    });
  }, [conjuntos, filtros]);

  // Cascadas cuando los catálogos cambian desde el contexto
  useEffect(() => {
    if (filtros.ciudadId && !ciudades.some(c => String(c.id) === String(filtros.ciudadId))) {
      setFiltros(f => ({ ...f, ciudadId: "" }));
    }
    if (filtros.departamentoId && !departamentos.some(d => String(d.id) === String(filtros.departamentoId))) {
      setFiltros(f => ({ ...f, departamentoId: "", ciudadId: "" }));
    }
  }, [departamentos, ciudades]);

  // Recalcular nombres mostrados cuando cambian catálogos
  useEffect(() => {
    setConjuntos(prev => prev.map(completarNombresDesdeCatalogos));
  }, [departamentos, ciudades]);

  // normalizarConjunto ahora importado desde utils/normalizers

  const handleCreate = async (payload) => {
    try {
      await createConjunto(payload);
      setCreating(false);
      // refresh para sincronizar (SSE debería disparar CREATED si backend lo emite)
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
            value={filtros.nombre}
            onChange={(e) => setFiltros(f => ({ ...f, nombre: e.target.value }))}
          />
          <select value={filtros.departamentoId} onChange={(e) => setFiltros(f => ({ ...f, departamentoId: e.target.value, ciudadId: "" }))}>
            <option value="">Selecciona un departamento</option>
            {departamentos.map((d) => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>
          <select value={filtros.ciudadId} onChange={(e) => setFiltros(f => ({ ...f, ciudadId: e.target.value }))} disabled={!filtros.departamentoId}>
            <option value="">{filtros.departamentoId ? "Todas las ciudades" : "Selecciona un departamento"}</option>
            {ciudadesFiltradas.map((c) => (
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
            {conjuntosFiltrados.map((item) => (
              <tr key={item.id}>
                <td>{item.nombre}</td>
                <td>{item.nombreDepartamento}</td>
                <td>{item.nombreCiudad}</td>
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
