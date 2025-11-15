import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../auth/ProtectedRoute";
import Header from "../components/Header";
import { fetchCiudades, fetchDepartamentos } from "../services/locationService";
import { subscribeToCiudadesStream } from "../services/ciudadesStreamService";
import { normalizarCiudad, normalizarDepartamento } from "../utils/normalizers";
import { Link } from "react-router-dom";

function CiudadPageInner() {
  const [ciudades, setCiudades] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentoId, setDepartamentoId] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [deps, cities] = await Promise.all([fetchDepartamentos(), fetchCiudades()]);
        if (!mounted) return;
        setDepartamentos(deps.map(normalizarDepartamento));
        setCiudades(cities.map(normalizarCiudad));
      } catch (_) {}
    };
    load();
    const cleanup = subscribeToCiudadesStream({
      onCreated: (raw) => setCiudades(prev => {
        const c = normalizarCiudad(raw);
        if (!c?.id || prev.some(p => String(p.id) === String(c.id))) return prev;
        return [...prev, c];
      }),
      onUpdated: (raw) => setCiudades(prev => {
        const c = normalizarCiudad(raw);
        return prev.map(p => String(p.id) === String(c.id) ? c : p);
      }),
      onDeleted: (raw) => setCiudades(prev => {
        const c = normalizarCiudad(raw);
        return prev.filter(p => String(p.id) !== String(c.id));
      }),
    });
    return () => { mounted = false; cleanup(); };
  }, []);

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return ciudades.filter(c =>
      (!departamentoId || String(c.departamentoId) === String(departamentoId)) &&
      (!ql || c.nombre.toLowerCase().includes(ql))
    );
  }, [ciudades, departamentoId, q]);

  return (
    <>
      <Header />
      <div className="admin-management-container">
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="ButtonBack" to="/dashboard">Regresar</Link>
        </div>
        <h2>Ciudades (SSE)</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <select value={departamentoId} onChange={(e) => setDepartamentoId(e.target.value)}>
            <option value="">Todos los departamentos</option>
            {departamentos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
          <input placeholder="Buscar por nombre" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <ul>
          {list.map(c => (
            <li key={c.id}>{c.nombre}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default function CiudadPage() {
  return (
    <ProtectedRoute>
      <CiudadPageInner />
    </ProtectedRoute>
  );
}
