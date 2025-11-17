export const API = {
  base: import.meta.env.VITE_API_URL,
  // Nueva base estándar en APIM: /uco
  v1: `${import.meta.env.VITE_API_URL}/uco`,
  // Mantener compatibilidad: 'challenge' ahora apunta también a /uco
  challenge: `${import.meta.env.VITE_API_URL}/uco`,
  // Nueva base para streams en APIM: /stream
  streamV1: `${import.meta.env.VITE_API_URL}/stream`,
  // Mantener compatibilidad: 'streamChallenge' ahora apunta también a /stream
  streamChallenge: `${import.meta.env.VITE_API_URL}/stream`,
};
