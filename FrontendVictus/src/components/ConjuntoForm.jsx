import { useEffect, useMemo, useState } from "react";
import useCatalogs from "../contexts/useCatalogs";
import "../cssComponents/ConjuntoForm.css";

const PHONE_REGEX = /^\d{7,10}$/; // simple validación de 7 a 10 dígitos

export default function ConjuntoForm({ initialData = null, onCancel, onSaved }) {
  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [direccion, setDireccion] = useState(initialData?.direccion ?? "");
  const [telefono, setTelefono] = useState(initialData?.telefono ?? "");
  const [departamentoId, setDepartamentoId] = useState(initialData?.departamentoId ?? "");
  const [ciudadId, setCiudadId] = useState(initialData?.ciudadId ?? "");
  const [administradorId, setAdministradorId] = useState(initialData?.administradorId ?? "");

  const { departamentos, ciudades, administradores, loading, error: catalogsError } = useCatalogs();
  const [localErrors, setLocalErrors] = useState([]); // array de strings
  const [backendErrors, setBackendErrors] = useState([]); // array de strings
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

  const validarCampos = () => {
    const errs = [];
    const n = nombre.trim();
    const d = direccion.trim();
    const t = telefono.trim();
    if (!n) errs.push("El nombre del conjunto es obligatorio.");
    else if (n.length < 3) errs.push("El nombre debe tener al menos 3 caracteres.");
    else if (n.length > 100) errs.push("El nombre no puede superar 100 caracteres.");
    if (!d) errs.push("La dirección es obligatoria.");
    else if (d.length < 3 || d.length > 150) errs.push("La dirección debe tener entre 3 y 150 caracteres.");
    if (!t) errs.push("El teléfono es obligatorio.");
    else if (!/^\d+$/.test(t)) errs.push("El teléfono solo debe contener números.");
    else if (t.length < 7 || t.length > 10) errs.push("El teléfono debe tener entre 7 y 10 dígitos.");
    if (!departamentoId) errs.push("Escoger un departamento es obligatorio.");
    if (!ciudadId) errs.push("Debes seleccionar una ciudad.");
    if (!administradorId) errs.push("Debes seleccionar un administrador.");
    return errs;
  };

  const isValid = useMemo(() => validarCampos().length === 0, [nombre, direccion, telefono, departamentoId, ciudadId, administradorId]);

  // Revalidar en cambios si ya se mostraron errores
  useEffect(() => {
    if (localErrors.length) {
      setLocalErrors(validarCampos());
    }
  }, [nombre, direccion, telefono, departamentoId, ciudadId, administradorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errsLocales = validarCampos();
    if (errsLocales.length) {
      setLocalErrors(errsLocales);
      setBackendErrors([]);
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
      setLocalErrors([]);
      setBackendErrors([]);
    } catch (e) {
      const code = e?.code || e?.body?.code || e?.body?.errorCode || e?.body?.key;
      const rawMsg = e?.body?.clientMessage || e?.body?.client_message || e?.message || "No se pudo guardar.";
      const mapping = {
        "domain.conjunto.nombre.duplicated": "Ya existe un conjunto residencial registrado con ese nombre en la ciudad.",
        "domain.conjunto.telefono.duplicated": "Ya existe un conjunto residencial registrado con ese teléfono.",
        "domain.data.integrity": "Los datos ingresados no son válidos o faltan referencias requeridas.",
        "domain.general.error": "Ocurrió un error inesperado. Intenta nuevamente.",
        "validation.required.nombre": "El nombre del conjunto es obligatorio.",
        "validation.required.telefono": "El teléfono es obligatorio.",
        "validation.required.ciudad": "Debes seleccionar una ciudad.",
        "validation.required.administrador": "Debes seleccionar un administrador.",
        "validation.format.telefono": "El teléfono solo debe contener números.",
        "validation.length.telefono": "El teléfono debe tener entre 7 y 10 dígitos.",
        "validation.maxlength.telefono": "El teléfono no puede tener más de 10 dígitos.",
        "validation.minlength.nombre": "El nombre debe tener al menos 3 caracteres.",
        "validation.size.nombre": "El nombre debe tener entre 3 y 100 caracteres.",
        "validation.required.direccion": "La dirección es obligatoria.",
        "validation.size.direccion": "La dirección debe tener entre 3 y 150 caracteres.",
        "validation.required.uuid": "Debes seleccionar ciudad y administrador antes de continuar.",
        "validation.general": "Hay errores en la información enviada.",
      };
      const finalMsg = mapping[code] || rawMsg;
      setBackendErrors([finalMsg]);
    }
  };

  return (
    <form className="conjunto-form-card" onSubmit={handleSubmit}>
      {catalogsError && <p style={{ color: "#c0392b", marginBottom: 8 }}>
        Error cargando departamentos / ciudades
      </p>}
      {!catalogsError && loading && <p style={{ marginBottom: 8 }}>Cargando catálogos...</p>}
      {(localErrors.length + backendErrors.length > 0) && !catalogsError && (
        <ul className="conjunto-form-errors">
          {localErrors.map((e,i) => <li key={"le"+i}>{e}</li>)}
          {backendErrors.map((e,i) => <li key={"be"+i}>{e}</li>)}
        </ul>
      )}

      <div className="conjunto-form-grid">
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
      </div>

      <div className="conjunto-form-actions">
        <button type="submit">Guardar</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}
