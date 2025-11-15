// Base raíz del backend
const API_BASE = "http://localhost:8081/uco-challenge/api/v1";

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, { mode: 'cors', ...options });
    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}`;
      let errorBody = null;
      try {
        errorBody = await res.json();
        const msg = errorBody?.message || errorBody?.error || errorBody?.detail || errorBody?.msg;
        if (msg) errorMessage = msg;
      } catch (_) {
        const text = await res.text().catch(() => "");
        if (text) errorMessage = text;
      }
      const err = new Error(errorMessage || `HTTP ${res.status}`);
      err.status = res.status;
      err.body = errorBody;
      throw err;
    }
    return await res.json();
  } catch (err) {
    console.error(`[conjuntoService] ${url} error:`, err);
    throw err;
  }
}

export async function listConjuntos({ nombre = "", departamentoId = "", ciudadId = "", page = 0, size = 50 } = {}) {
  const params = new URLSearchParams();
  if (nombre) params.set("nombre", nombre);
  if (departamentoId) params.set("departamentoId", departamentoId);
  if (ciudadId) params.set("ciudadId", ciudadId);
  if (page != null) params.set("page", String(page));
  if (size != null) params.set("size", String(size));
  const url = `${API_BASE}/conjuntos?${params.toString()}`;
  const data = await safeFetch(url);
  const content = data?.content ?? data?.data ?? data?.items ?? data;
  const list = Array.isArray(content) ? content : [];
  return {
    items: list.map((x) => ({
      id: x.id ?? x.uuid ?? x.conjuntoId,
      nombre: x.nombre ?? x.name,
      direccion: x.direccion ?? x.address,
      telefono: x.telefono ?? x.phone,
      departamentoId: x.departamentoId ?? x.departamento_id ?? x.departamento?.id,
      ciudadId: x.ciudadId ?? x.ciudad_id ?? x.ciudad?.id,
      administradorId: x.administradorId ?? x.adminId ?? x.administrador?.id ?? x.usuarioAdministradorId,
      // Preferimos campos de nombre explícitos si vienen del backend
      departamentoNombre: x.nombreDepartamento ?? x.departamentoNombre ?? x.departamento?.nombre,
      ciudadNombre: x.nombreCiudad ?? x.ciudadNombre ?? x.ciudad?.nombre,
      administradorNombre: x.administradorNombre ?? x.adminNombre ?? x.administrador?.nombre ?? x.administrador?.name,
      // Preservamos objetos embebidos si existen para futuras mejoras
      departamento: x.departamento?.id || x.departamento?.nombre ? x.departamento : undefined,
      ciudad: x.ciudad?.id || x.ciudad?.nombre ? x.ciudad : undefined,
    })),
    total: data?.totalElements ?? list.length,
    page: data?.number ?? page,
    size: data?.size ?? size,
  };
}

export async function createConjunto(payload) {
  // Asegurar campos saneados y presentes según validaciones del backend
  const body = {
    nombre: String(payload?.nombre ?? "").trim(),
    direccion: String(payload?.direccion ?? "").trim(),
    telefono: String(payload?.telefono ?? "").trim(),
    departamentoId: payload?.departamentoId,
    ciudadId: payload?.ciudadId,
    administradorId: payload?.administradorId,
  };
  const res = await safeFetch(`${API_BASE}/conjuntos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res?.data ?? res;
}

export async function updateConjunto(id, payload) {
  const body = {
    nombre: String(payload?.nombre ?? "").trim(),
    direccion: String(payload?.direccion ?? "").trim(),
    telefono: String(payload?.telefono ?? "").trim(),
    departamentoId: payload?.departamentoId,
    ciudadId: payload?.ciudadId,
    administradorId: payload?.administradorId,
  };
  const res = await safeFetch(`${API_BASE}/conjuntos/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res?.data ?? res;
}

export async function deleteConjunto(id) {
  await safeFetch(`${API_BASE}/conjuntos/${encodeURIComponent(id)}`, { method: "DELETE" });
  return { success: true };
}

export const ConjuntoService = { listConjuntos, createConjunto, updateConjunto, deleteConjunto };
