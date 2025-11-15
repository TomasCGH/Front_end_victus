import { useMemo, useState } from "react";
import useCatalogs from "../contexts/useCatalogs";

const PHONE_REGEX = /^\d{7,10}$/; // simple validación de 7 a 10 dígitos

export default function ConjuntoForm({ initialData = null, onCancel, onSaved }) {
  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [direccion, setDireccion] = useState(initialData?.direccion ?? "");
  const [telefono, setTelefono] = useState(initialData?.telefono ?? "");
  const [departamentoId, setDepartamentoId] = useState(initialData?.departamentoId ?? "");
  const [ciudadId, setCiudadId] = useState(initialData?.ciudadId ?? "");

  const { departamentos, ciudades } = useCatalogs();
  const [error, setError] = useState("");
  // Catálogos reactivos provienen del provider
  if (departamentoId && !departamentos.some(d => String(d.id) === String(departamentoId))) {
    // Si el dpto se eliminó en vivo, resetear selects
    setDepartamentoId("");
    setCiudadId("");
  }
  if (ciudadId && !ciudades.some(c => String(c.id) === String(ciudadId))) {
    setCiudadId("");
  }

  const ciudadesFiltradas = useMemo(() => {
    if (!departamentoId) return [];
    return ciudades.filter((c) => String(c.departamentoId) === String(departamentoId));
  }, [ciudades, departamentoId]);

  const isValid = useMemo(() => {
    return (
      nombre.trim() &&
      direccion.trim() &&
      PHONE_REGEX.test(telefono.trim()) &&
      departamentoId &&
      ciudadId
    );
  }, [nombre, direccion, telefono, departamentoId, ciudadId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) { setError("Revisa los campos obligatorios y el formato del teléfono."); return; }
    const payload = { nombre: nombre.trim(), direccion: direccion.trim(), telefono: telefono.trim(), departamentoId, ciudadId };
    await onSaved?.(payload);
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit} style={{ marginTop: 12 }}>
      {error && <p style={{ color: "#c0392b", marginBottom: 8 }}>{error}</p>}

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
        {departamentos.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nombre}
          </option>
        ))}
      </select>

      <select value={ciudadId} onChange={(e) => setCiudadId(e.target.value)} required disabled={!departamentoId}>
        <option value="" disabled>
          {!departamentoId ? "Selecciona primero un departamento" : "Selecciona una ciudad"}
        </option>
        {ciudadesFiltradas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
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
