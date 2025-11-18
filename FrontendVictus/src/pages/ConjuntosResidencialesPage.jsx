import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import ProtectedRoute from "../auth/ProtectedRoute";
import { createConjunto, updateConjunto, deleteConjunto } from "../services/conjuntoService";
import useCatalogs from "../contexts/useCatalogs";
import ConjuntoForm from "../components/ConjuntoForm";
import { Link } from "react-router-dom";
import { fetchDepartamentos } from "../services/locationService";

export default function ConjuntosResidencialesPage() {
  return (
    <ProtectedRoute>
      <ConjuntosResidencialesInner />
    </ProtectedRoute>
  );
}

function ConjuntosResidencialesInner() {
  const [conjuntos, setConjuntos] = useState([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [flashMsg, setFlashMsg] = useState("");
  const { departamentos, ciudades, administradores, conjuntos: conjuntosCtx, loading, error, refreshAll } = useCatalogs();
  const [ciudadesFiltradas, setCiudadesFiltradas] = useState([]);
  const [filtros, setFiltros] = useState({ nombre: "", departamentoId: "", ciudadId: "" });
  
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
    const admin = administradores?.find(a => String(a.id) === String(c.administradorId));
    return {
      ...c,
      nombreDepartamento: c.nombreDepartamento || dep?.nombre || "",
      nombreCiudad: c.nombreCiudad || city?.nombre || "",
      nombreAdministrador: c.nombreAdministrador || c.administradorNombre || admin?.nombre || "",
    };
  };

  const refresh = async () => setConjuntos(conjuntosCtx.map(completarNombresDesdeCatalogos));

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
      const creado = await createConjunto(payload);
      setCreating(false);
      // refresh para sincronizar (SSE debería disparar CREATED si backend lo emite)
      await refresh();
      // Optimismo: si aún no llegó por SSE, insertar si falta
      setConjuntos(prev => {
        const exists = prev.some(c => String(c.id) === String(creado?.id));
        if (exists) return prev;
        const normalizado = completarNombresDesdeCatalogos({
          id: creado?.id,
          nombre: creado?.nombre || payload.nombre,
          direccion: creado?.direccion || payload.direccion,
          telefono: creado?.telefono || payload.telefono,
          departamentoId: creado?.departamentoId || payload.departamentoId,
          ciudadId: creado?.ciudadId || payload.ciudadId,
          administradorId: creado?.administradorId || payload.administradorId,
          nombreAdministrador: creado?.administradorNombre || creado?.nombreAdministrador,
        });
        return [...prev, normalizado];
      });
      setFlashMsg("Conjunto creado correctamente.");
      setTimeout(() => setFlashMsg(""), 4000);
    } catch (err) {
      console.error(err);
      // Propagar para que el formulario muestre el mensaje del backend
      throw err;
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
        {flashMsg && (
          <div style={{ background: '#e8f5e9', color: '#1b5e20', padding: 8, borderRadius: 6, marginBottom: 12 }}>
            {flashMsg}
          </div>
        )}

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
          {/* Filtrado reactivo en memoria; no se requiere Buscar */}
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
                const actualizado = await updateConjunto(editing.id, payload);
                setEditing(null);
                await refresh();
                // Optimismo actualización si SSE demora
                setConjuntos(prev => prev.map(c => {
                  if (String(c.id) !== String(editing.id)) return c;
                  return completarNombresDesdeCatalogos({
                    ...c,
                    nombre: actualizado?.nombre || payload.nombre,
                    direccion: actualizado?.direccion || payload.direccion,
                    telefono: actualizado?.telefono || payload.telefono,
                    administradorId: actualizado?.administradorId || payload.administradorId,
                    nombreAdministrador: actualizado?.administradorNombre || actualizado?.nombreAdministrador || c.nombreAdministrador,
                  });
                }));
                setFlashMsg("Conjunto actualizado correctamente.");
                setTimeout(() => setFlashMsg(""), 4000);
              } catch (err) {
                console.error(err);
                // Propagar para que el formulario muestre el mensaje del backend
                throw err;
              }
            }}
          />
        )}

        
        {!error && loading && <p>Cargando...</p>}
        {!error && !loading && conjuntosFiltrados.length === 0 && (
          <p>No hay conjuntos para mostrar.</p>
        )}

        {/* Tabla */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre del conjunto</th>
              <th>Departamento</th>
              <th>Ciudad</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Administrador</th>
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
                <td>{item.nombreAdministrador}</td>
                <td>
                  <Link className="ButtonAccept" to={`/conjuntos/${item.id}`}>Entrar</Link>
                  <button type="button" onClick={() => setEditing(item)}>Editar</button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm("¿Eliminar este conjunto?")) return;
                      try {
                        await deleteConjunto(item.id);
                        // Optimista: reflejar al instante
                        setConjuntos(prev => prev.filter(c => String(c.id) !== String(item.id)));
                        setFlashMsg("Conjunto residencial eliminado.");
                        setTimeout(() => setFlashMsg(""), 4000);
                        // Sincronizar desde backend
                        await refreshAll?.();
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
