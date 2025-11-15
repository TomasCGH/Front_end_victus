// SSE para Ciudades con reconexión y callbacks tipados

const STREAM_URL = "http://localhost:8081/api/v1/ciudades/stream";

function createSSEWithReconnect(url, { onOpen, onMessage, onError, initialDelay = 500, maxDelay = 4000, maxAttempts = 8 }) {
  let es = null;
  let closed = false;
  let retryDelay = initialDelay;
  let attempts = 0;
  let retryTimer = null;

  const open = () => {
    if (closed) return;
    es = new EventSource(url);
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

export function subscribeToCiudadesStream({ onCreated, onUpdated, onDeleted, onError, onOpen } = {}) {
  return createSSEWithReconnect(STREAM_URL, {
    onOpen,
    onMessage: (event) => {
      if (!event?.data) return;
      try {
        const data = JSON.parse(event.data);
        const tipo = data?.tipo;
        const payload = data?.payload ?? data?.ciudad ?? data;
        if (!tipo || !payload) return;
        if (tipo === 'CREATED') onCreated?.(payload);
        else if (tipo === 'UPDATED') onUpdated?.(payload);
        else if (tipo === 'DELETED') onDeleted?.(payload);
      } catch (e) { onError?.(e); }
    },
    onError,
  });
}

export const CiudadesStreamService = { subscribeToCiudadesStream };
