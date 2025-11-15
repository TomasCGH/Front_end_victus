import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { connectSse } from '../services/sseClient';
import { fetchDepartamentos, fetchCiudades } from '../services/locationService';
import { listConjuntos } from '../services/conjuntoService';
import { upsertById, removeById } from '../utils/collection';
import { normalizarDepartamento, normalizarCiudad, normalizarConjunto } from '../utils/normalizers';

const CatalogStreamsContext = createContext(null);

const URLS = {
  departamentos: 'http://localhost:8081/api/v1/departamentos/stream',
  ciudades: 'http://localhost:8081/api/v1/ciudades/stream',
  conjuntos: 'http://localhost:8081/uco-challenge/api/v1/conjuntos/stream',
};

export function CatalogStreamsProvider({ children }) {
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [conjuntos, setConjuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const esRefs = useRef({});

  const hydrate = async () => {
    setLoading(true);
    setError(null);
    try {
      const [depsRaw, citiesRaw, { items: conjuntosRaw }] = await Promise.all([
        fetchDepartamentos(),
        fetchCiudades(),
        listConjuntos({ page: 0, size: 200 }),
      ]);
      setDepartamentos(depsRaw.map(normalizarDepartamento));
      setCiudades(citiesRaw.map(normalizarCiudad));
      setConjuntos(conjuntosRaw.map(normalizarConjunto));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrate();

    // Departamentos SSE
    esRefs.current.deps = connectSse(URLS.departamentos, {
      onCreated: (dto) => setDepartamentos((prev) => upsertById(prev, normalizarDepartamento(dto))),
      onUpdated: (dto) => setDepartamentos((prev) => upsertById(prev, normalizarDepartamento(dto))),
      onDeleted: (dto) => {
        setDepartamentos((prev) => removeById(prev, dto.id ?? dto.departamentoId ?? dto.uuid));
        // Cascada: remover conjuntos asociados al departamento
        const depId = String(dto.id ?? dto.departamentoId ?? dto.uuid);
        setConjuntos((prev) => prev.filter((c) => String(c.departamentoId) !== depId));
      },
      onError: () => {},
    });

    // Ciudades SSE
    esRefs.current.cities = connectSse(URLS.ciudades, {
      onCreated: (dto) => setCiudades((prev) => upsertById(prev, normalizarCiudad(dto))),
      onUpdated: (dto) => setCiudades((prev) => upsertById(prev, normalizarCiudad(dto))),
      onDeleted: (dto) => {
        setCiudades((prev) => removeById(prev, dto.id ?? dto.ciudadId ?? dto.uuid));
        const ciudadId = String(dto.id ?? dto.ciudadId ?? dto.uuid);
        setConjuntos((prev) => prev.filter((c) => String(c.ciudadId) !== ciudadId));
      },
      onError: () => {},
    });

    // Conjuntos SSE
    esRefs.current.conjuntos = connectSse(URLS.conjuntos, {
      onCreated: (dto) => setConjuntos((prev) => upsertById(prev, normalizarConjunto(dto))),
      onUpdated: (dto) => setConjuntos((prev) => upsertById(prev, normalizarConjunto(dto))),
      onDeleted: (dto) => setConjuntos((prev) => removeById(prev, dto.id ?? dto.conjuntoId ?? dto.uuid)),
      onError: () => {},
    });

    return () => {
      Object.values(esRefs.current).forEach((es) => {
        try { es?.close?.(); } catch (_) {}
      });
      esRefs.current = {};
    };
  }, []);

  const value = useMemo(() => ({
    departamentos,
    ciudades,
    conjuntos,
    loading,
    error,
    refreshAll: hydrate,
  }), [departamentos, ciudades, conjuntos, loading, error]);

  return (
    <CatalogStreamsContext.Provider value={value}>
      {children}
    </CatalogStreamsContext.Provider>
  );
}

export function useCatalogStreamsContext() {
  const ctx = useContext(CatalogStreamsContext);
  if (!ctx) throw new Error('useCatalogStreamsContext debe usarse dentro de CatalogStreamsProvider');
  return ctx;
}
