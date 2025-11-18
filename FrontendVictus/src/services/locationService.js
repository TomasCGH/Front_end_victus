// Bases del backend
// NOTA: Por requerimiento, departamentos/ciudades vienen de /api/v1 y
// conjuntos de /uco-challenge/api/v1
import { API } from "../config/api";
const API_BASE_LOCATION = API.v1;
const API_BASE_CONJUNTOS = API.v1; // Conjuntos también usan el mismo prefijo CRUD

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, { mode: 'cors', ...options });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`[locationService] ${url} error:`, err);
    throw err;
  }
}

export async function fetchDepartamentos() {
  const data = await safeFetch(`${API_BASE_LOCATION}/departamentos`);
  // Normalizamos a { id, nombre }
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return list.map((d) => ({ id: d.id ?? d.departamentoId ?? d.uuid ?? d.codigo, nombre: d.nombre ?? d.name ?? d.descripcion ?? "(Sin nombre)" }));
}

export async function fetchCiudades(departamentoId) {
  const query = departamentoId ? `?departamentoId=${encodeURIComponent(departamentoId)}` : "";
  const data = await safeFetch(`${API_BASE_LOCATION}/ciudades${query}`);
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return list.map((c) => ({ id: c.id ?? c.ciudadId ?? c.uuid ?? c.codigo, nombre: c.nombre ?? c.name ?? c.descripcion ?? "(Sin nombre)", departamentoId: c.departamentoId ?? c.departamento_id ?? c.deptoId }));
}

export const LocationService = { fetchDepartamentos, fetchCiudades };

// Diagnóstico básico del backend
export async function diagnosticarBackend() {
  console.group('[Diagnóstico backend]');
  let ok = true;
  const results = [];
  try {
    await safeFetch(`${API_BASE_LOCATION}/departamentos`);
    console.log('Departamentos OK ✔');
    results.push('Departamentos OK ✔');
  } catch (e) {
    ok = false; console.error('Departamentos ERROR ❌', e.message); results.push('Departamentos ERROR ❌');
  }
  try {
    await safeFetch(`${API_BASE_LOCATION}/ciudades`);
    console.log('Ciudades OK ✔');
    results.push('Ciudades OK ✔');
  } catch (e) {
    ok = false; console.error('Ciudades ERROR ❌', e.message); results.push('Ciudades ERROR ❌');
  }
  try {
    await safeFetch(`${API_BASE_CONJUNTOS}/conjuntos`);
    console.log('Conjuntos OK ✔');
    results.push('Conjuntos OK ✔');
  } catch (e) {
    ok = false; console.error('Conjuntos ERROR ❌', e.message); results.push('Conjuntos ERROR ❌');
  }
  if (ok) {
    console.log('Backend conectado ✔');
  } else {
    console.warn('Backend con incidencias ❌');
  }
  console.groupEnd();
  return { ok, results };
}
