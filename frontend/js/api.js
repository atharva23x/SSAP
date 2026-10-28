import { API_URL } from './config.js';

let accessToken = null;
let onUnauthorized = null;

export function setAccessToken(token) {
  accessToken = token || null;
}

/** Registered by app.js: called when a request still401s after a refresh attempt. */
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(method, path, { body, raw, headers = {} } = {}) {
  const opts = {
    method,
    credentials: 'include', // send httpOnly cookies
    headers: { ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...headers },
  };
  if (accessToken) opts.headers.Authorization = `Bearer ${accessToken}`;
  if (body) opts.body = body instanceof FormData ? body : JSON.stringify(body);

  let res = await fetch(`${API_URL}/api${path}`, opts);

  // Try one silent refresh on 401
  if (res.status === 401 && !path.startsWith('/auth/')) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      opts.headers.Authorization = `Bearer ${accessToken}`;
      res = await fetch(`${API_URL}/api${path}`, opts);
    }
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Session is genuinely dead (refresh already failed) → notify the app once.
    if (res.status === 401 && !path.startsWith('/auth/') && onUnauthorized) onUnauthorized();
    const err = new Error(json?.error?.message || `HTTP_${res.status}`);
    err.status = res.status;
    err.details = json?.error?.details;
    throw err;
  }
  return raw ? res : json;
}

async function tryRefresh() {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const json = await res.json();
    if (json?.user) {
      localStorage.setItem('ssap_user', JSON.stringify(json.user));
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const api = {
  get: (p, o) => request('GET', p, o),
  post: (p, body, o = {}) => request('POST', p, { ...o, body }),
  put: (p, body, o = {}) => request('PUT', p, { ...o, body }),
  patch: (p, body, o = {}) => request('PATCH', p, { ...o, body }),
  del: (p, o) => request('DELETE', p, o),
};

export { API_URL };
