// Cliente HTTP central para APIM: agrega la suscripción en headers
export function apimFetch(url, options = {}) {
  const key = import.meta.env.VITE_APIM_KEY;
  let headers = options && options.headers ? options.headers : {};

  // Normalizar a Headers para no perder cabeceras existentes
  const normalized = new Headers(headers);
  if (key) normalized.set("Ocp-Apim-Subscription-Key", key);

  const finalOptions = { ...options, headers: normalized };
  return fetch(url, finalOptions);
}

// Utilidad para SSE: adjunta la subscription key como query param
export function withSubscriptionKey(urlString) {
  const key = import.meta.env.VITE_APIM_KEY;
  if (!key) return urlString;
  try {
    const u = new URL(urlString);
    u.searchParams.set("subscription-key", key);
    return u.toString();
  } catch (_) {
    const sep = urlString.includes("?") ? "&" : "?";
    return `${urlString}${sep}subscription-key=${encodeURIComponent(key)}`;
  }
}

export default { apimFetch, withSubscriptionKey };
