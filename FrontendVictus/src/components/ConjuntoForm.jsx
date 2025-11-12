import { useEffect, useMemo, useState } from "react";
import { fetchDepartamentos, fetchCiudades } from "../services/locationService";

const PHONE_REGEX = /^\d{7,10}$/; // simple validación de 7 a 10 dígitos

export default function ConjuntoForm({ initialData = null, onCancel, onSaved }) {
  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [direccion, setDireccion] = useState(initialData?.direccion ?? "");
  const [telefono, setTelefono] = useState(initialData?.telefono ?? "");
  const [departamentoId, setDepartamentoId] = useState(initialData?.departamentoId ?? "");
  const [ciudadId, setCiudadId] = useState(initialData?.ciudadId ?? "");

  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [error, setError] = useState("");

  // Cargar departamentos con polling cada 45s
  useEffect(() => {
    let mounted = true;
    let timer;
    const load = async () => {
      try {
        setLoadingDeps(true);
        const list = await fetchDepartamentos();
        if (mounted) setDepartamentos(list);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la lista de departamentos. Verifica tu conexión con el servidor.");
      } finally {
        setLoadingDeps(false);
      }
    };
    load();
    timer = setInterval(load, 45000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  // Cargar ciudades cuando cambia el departamento + polling
  useEffect(() => {
    let mounted = true;
    let timer;
    const load = async () => {
      if (!departamentoId) { setCiudades([]); setCiudadId(""); return; }
      try {
        setLoadingCities(true);
        const list = await fetchCiudades(departamentoId);
        if (mounted) setCiudades(list);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la lista de ciudades. Verifica tu conexión con el servidor.");
      } finally {
        setLoadingCities(false);
      }
    };
    load();
    timer = setInterval(load, 45000);
    return () => { mounted = false; clearInterval(timer); };
  }, [departamentoId]);

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
          {loadingDeps ? "Cargando departamentos..." : "Selecciona un departamento"}
        </option>
        {departamentos.map((d) => (
          <option key={d.id} value={d.id}>
            {d.nombre}
          </option>
        ))}
      </select>

      <select value={ciudadId} onChange={(e) => setCiudadId(e.target.value)} required disabled={!departamentoId}>
        <option value="" disabled>
          {!departamentoId ? "Selecciona primero un departamento" : loadingCities ? "Cargando ciudades..." : "Selecciona una ciudad"}
        </option>
        {ciudades.map((c) => (
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
