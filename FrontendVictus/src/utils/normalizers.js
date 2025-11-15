// Normalizadores centralizados para entidades del dominio
// Evitan duplicación y garantizan nombres consistentes en toda la app

export function normalizarConjunto(raw = {}) {
  const id = raw.id ?? raw.conjuntoId ?? raw.uuid ?? raw.codigo;
  const departamentoId = raw.departamentoId ?? raw.departamento_id ?? raw.departamento?.id ?? raw.deptoId;
  const ciudadId = raw.ciudadId ?? raw.ciudad_id ?? raw.ciudad?.id;
  const nombreDepartamento = raw.nombreDepartamento ?? raw.departamentoNombre ?? raw.departamento?.nombre;
  const nombreCiudad = raw.nombreCiudad ?? raw.ciudadNombre ?? raw.ciudad?.nombre;
  return {
    id,
    nombre: raw.nombre ?? raw.name ?? raw.descripcion ?? "",
    direccion: raw.direccion ?? raw.address ?? "",
    telefono: raw.telefono ?? raw.phone ?? "",
    departamentoId: departamentoId ?? "",
    ciudadId: ciudadId ?? "",
    nombreDepartamento: nombreDepartamento ?? "",
    nombreCiudad: nombreCiudad ?? "",
  };
}

export function normalizarDepartamento(raw = {}) {
  const id = raw.id ?? raw.departamentoId ?? raw.uuid ?? raw.codigo;
  return {
    id,
    nombre: raw.nombre ?? raw.name ?? raw.descripcion ?? "",
  };
}

export function normalizarCiudad(raw = {}) {
  const id = raw.id ?? raw.ciudadId ?? raw.uuid ?? raw.codigo;
  const departamentoId = raw.departamentoId ?? raw.departamento_id ?? raw.deptoId ?? raw.departamento?.id;
  return {
    id,
    nombre: raw.nombre ?? raw.name ?? raw.descripcion ?? "",
    departamentoId: departamentoId ?? "",
  };
}

export default {
  normalizarConjunto,
  normalizarDepartamento,
  normalizarCiudad,
};
