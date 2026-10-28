const routes = [];
let currentCleanup = null;

/** Register a route: router.on('/schemes/:id', (ctx) => {...}) */
export function on(pattern, handler) {
  const keys = [];
  const regex = new RegExp(
    '^' +
      pattern
        .replace(/\/:([A-Za-z0-9_]+)/g, (_, k) => {
          keys.push(k);
          return '/([^/]+)';
        })
        .replace(/\*/g, '.*') +
      '$'
  );
  routes.push({ pattern, regex, keys, handler });
}

function parseHash() {
  const hash = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = hash.split('?');
  const query = Object.fromEntries(new URLSearchParams(qs || ''));
  return { path: path || '/', query, hash };
}

export async function navigate(path, { replace = false } = {}) {
  if (replace) location.replace('#' + path);
  else location.hash = path;
}

export function currentPath() {
  return parseHash().path;
}

async function resolve() {
  const ctx = parseHash();
  for (const r of routes) {
    const m = ctx.path.match(r.regex);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      if (typeof currentCleanup === 'function') {
        try { currentCleanup(); } catch { /* ignore */ }
        currentCleanup = null;
      }
      try {
        const result = await r.handler({ ...ctx, params });
        if (typeof result === 'function') currentCleanup = result;
      } catch (err) {
        console.error('route error', err);
        const main = document.getElementById('app-main');
        if (main) main.innerHTML = `<div class="empty"><div style="font-size:3rem">😵</div><p>${err.message || 'Error loading page'}</p></div>`;
      }
      window.scrollTo({ top: 0 });
      return;
    }
  }
  // Fallback: 404 -> home
  location.hash = '/';
}

export function startRouter() {
  window.addEventListener('hashchange', resolve);
  resolve();
}

export function refreshRoute() {
  resolve();
}
