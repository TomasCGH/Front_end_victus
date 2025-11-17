import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  ViviendaService,
} from "../services/viviendaService";

export const ViviendaContext = createContext();

export function ViviendaProviderWrapper({ children }) {
  const [viviendas, setViviendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResponse = async (response) => {
    // Mantengo el helper por compatibilidad con posibles usos futuros
    if (!response.ok) {
      const message = `Solicitud fallida con estado ${response.status}`;
      throw new Error(message);
    }
    return response.json();
  };

  const getViviendas = useCallback(async () => {
    setLoading(true);
    try {
      const list = await ViviendaService.listAllViviendas();
      setViviendas(Array.isArray(list) ? list : []);
      setError(null);
    } catch (err) {
      console.error("Error al cargar viviendas:", err);
      setError("No se pudo cargar la lista de viviendas. Intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createVivienda = useCallback(
    async (payload) => {
      setLoading(true);
      try {
        const conjuntoId = payload?.conjuntoId;
        const data = await ViviendaService.createViviendaForConjunto(conjuntoId, payload);
        const created = data ?? payload;
        setViviendas((prev) => [...prev, created]);
        setError(null);
        return { success: true, data: created };
      } catch (err) {
        console.error("Error al crear vivienda:", err);
        setError("No se pudo crear la vivienda. Verifica la información e intenta nuevamente.");
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateVivienda = useCallback(async (id, payload) => {
    setLoading(true);
    try {
      const data = await ViviendaService.updateVivienda(id, payload);
      const updated = data ?? { ...payload, id };
      setViviendas((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
      setError(null);
      return { success: true, data: updated };
    } catch (err) {
      console.error("Error al actualizar vivienda:", err);
      setError("No se pudo actualizar la vivienda. Intenta nuevamente.");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVivienda = useCallback(async (id) => {
    setLoading(true);
    try {
      await ViviendaService.deleteVivienda(id);
      setViviendas((prev) => prev.filter((item) => item.id !== id));
      setError(null);
      return { success: true };
    } catch (err) {
      console.error("Error al eliminar vivienda:", err);
      setError("No se pudo eliminar la vivienda. Intenta nuevamente.");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getViviendas();
  }, [getViviendas]);

  const value = useMemo(
    () => ({
      viviendas,
      loading,
      error,
      getViviendas,
      createVivienda,
      updateVivienda,
      deleteVivienda,
      setViviendas,
    }),
    [viviendas, loading, error, getViviendas, createVivienda, updateVivienda, deleteVivienda]
  );

  return <ViviendaContext.Provider value={value}>{children}</ViviendaContext.Provider>;
}
