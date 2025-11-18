// Servicio SSE para conjuntos residenciales con reconexión y callbacks tipados
// Reacciona a eventos: CREATED / UPDATED / DELETED
import { API } from "../config/api";

const STREAM_URL = `${API.streamChallenge}/conjuntos/stream`;

function createSSEWithReconnect(
  url,
  { onOpen, onMessage, onError, onSetup, initialDelay = 500, maxDelay = 4000, maxAttempts = 8 }
) {
  let es = null;
  let closed = false;
  let retryDelay = initialDelay;
  let attempts = 0;
  let retryTimer = null;

  const open = () => {
    if (closed) return;
    es = new EventSource(url, { withCredentials: false });
    onSetup?.(es);
    es.onopen = () => {
      attempts = 0;
      retryDelay = initialDelay; // reset backoff
      console.info(`[SSE] Conectado: ${url}`);
      onOpen?.();
    };
    es.onmessage = (evt) => {
      onMessage?.(evt);
    };
    es.onerror = (err) => {
      try { es?.close(); } catch (_) {}
      onError?.(err);
      if (closed) return;
      if (attempts >= maxAttempts) {
        console.error(`[SSE] Máximo de reintentos alcanzado (${maxAttempts}) para ${url}. Deteniendo reconexión.`);
        return;
      }
      attempts += 1;
      console.warn(`[SSE] Error. Reintentando #${attempts} en ${retryDelay}ms: ${url}`);
      clearTimeout(retryTimer);
      retryTimer = setTimeout(open, retryDelay);
      retryDelay = Math.min(retryDelay * 2, maxDelay);
    };
  };

  open();

  return () => {
    closed = true;
    clearTimeout(retryTimer);
    try { es?.close(); } catch (_) {}
  };
}

export function subscribeToConjuntosStream({ onCreated, onUpdated, onDeleted, onError, onOpen } = {}) {
  const dispatchEnvelope = (envelope) => {
    try {
      if (!envelope) return;
      const tipo = envelope?.tipo ?? envelope?.type;
      const payloadContainer = envelope?.payload ?? envelope?.data ?? envelope;
      const dto = payloadContainer?.data ?? payloadContainer?.payload ?? payloadContainer;
      if (!tipo || !dto) return;
      if (tipo === 'CREATED') onCreated?.(dto);
      else if (tipo === 'UPDATED') onUpdated?.(dto);
      else if (tipo === 'DELETED') onDeleted?.(dto);
    } catch (e) {
      onError?.(e);
    }
  };

  const normalizePayload = (data) => ({
    ...data,
    payload: data?.payload ?? data?.data ?? data?.conjunto ?? data,
  });

  const handleNominal = (tipo) => (event) => {
    if (!event?.data) return;
    try {
      const parsed = JSON.parse(event.data);
      const normalizedPayload = parsed?.payload ?? parsed?.data ?? parsed?.conjunto ?? parsed;
      dispatchEnvelope({ tipo, payload: normalizedPayload });
    } catch (e) {
      onError?.(e);
    }
  };

  const cleanup = createSSEWithReconnect(STREAM_URL, {
    onOpen,
    onMessage: (event) => {
      if (!event?.data) return;
      try {
        const data = normalizePayload(JSON.parse(event.data));
        dispatchEnvelope(data);
      } catch (e) {
        onError?.(e);
      }
    },
    onError: (err) => {
      onError?.(err);
    },
    onSetup: (es) => {
      es.addEventListener('CREATED', handleNominal('CREATED'));
      es.addEventListener('UPDATED', handleNominal('UPDATED'));
      es.addEventListener('DELETED', handleNominal('DELETED'));
      es.addEventListener('heartbeat', () => {});
    },
  });

  return cleanup; // para usar en useEffect cleanup
}

export const ConjuntoStreamService = { subscribeToConjuntosStream };