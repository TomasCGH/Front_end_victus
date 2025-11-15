// Cliente SSE simple y reutilizable basado en EventSource con listeners por nombre de evento
// Eventos esperados: CREATED, UPDATED, DELETED
// data: JSON con forma { tipo, data } aunque se soporta payload/data como fallback

export function connectSse(url, { onCreated, onUpdated, onDeleted, onError } = {}) {
  const es = new EventSource(url, { withCredentials: false });

  const parseAnd = (cb) => (e) => {
    try {
      const payload = JSON.parse(e.data);
      const dto = payload?.data ?? payload?.payload ?? payload;
      cb?.(dto);
    } catch (err) {
      onError?.(err);
    }
  };

  // Listeners nombrados por evento
  es.addEventListener('CREATED', parseAnd(onCreated));
  es.addEventListener('UPDATED', parseAnd(onUpdated));
  es.addEventListener('DELETED', parseAnd(onDeleted));

  // Fallback: algunos servidores envían 'message' con { tipo, data }
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
    // Dejar que EventSource maneje la reconexión automática
    onError?.(e);
  });

  return { close: () => es.close() };
}

export default { connectSse };
