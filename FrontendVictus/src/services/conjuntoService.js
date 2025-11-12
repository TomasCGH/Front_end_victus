const API_BASE = "http://localhost:8081/uco-challenge/api/v1/conjuntos";

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
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
  const url = `${API_BASE}?${params.toString()}`;
  const data = await safeFetch(url);
  const content = data?.content ?? data?.data ?? data?.items ?? data;
  const list = Array.isArray(content) ? content : [];
  return {
    items: list.map((x) => ({
      id: x.id ?? x.uuid ?? x.conjuntoId,
      nombre: x.nombre ?? x.name,
      direccion: x.direccion ?? x.address,
      telefono: x.telefono ?? x.phone,
      departamentoId: x.departamentoId ?? x.departamento_id,
      ciudadId: x.ciudadId ?? x.ciudad_id,
      departamentoNombre: x.departamentoNombre ?? x.departamento?.nombre,
      ciudadNombre: x.ciudadNombre ?? x.ciudad?.nombre,
    })),
    total: data?.totalElements ?? list.length,
    page: data?.number ?? page,
    size: data?.size ?? size,
  };
}

export async function createConjunto(payload) {
  const res = await safeFetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res?.data ?? res;
}

export async function updateConjunto(id, payload) {
  const res = await safeFetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res?.data ?? res;
}

export async function deleteConjunto(id) {
  await safeFetch(`${API_BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
  return { success: true };
}

export const ConjuntoService = { listConjuntos, createConjunto, updateConjunto, deleteConjunto };
