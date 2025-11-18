// SSE para Viviendas por Conjunto (endpoint parametrizado por id de conjunto)
// GET /uco-challenge/api/v1/conjuntos/{id}/viviendas/stream
import { API } from "../config/api";

const BASE = API.streamV1; // Ajustado al prefijo de streams

function createSSEWithReconnect(url, { onOpen, onMessage, onError, initialDelay = 500, maxDelay = 4000, maxAttempts = 8 }) {
  let es = null, closed = false, retryDelay = initialDelay, attempts = 0, retryTimer = null;
  const open = () => {
    if (closed) return;
    es = new EventSource(url, { withCredentials: false });
    es.onopen = () => { attempts = 0; retryDelay = initialDelay; console.info(`[SSE] Conectado: ${url}`); onOpen?.(); };
    es.onmessage = (evt) => onMessage?.(evt);
    es.onerror = (err) => {
      try { es?.close(); } catch (_) {}
      onError?.(err);
      if (closed) return;
      if (attempts >= maxAttempts) { console.error(`[SSE] Máximo de reintentos alcanzado (${maxAttempts}) para ${url}. Deteniendo reconexión.`); return; }
      attempts += 1;
      console.warn(`[SSE] Error. Reintentando #${attempts} en ${retryDelay}ms: ${url}`);
      clearTimeout(retryTimer);
      retryTimer = setTimeout(open, retryDelay);
      retryDelay = Math.min(retryDelay * 2, maxDelay);
    };
  };
  open();
  return () => { closed = true; clearTimeout(retryTimer); try { es?.close(); } catch (_) {} };
}

export function subscribeToViviendasStream(conjuntoId, { onCreated, onUpdated, onDeleted, onError, onOpen } = {}) {
  if (!conjuntoId) throw new Error("subscribeToViviendasStream requiere conjuntoId");
  const url = `${BASE}/conjuntos/${encodeURIComponent(conjuntoId)}/viviendas/stream`;
  return createSSEWithReconnect(url, {
    onOpen,
    onMessage: (event) => {
      if (!event?.data) return;
      try {
        const data = JSON.parse(event.data);
        const tipo = data?.tipo;
        const payload = data?.payload ?? data?.vivienda ?? data;
        if (!tipo || !payload) return;
        if (tipo === 'CREATED') onCreated?.(payload);
        else if (tipo === 'UPDATED') onUpdated?.(payload);
        else if (tipo === 'DELETED') onDeleted?.(payload);
      } catch (e) { onError?.(e); }
    },
    onError,
  });
}

export const ViviendasStreamService = { subscribeToViviendasStream };
