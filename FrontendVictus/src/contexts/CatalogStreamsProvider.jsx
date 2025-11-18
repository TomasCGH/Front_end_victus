import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchDepartamentos, fetchCiudades } from '../services/locationService';
import { fetchAdministradores } from '../services/administradoresService';
import { listConjuntos } from '../services/conjuntoService';
// (Sin SSE) ya no necesitamos utilidades de inserción/eliminación reactivas
import { normalizarDepartamento, normalizarCiudad, normalizarConjunto, normalizarAdministrador } from '../utils/normalizers';

const CatalogStreamsContext = createContext(null);

export function CatalogStreamsProvider({ children }) {
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [conjuntos, setConjuntos] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const errorRef = useRef(error);
  useEffect(() => { errorRef.current = error; }, [error]);

  const unmountedRef = useRef(false);
  const hydrateInFlightRef = useRef(false);
  const hydratePromiseRef = useRef(null);

  const markRecovered = () => {
    if (error) setError(null);
    setLoading(false);
  };

  const hydrate = async (isRetry = false) => {
    setLoading(true);
    if (!isRetry) setError(null);
    try {
      const [depsRaw, citiesRaw, { items: conjuntosRaw }, adminsRaw] = await Promise.all([
        fetchDepartamentos(),
        fetchCiudades(),
        listConjuntos({ page: 0, size: 20 }),
        fetchAdministradores().catch(() => []),
      ]);
      setDepartamentos(depsRaw.map(normalizarDepartamento));
      setCiudades(citiesRaw.map(normalizarCiudad));
      setConjuntos(conjuntosRaw.map(normalizarConjunto));
      setAdministradores(adminsRaw);
      markRecovered();
    } catch (e) {
      // Fallo: limpiar listas y marcar error
      setDepartamentos([]);
      setCiudades([]);
      setConjuntos([]);
      setAdministradores([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const doHydrate = (isRetry = false) => {
    if (hydrateInFlightRef.current && hydratePromiseRef.current) return hydratePromiseRef.current;
    hydrateInFlightRef.current = true;
    const p = hydrate(isRetry).finally(() => {
      hydrateInFlightRef.current = false;
    });
    hydratePromiseRef.current = p;
    return p;
  };

  useEffect(() => {
    doHydrate(false);

    return () => {
      unmountedRef.current = true;
    };
  }, []);

  const value = useMemo(() => ({
    departamentos,
    ciudades,
    conjuntos,
    administradores,
    loading,
    error,
    refreshAll: hydrate,
  }), [departamentos, ciudades, conjuntos, administradores, loading, error]);

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
