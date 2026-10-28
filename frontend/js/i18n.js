import { API_URL, LANGS } from './config.js';

const cache = new Map(); // lang -> bundle
let current = 'en';
let bundle = {};
const listeners = new Set();

function getNested(obj, key) {
  return key.split('.').reduce((o, k) => (o && o[k] != null ? o[k] : undefined), obj);
}

export function getLang() {
  return current;
}

export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Translate a key with optional interpolation. Falls back to English then the key itself. */
export function t(key, vars) {
  let val = getNested(bundle, key);
  if (val == null) val = getNested(window.__EN_BUNDLE__ || {}, key);
  if (val == null) val = key;
  if (vars && typeof val === 'string') {
    Object.entries(vars).forEach(([k, v]) => {
      val = val.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
  }
  return val;
}

async function loadBundle(lang) {
  if (cache.has(lang)) return cache.get(lang);
  // Retry a few times — a briefly restarting server shouldn't blank the UI.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${API_URL}/api/i18n/${lang}`, { credentials: 'include' });
      if (!res.ok) throw new Error('load failed');
      const json = await res.json();
      cache.set(lang, json.data);
      if (lang === 'en') window.__EN_BUNDLE__ = json.data;
      return json.data;
    } catch {
      if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 400));
    }
  }
  // Offline / API down: keep whatever we have
  return cache.get(lang) || {};
}

export async function setLang(lang) {
  if (!LANGS.some((l) => l.code === lang)) lang = 'en';
  current = lang;
  localStorage.setItem('ssap_lang', lang);
  document.documentElement.lang = lang;
  bundle = await loadBundle(lang);
  listeners.forEach((fn) => fn(lang));
  return lang;
}

export async function initI18n() {
  // Warm the English bundle for fallback
  loadBundle('en');
  const saved = localStorage.getItem('ssap_lang') || 'en';
  await setLang(saved);
}

export { LANGS };
