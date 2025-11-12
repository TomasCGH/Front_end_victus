import { createContext, useCallback, useEffect, useMemo, useState } from "react";

const API_BASE_URL = "https://victus-api-9g73.onrender.com/victusresidenciasEasy/api/v1";

export const ViviendaContext = createContext();

export function ViviendaProviderWrapper({ children }) {
  const [viviendas, setViviendas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleResponse = async (response) => {
    if (!response.ok) {
      const message = `Solicitud fallida con estado ${response.status}`;
      throw new Error(message);
    }
    return response.json();
  };

  const getViviendas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/viviendas/todos`);
      const data = await handleResponse(response);
      setViviendas(Array.isArray(data?.data) ? data.data : []);
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
        const response = await fetch(`${API_BASE_URL}/viviendas/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await handleResponse(response);
        const created = data?.data ?? payload;
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
      const response = await fetch(`${API_BASE_URL}/viviendas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await handleResponse(response);
      const updated = data?.data ?? { ...payload, id };
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
      const response = await fetch(`${API_BASE_URL}/viviendas/${id}`, {
        method: "DELETE",
      });

      await handleResponse(response);
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
