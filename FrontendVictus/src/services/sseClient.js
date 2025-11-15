// Cliente SSE simple y reutilizable basado en EventSource con listeners por nombre de evento
// Eventos esperados: CREATED, UPDATED, DELETED
// data: JSON con forma { tipo, data } aunque se soporta payload/data como fallback

export function connectSse(url, { onCreated, onUpdated, onDeleted, onError, onOpen, onDisconnect } = {}) {
  let es = null;
  let closed = false;
  let reconnectTimer = null;
  let attempt = 0;
  const baseDelay = 1000; // 1s inicial
  const maxDelay = 5000; // tope 5s

  const clearReconnect = () => { if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; } };

  const nextDelay = () => Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

  const attach = () => {
    if (closed) return;
    es = new EventSource(url, { withCredentials: false });

    const parseAnd = (cb) => (e) => {
      try {
        const payload = JSON.parse(e.data);
        const dto = payload?.data ?? payload?.payload ?? payload;
        cb?.(dto);
      } catch (err) {
        onError?.(err);
      }
    };

    es.addEventListener('open', () => {
      attempt = 0; // reset backoff
      onOpen?.({ url });
    });

    // Listeners nombrados por evento
    es.addEventListener('CREATED', parseAnd(onCreated));
    es.addEventListener('UPDATED', parseAnd(onUpdated));
    es.addEventListener('DELETED', parseAnd(onDeleted));

    // Fallback message
    es.addEventListener('message', (e) => {
      try {
        const payload = JSON.parse(e.data);
        const tipo = payload?.tipo ?? payload?.type;
        const dto = payload?.data ?? payload?.payload ?? payload;
        if (tipo === 'CREATED') onCreated?.(dto);
        else if (tipo === 'UPDATED') onUpdated?.(dto);
        else if (tipo === 'DELETED') onDeleted?.(dto);
      } catch (err) {
        onError?.(err);
      }
    });

    es.addEventListener('error', (e) => {
      if (closed) return;
      onError?.({ errorEvent: e, url });
      // Notificar desconexión solo al iniciar ciclo de reconexión
      if (!reconnectTimer) onDisconnect?.({ url });
      clearReconnect();
      attempt += 1;
      const delay = nextDelay();
      reconnectTimer = setTimeout(() => {
        try { es?.close(); } catch(_) {}
        attach();
      }, delay);
    });
  };

  attach();

  return {
    close: () => {
      closed = true;
      clearReconnect();
      try { es?.close(); } catch(_) {}
    }
  };
}

export default { connectSse };
