// Servicio para catálogo de administradores (fetch inicial)
import { API } from "../config/api";

const API_BASE_ADMIN = API.v1; // Ya apunta al prefijo CRUD correcto

async function safeFetch(url, options = {}) {
  const res = await fetch(url, { mode: 'cors', ...options });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message || body?.error || message;
    } catch (_) {
      // noop
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function buildNombre(admin) {
  // Preferidos directos
  if (admin?.nombre) return String(admin.nombre).trim();
  if (admin?.fullName) return String(admin.fullName).trim();
  if (admin?.displayName) return String(admin.displayName).trim();

  // Componer a partir de posibles campos
  const parts = [
    // español comunes
    admin?.nombres,
    admin?.apellidos,
    admin?.primer_nombre,
    admin?.segundo_nombre,
    admin?.primer_apellido,
    admin?.segundo_apellido,
    // camelCase
    admin?.primerNombre,
    admin?.segundoNombre,
    admin?.primerApellido,
    admin?.segundoApellido,
    // inglés
    admin?.name,
    admin?.lastName,
    admin?.firstName,
    admin?.middleName,
    admin?.secondLastName,
    admin?.givenName,
    admin?.familyName,
  ];
  const joined = parts.filter(Boolean).map(String).join(' ').trim();
  const compact = joined.replace(/\s+/g, ' ').trim();
  if (compact) return compact;

  // Fallback: derivar del email si existe
  const email = String(admin?.email || '').trim();
  if (email) {
    const local = email.split('@')[0] || '';
    if (local) {
      const pretty = local
        .replace(/[._-]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
        .join(' ')
        .trim();
      if (pretty) return pretty;
    }
  }
  return '';
}

export async function fetchAdministradores() {
  // Se espera endpoint local: /api/v1/administradores (o /administradores/todos).
  // Preferimos /administradores; si el backend ofrece /todos, puede ajustarse aquí.
  const data = await safeFetch(`${API_BASE_ADMIN}/administradores`);
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return list.map(a => ({
    id: a.id ?? a.adminId ?? a.uuid ?? a.codigo,
    nombre: buildNombre(a) || '(Sin nombre)',
    email: a.email || '',
  }));
}

export async function createAdministrador(payload) {
  const res = await safeFetch(`${API_BASE_ADMIN}/administradores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res?.data ?? res;
}

export async function updateAdministrador(id, payload) {
  const res = await safeFetch(`${API_BASE_ADMIN}/administradores/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res?.data ?? res;
}

export async function deleteAdministrador(id) {
  await safeFetch(`${API_BASE_ADMIN}/administradores/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return { success: true };
}

export async function findAdministradoresByName(name) {
  const list = await fetchAdministradores();
  const q = String(name || '').toLowerCase();
  return list.filter(a => (a.nombre || '').toLowerCase().includes(q));
}

export const AdministradoresService = {
  fetchAdministradores,
  createAdministrador,
  updateAdministrador,
  deleteAdministrador,
  findAdministradoresByName,
};
