const USER_KEY = 'ssap_user';

const listeners = new Set();

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
  listeners.forEach((fn) => fn(user));
}

export function onAuthChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isLoggedIn() {
  return !!getUser();
}

export function isAdmin() {
  return getUser()?.role === 'admin';
}

export async function logout() {
  try {
    const { api } = await import('./api.js');
    await api.post('/auth/logout');
  } catch {
    /* ignore */
  }
  setUser(null);
}
