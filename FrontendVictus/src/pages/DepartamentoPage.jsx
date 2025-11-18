import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "../auth/ProtectedRoute";
import Header from "../components/Header";
import { fetchDepartamentos } from "../services/locationService";
import { normalizarDepartamento } from "../utils/normalizers";
import { Link } from "react-router-dom";

function DepartamentoPageInner() {
  const [departamentos, setDepartamentos] = useState([]);
  const [q, setQ] = useState("");
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const list = await fetchDepartamentos();
        if (mounted) setDepartamentos(list.map(normalizarDepartamento));
      } catch (_) {}
    };
    load();
    return () => { mounted = false; };
  }, []);

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return departamentos;
    return departamentos.filter(d => d.nombre.toLowerCase().includes(ql));
  }, [departamentos, q]);

  return (
    <>
      <Header />
      <div className="admin-management-container">
        <div style={{ display: "flex", gap: 8 }}>
          <Link className="ButtonBack" to="/dashboard">Regresar</Link>
        </div>
        <h2>Departamentos</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input placeholder="Buscar por nombre" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <ul>
          {list.map(d => (
            <li key={d.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ flex: 1 }}>{d.nombre}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default function DepartamentoPage() {
  return (
    <ProtectedRoute>
      <DepartamentoPageInner />
    </ProtectedRoute>
  );
}
