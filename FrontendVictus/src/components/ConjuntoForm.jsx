import { useEffect, useMemo, useState } from "react";
import useCatalogs from "../contexts/useCatalogs";

const PHONE_REGEX = /^\d{7,10}$/; // simple validación de 7 a 10 dígitos

export default function ConjuntoForm({ initialData = null, onCancel, onSaved }) {
  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [direccion, setDireccion] = useState(initialData?.direccion ?? "");
  const [telefono, setTelefono] = useState(initialData?.telefono ?? "");
  const [departamentoId, setDepartamentoId] = useState(initialData?.departamentoId ?? "");
  const [ciudadId, setCiudadId] = useState(initialData?.ciudadId ?? "");
  const [administradorId, setAdministradorId] = useState(initialData?.administradorId ?? "");

  const { departamentos, ciudades, administradores, loading, error: catalogsError } = useCatalogs();
  const [localError, setLocalError] = useState("");
  const [backendError, setBackendError] = useState("");
  // Catálogos reactivos provienen del provider
  if (departamentoId && !departamentos.some(d => String(d.id) === String(departamentoId))) {
    // Si el dpto se eliminó en vivo, resetear selects
    setDepartamentoId("");
    setCiudadId("");
  }
  if (ciudadId && !ciudades.some(c => String(c.id) === String(ciudadId))) {
    setCiudadId("");
  }
  if (administradorId && !administradores?.some(a => String(a.id) === String(administradorId))) {
    setAdministradorId("");
  }

  const ciudadesFiltradas = useMemo(() => {
    if (!departamentoId) return [];
    // Filtro estricto por campo público departamentoId
    return ciudades.filter((c) => String(c.departamentoId).trim() === String(departamentoId).trim());
  }, [ciudades, departamentoId]);

  // Reset ciudad al cambiar departamento (requerimiento explícito)
  useEffect(() => {
    setCiudadId("");
  }, [departamentoId]);

  const isValid = useMemo(() => {
    const n = nombre.trim();
    const d = direccion.trim();
    const t = telefono.trim();
    return (
      n && n.length <= 100 &&
      d && d.length <= 200 &&
      PHONE_REGEX.test(t) &&
      departamentoId &&
      ciudadId &&
      administradorId
    );
  }, [nombre, direccion, telefono, departamentoId, ciudadId, administradorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setLocalError("Revisa los campos obligatorios, longitudes y el formato del teléfono.");
      setBackendError("");
      return;
    }
    const payload = {
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      departamentoId,
      ciudadId,
      administradorId,
    };
    try {
      await onSaved?.(payload);
      setLocalError("");
      setBackendError("");
    } catch (e) {
      const msg = e?.message || "No se pudo guardar.";
      // Si es 422 preservar validación local y añadir backend
      if (e?.status === 422) {
        // Combinar mensajes si ambos existen
        setBackendError(msg);
      } else {
        setBackendError(msg);
      }
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit} style={{ marginTop: 12 }}>
      {catalogsError && <p style={{ color: "#c0392b", marginBottom: 8 }}>
        Error cargando departamentos / ciudades
      </p>}
      {!catalogsError && loading && <p style={{ marginBottom: 8 }}>Cargando catálogos...</p>}
      {(localError || backendError) && !catalogsError && (
        <div style={{ color: "#c0392b", marginBottom: 8 }}>
          {localError && <p>{localError}</p>}
          {backendError && <p>{backendError}</p>}
        </div>
      )}

      <input
        type="text"
        placeholder="Nombre del conjunto"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Dirección"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        required
      />
      <input
        type="tel"
        placeholder="Teléfono (solo dígitos)"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        required
      />

      <select value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)} required>
        <option value="" disabled>
          {"Selecciona un departamento"}
        </option>
        {!catalogsError && departamentos.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nombre}
          </option>
        ))}
      </select>

      <select value={ciudadId} onChange={(e) => setCiudadId(e.target.value)} required disabled={!departamentoId}>
        <option value="" disabled>
          {!departamentoId ? "Selecciona primero un departamento" : "Selecciona una ciudad"}
        </option>
        {!catalogsError && ciudadesFiltradas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      <select value={administradorId} onChange={(e) => setAdministradorId(e.target.value)} required>
        <option value="" disabled>
          {"Selecciona un administrador"}
        </option>
        {!catalogsError && administradores?.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nombre} {a.email ? `- ${a.email}` : ""}
          </option>
        ))}
      </select>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={!isValid}>Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
