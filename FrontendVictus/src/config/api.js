export const API = {
  base: import.meta.env.VITE_API_URL,
  // Prefijo real para CRUD del backend
  v1: `${import.meta.env.VITE_API_URL}/uco`,
  // Prefijo real para streams (SSE)
  streamV1: `${import.meta.env.VITE_API_URL}/stream`,
};
