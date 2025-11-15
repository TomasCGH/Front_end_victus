// Servicio SSE para conjuntos residenciales con reconexión y callbacks tipados
// Reacciona a eventos: CREATED / UPDATED / DELETED

const STREAM_URL = "http://localhost:8081/uco-challenge/api/v1/conjuntos/stream";

function createSSEWithReconnect(url, { onOpen, onMessage, onError, initialDelay = 500, maxDelay = 4000, maxAttempts = 8 }) {
  let es = null;
  let closed = false;
  let retryDelay = initialDelay;
  let attempts = 0;
  let retryTimer = null;

  const open = () => {
    if (closed) return;
    es = new EventSource(url);
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
  const cleanup = createSSEWithReconnect(STREAM_URL, {
    onOpen,
    onMessage: (event) => {
      if (!event?.data) return;
      try {
        const data = JSON.parse(event.data);
        const tipo = data?.tipo;
        const payload = data?.payload ?? data?.conjunto ?? data;
        if (!tipo || !payload) return;
        if (tipo === 'CREATED') onCreated?.(payload);
        else if (tipo === 'UPDATED') onUpdated?.(payload);
        else if (tipo === 'DELETED') onDeleted?.(payload);
      } catch (e) {
        // Evitar spam de logs; delegar al onError de cliente
        onError?.(e);
      }
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  return cleanup; // para usar en useEffect cleanup
}

export const ConjuntoStreamService = { subscribeToConjuntosStream };