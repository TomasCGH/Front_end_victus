// Stub neutral: conserva compatibilidad si es importado accidentalmente
export function apimFetch(url, options = {}) { return fetch(url, options); }
export function withSubscriptionKey(urlString) { return urlString; }
export default { apimFetch, withSubscriptionKey };
