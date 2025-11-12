const API_BASE = "http://localhost:8081";

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
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
  const data = await safeFetch(`${API_BASE}/api/v1/departamentos`);
  // Normalizamos a { id, nombre }
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return list.map((d) => ({ id: d.id ?? d.departamentoId ?? d.uuid ?? d.codigo, nombre: d.nombre ?? d.name ?? d.descripcion ?? "(Sin nombre)" }));
}

export async function fetchCiudades(departamentoId) {
  const query = departamentoId ? `?departamentoId=${encodeURIComponent(departamentoId)}` : "";
  const data = await safeFetch(`${API_BASE}/api/v1/ciudades${query}`);
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return list.map((c) => ({ id: c.id ?? c.ciudadId ?? c.uuid ?? c.codigo, nombre: c.nombre ?? c.name ?? c.descripcion ?? "(Sin nombre)", departamentoId: c.departamentoId ?? c.departamento_id ?? c.deptoId }));
}

export const LocationService = { fetchDepartamentos, fetchCiudades };
