import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { connectSse } from '../services/sseClient';
import { fetchDepartamentos, fetchCiudades } from '../services/locationService';
import { fetchAdministradores } from '../services/administradoresService';
import { listConjuntos } from '../services/conjuntoService';
import { upsertById, removeById } from '../utils/collection';
import { normalizarDepartamento, normalizarCiudad, normalizarConjunto, normalizarAdministrador } from '../utils/normalizers';
import { API } from '../config/api';

const CatalogStreamsContext = createContext(null);

const URLS = {
  departamentos: `${API.streamV1}/departamentos/stream`,
  ciudades: `${API.streamV1}/ciudades/stream`,
  conjuntos: `${API.streamV1}/conjuntos/stream`,
  administradores: `${API.streamV1}/administradores/stream`,
};

export function CatalogStreamsProvider({ children }) {
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [conjuntos, setConjuntos] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const errorRef = useRef(error);
  useEffect(() => { errorRef.current = error; }, [error]);

  const esRefs = useRef({});
  const retryTimeoutRef = useRef(null); // Controla reintentos
  const unmountedRef = useRef(false); // Evita acciones tras unmount
  const sseRecoveryLockRef = useRef(false); // Evita múltiples hydrate(true) simultáneos por reconexión SSE
  const hydrateInFlightRef = useRef(false); // Evita múltiples hidrataciones concurrentes
  const hydratePromiseRef = useRef(null); // Comparte la misma promesa si ya está en vuelo

  const closeAllSse = () => {
    Object.keys(esRefs.current).forEach((k) => {
      try { esRefs.current[k]?.close?.(); } catch (_) {}
      esRefs.current[k] = null;
    });
  };

  const onSseOpen = () => {
    // Al abrir SSE: cancelar reintentos y ejecutar hydrate(true) exactamente una vez
    clearRetry();
    if (!error) return; // solo recuperar si seguimos en error
    if (sseRecoveryLockRef.current) return;
    sseRecoveryLockRef.current = true;
    doHydrate(true).finally(() => { sseRecoveryLockRef.current = false; });
  };

  const openAllSse = () => {
    // Departamentos SSE
    esRefs.current.deps = connectSse(URLS.departamentos, {
      onCreated: (dto) => {
        if (errorRef.current) return;
        setDepartamentos((prev) => upsertById(prev, normalizarDepartamento(dto)));
      },
      onUpdated: (dto) => {
        if (errorRef.current) return;
        setDepartamentos((prev) => upsertById(prev, normalizarDepartamento(dto)));
      },
      onDeleted: (dto) => {
        if (errorRef.current) return;
        setDepartamentos((prev) => removeById(prev, dto.id ?? dto.departamentoId ?? dto.uuid));
        const depId = String(dto.id ?? dto.departamentoId ?? dto.uuid);
        setConjuntos((prev) => prev.filter((c) => String(c.departamentoId) !== depId));
      },
      onError: () => {
        setError(true);
        setDepartamentos([]);
        setCiudades([]);
        setConjuntos([]);
        closeAllSse();
        scheduleRetry();
      },
      onDisconnect: () => {
        setError(true);
        setDepartamentos([]);
        setCiudades([]);
        setConjuntos([]);
        closeAllSse();
        scheduleRetry();
      },
      onOpen: onSseOpen,
    });

    // Ciudades SSE
    esRefs.current.cities = connectSse(URLS.ciudades, {
      onCreated: (dto) => {
        if (errorRef.current) return;
        setCiudades((prev) => upsertById(prev, normalizarCiudad(dto)));
      },
      onUpdated: (dto) => {
        if (errorRef.current) return;
        setCiudades((prev) => upsertById(prev, normalizarCiudad(dto)));
      },
      onDeleted: (dto) => {
        if (errorRef.current) return;
        setCiudades((prev) => removeById(prev, dto.id ?? dto.ciudadId ?? dto.uuid));
        const ciudadId = String(dto.id ?? dto.ciudadId ?? dto.uuid);
        setConjuntos((prev) => prev.filter((c) => String(c.ciudadId) !== ciudadId));
      },
      onError: () => {
        setError(true);
        setDepartamentos([]);
        setCiudades([]);
        setConjuntos([]);
        closeAllSse();
        scheduleRetry();
      },
      onDisconnect: () => {
        setError(true);
        setDepartamentos([]);
        setCiudades([]);
        setConjuntos([]);
        closeAllSse();
        scheduleRetry();
      },
      onOpen: onSseOpen,
    });

    // Conjuntos SSE
    esRefs.current.conjuntos = connectSse(URLS.conjuntos, {
      onCreated: (dto) => {
        if (errorRef.current) return;
        setConjuntos((prev) => upsertById(prev, normalizarConjunto(dto)));
      },
      onUpdated: (dto) => {
        if (errorRef.current) return;
        setConjuntos((prev) => upsertById(prev, normalizarConjunto(dto)));
      },
      onDeleted: (dto) => {
        if (errorRef.current) return;
        setConjuntos((prev) => removeById(prev, dto.id ?? dto.conjuntoId ?? dto.uuid));
      },
      onError: () => {
        setError(true);
        setDepartamentos([]);
        setCiudades([]);
        setConjuntos([]);
        closeAllSse();
        scheduleRetry();
      },
      onDisconnect: () => {
        setError(true);
        setDepartamentos([]);
        setCiudades([]);
        setConjuntos([]);
        closeAllSse();
        scheduleRetry();
      },
      onOpen: onSseOpen,
    });

    // Administradores SSE
    esRefs.current.admins = connectSse(URLS.administradores, {
      onCreated: (dto) => {
        if (errorRef.current) return;
        setAdministradores((prev) => upsertById(prev, normalizarAdministrador(dto)));
      },
      onUpdated: (dto) => {
        if (errorRef.current) return;
        setAdministradores((prev) => upsertById(prev, normalizarAdministrador(dto)));
      },
      onDeleted: (dto) => {
        if (errorRef.current) return;
        setAdministradores((prev) => removeById(prev, dto.id ?? dto.administradorId ?? dto.adminId ?? dto.uuid));
      },
      onError: () => {
        setError(true);
        setDepartamentos([]);
        setCiudades([]);
        setConjuntos([]);
        setAdministradores([]);
        closeAllSse();
        scheduleRetry();
      },
      onDisconnect: () => {
        setError(true);
        setDepartamentos([]);
        setCiudades([]);
        setConjuntos([]);
        setAdministradores([]);
        closeAllSse();
        scheduleRetry();
      },
      onOpen: onSseOpen,
    });
  };

  const scheduleRetry = () => {
    if (unmountedRef.current) return;
    if (retryTimeoutRef.current) return;
    retryTimeoutRef.current = setTimeout(() => {
      retryTimeoutRef.current = null;
      if (unmountedRef.current) return;
      if (hydrateInFlightRef.current || sseRecoveryLockRef.current) {
        // Evitar superponer; reprogramar
        scheduleRetry();
        return;
      }
      doHydrate(true);
    }, 5000);
  };

  const clearRetry = () => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  };

  const markRecovered = () => {
    if (error) setError(null);
    setLoading(false);
    clearRetry();
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
      // Fallo: limpiar listas y marcar error, luego reintentar indefinidamente
      setDepartamentos([]);
      setCiudades([]);
      setConjuntos([]);
      setAdministradores([]);
      setError(true);
      scheduleRetry();
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
    openAllSse();

    return () => {
      unmountedRef.current = true;
      clearRetry();
      closeAllSse();
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
