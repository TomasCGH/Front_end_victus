// Servicio para catálogo de administradores (fetch inicial)
// Fuente local unificada: http://localhost:8081/api/v1

const API_BASE_ADMIN = "http://localhost:8081/api/v1";

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
  const cand = [];
  // Preferidos directos
  if (admin?.nombre) return String(admin.nombre).trim();
  if (admin?.fullName) return String(admin.fullName).trim();
  // name + lastName
  if (admin?.name || admin?.lastName) cand.push(admin?.name, admin?.lastName);
  // variantes en español snake_case
  cand.push(admin?.primer_nombre, admin?.segundo_nombre, admin?.primer_apellido, admin?.segundo_apellido);
  // variantes camelCase
  cand.push(admin?.primerNombre, admin?.segundoNombre, admin?.primerApellido, admin?.segundoApellido);
  // variantes en inglés
  cand.push(admin?.firstName, admin?.middleName, admin?.lastName, admin?.secondLastName);
  const joined = cand.filter(Boolean).map(String).join(' ').trim();
  const compact = joined.replace(/\s+/g, ' ').trim();
  return compact || '';
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

export const AdministradoresService = { fetchAdministradores };
