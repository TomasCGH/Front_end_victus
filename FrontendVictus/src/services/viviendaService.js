// Base raíz del backend unificada
import { API } from "../config/api";
const API_BASE = API.challenge;

async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, { mode: 'cors', ...options });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`[viviendaService] ${url} error:`, err);
    throw err;
  }
}

// NOTA: Ajusta estos endpoints si tu backend expone rutas diferentes.
export async function listViviendasByConjunto(conjuntoId, { q = "" } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  const url = `${API_BASE}/conjuntos/${encodeURIComponent(conjuntoId)}/viviendas?${params.toString()}`;
  const data = await safeFetch(url);
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
  return list.map((x) => ({
    id: x.id ?? x.viviendaId ?? x.uuid,
    numero: x.numero ?? x.propertyNumber,
    tipo: x.tipo ?? x.propertyType,
    estado: x.estado ?? x.status,
  }));
}

export async function createViviendaForConjunto(conjuntoId, payload) {
  const url = `${API_BASE}/conjuntos/${encodeURIComponent(conjuntoId)}/viviendas`;
  const res = await safeFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res?.data ?? res;
}

export const ViviendaService = { listViviendasByConjunto, createViviendaForConjunto };
