import { t, getLang } from './i18n.js';

/** Escape user/DI data before injecting into HTML. */
export function esc(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/* ---------- Toasts ---------- */
export function toast(message, type = 'info', timeout = 3500) {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    wrap.setAttribute('role', 'status');
    wrap.setAttribute('aria-live', 'polite');
    document.body.appendChild(wrap);
  }
  const icons = { success: '✅', error: '⚠️', warning: '⏳', info: 'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type] || ''}</span><span></span>`;
  el.lastChild.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s';
    setTimeout(() => el.remove(), 300);
  }, timeout);
}

/* ---------- Modal ---------- */
export function modal({ title, body, actions = [], onClose }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title || 'Dialog')}">
      <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid var(--border)">
        <h3 style="margin:0;font-size:1.15rem">${esc(title || '')}</h3>
        <button class="btn btn-ghost btn-sm modal-close" aria-label="${t('nav.close')}">✕</button>
      </div>
      <div class="modal-body" style="padding:1.25rem"></div>
      <div class="modal-actions" style="padding:1rem 1.25rem;border-top:1px solid var(--border);display:flex;gap:0.5rem;justify-content:flex-end"></div>
    </div>`;
  backdrop.querySelector('.modal-body').innerHTML = body || '';
  const actionWrap = backdrop.querySelector('.modal-actions');
  actions.forEach((a) => {
    const b = document.createElement('button');
    b.className = `btn ${a.className || 'btn-ghost'}`;
    b.textContent = a.label;
    b.onclick = () => a.onClick?.(close);
    actionWrap.appendChild(b);
  });
  if (!actions.length) actionWrap.remove();

  function close() {
    backdrop.remove();
    onClose?.();
    document.removeEventListener('keydown', escHandler);
  }
  function escHandler(e) {
    if (e.key === 'Escape') close();
  }
  backdrop.querySelector('.modal-close').onclick = close;
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  document.addEventListener('keydown', escHandler);
  document.body.appendChild(backdrop);
  backdrop.querySelector('.modal-close').focus();
  return { close, el: backdrop };
}

/* ---------- Confirm ---------- */
export function confirmDialog(message, onConfirm, { title, danger } = {}) {
  modal({
    title: title || t('common.confirm'),
    body: `<p>${esc(message)}</p>`,
    actions: [
      { label: t('common.cancel'), className: 'btn-ghost' },
      {
        label: t('common.yes'),
        className: danger ? 'btn-danger' : 'btn-primary',
        onClick: (close) => { close(); onConfirm(); },
      },
    ],
  });
}

/* ---------- Skeletons ---------- */
export function skeletonCard() {
  return `<div class="card" style="padding:1.25rem">
    <div class="skeleton" style="height:20px;width:60%;margin-bottom:12px"></div>
    <div class="skeleton" style="height:14px;width:90%;margin-bottom:8px"></div>
    <div class="skeleton" style="height:14px;width:75%;margin-bottom:16px"></div>
    <div class="skeleton" style="height:36px;width:40%"></div>
  </div>`;
}

export function skeletonGrid(n = 6) {
  return `<div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
    ${Array.from({ length: n }).map(skeletonCard).join('')}
  </div>`;
}

export function skeletonList(n = 4) {
  return Array.from({ length: n }).map(() => `
    <div style="display:flex;gap:12px;align-items:center;margin-bottom:14px">
      <div class="skeleton" style="width:44px;height:44px;border-radius:12px"></div>
      <div style="flex:1">
        <div class="skeleton" style="height:14px;width:70%;margin-bottom:6px"></div>
        <div class="skeleton" style="height:12px;width:45%"></div>
      </div>
    </div>`).join('');
}

/* ---------- Empty state ---------- */
export function emptyState(message, { icon = '📭', action } = {}) {
  return `<div class="empty">
    <div style="font-size:3rem;margin-bottom:0.5rem">${icon}</div>
    <p style="margin-bottom:1rem">${esc(message)}</p>
    ${action ? `<button class="btn btn-secondary" data-act="${esc(action.act)}">${esc(action.label)}</button>` : ''}
  </div>`;
}

/* ---------- Badge ---------- */
export function statusBadge(status) {
  const map = {
    eligible: ['badge-eligible', '✅ ' + t('schemes.eligible')],
    action_needed: ['badge-action', '⚠️ ' + t('schemes.actionNeeded')],
    not_eligible: ['badge-not', '❌ ' + t('schemes.notEligible')],
    missing: ['badge-danger', t('schemes.missing')],
    uploaded: ['badge-accent', t('schemes.uploaded')],
    verified: ['badge-success', '✓ ' + t('schemes.uploaded')],
  };
  const [cls, label] = map[status] || ['badge-muted', status];
  return `<span class="badge ${cls}">${label}</span>`;
}

/* ---------- Match ring ---------- */
export function matchRing(percent) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const filled = (percent / 100) * c;
  const color = percent >= 80 ? 'var(--success)' : percent >= 50 ? 'var(--accent)' : 'var(--danger)';
  return `<div class="ring" role="img" aria-label="${t('schemes.matchScore')} ${percent}%">
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="${r}" fill="none" stroke="var(--border)" stroke-width="7"></circle>
      <circle cx="36" cy="36" r="${r}" fill="none" stroke="${color}" stroke-width="7"
        stroke-linecap="round" stroke-dasharray="${filled} ${c}"></circle>
    </svg>
    <span class="ring-label" style="color:${color}">${percent}%</span>
  </div>`;
}

/* ---------- Deadline helpers ---------- */
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export function deadlineChip(dateStr) {
  const d = daysUntil(dateStr);
  if (d == null) return '';
  if (d < 0) return `<span class="badge badge-muted">${t('schemes.closed')}</span>`;
  if (d === 0) return `<span class="badge badge-danger">${t('dashboard.today')}</span>`;
  if (d <= 3) return `<span class="badge badge-danger">⏳ ${d} ${t('dashboard.daysLeft')}</span>`;
  if (d <= 10) return `<span class="badge badge-accent">${d} ${t('dashboard.daysLeft')}</span>`;
  return `<span class="badge badge-muted">${d} ${t('dashboard.daysLeft')}</span>`;
}

export function formatDate(dateStr, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(getLang() === 'en' ? 'en-IN' : getLang(), opts);
}

/* ---------- Language switcher ---------- */
export function languageSwitcher(current, onSelect) {
  const { LANGS } = window.__LANGS__;
  const active = LANGS.find((l) => l.code === current) || LANGS[0];
  return `<div style="position:relative" id="lang-wrap">
    <button class="btn btn-ghost btn-sm" id="lang-btn" aria-haspopup="true" aria-expanded="false" aria-label="${t('common.selectLanguage')}">
      <span aria-hidden="true">🌐</span><span class="lang-label">${active.label}</span>
    </button>
    <div class="lang-menu" id="lang-menu" hidden>
      ${LANGS.map((l) => `<button data-lang="${l.code}" class="${l.code === current ? 'active' : ''}">
        <span aria-hidden="true">${l.flag}</span>${l.label}
      </button>`).join('')}
    </div>
  </div>`;
}

export function bindLanguageSwitcher(root, onSelect) {
  const btn = root.querySelector('#lang-btn');
  const menu = root.querySelector('#lang-menu');
  if (!btn || !menu) return;
  btn.onclick = (e) => {
    e.stopPropagation();
    const open = !menu.hidden;
    menu.hidden = open;
    btn.setAttribute('aria-expanded', String(!open));
  };
  menu.querySelectorAll('button[data-lang]').forEach((b) => {
    b.onclick = () => {
      menu.hidden = true;
      onSelect(b.dataset.lang);
    };
  });
  document.addEventListener('click', () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); }, { once: true });
}

/* ---------- Spinner ---------- */
export function spinner(size = 18) {
  return `<span class="spinner" style="display:inline-block;width:${size}px;height:${size}px;border:2px solid rgba(255,255,255,0.4);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite"></span>`;
}

/* Inject spin keyframes once */
const style = document.createElement('style');
style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(style);

/* ---------- WhatsApp / share ---------- */
export function shareWhatsApp(text, url) {
  const u = url || location.href;
  window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${u}`)}`, '_blank');
}

/* ---------- Theme (dark mode) ---------- */
const THEME_KEY = 'ssap_theme'; // 'light' | 'dark' | 'system'

export function getTheme() {
  try { return localStorage.getItem(THEME_KEY) || 'system'; } catch { return 'system'; }
}

export function resolvedTheme() {
  if (getTheme() === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return getTheme();
}

/** Apply a theme mode ('light'|'dark'|'system') to the document. */
export function applyTheme(mode) {
  const theme = mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1220' : '#1e40af');
  window.dispatchEvent(new CustomEvent('ssap:theme', { detail: { theme } }));
  return theme;
}

export function setTheme(mode) {
  try { localStorage.setItem(THEME_KEY, mode); } catch { /* private mode */ }
  return applyTheme(mode);
}

/** Toggle between light and dark (system resolves first). Returns new theme. */
export function toggleTheme() {
  return setTheme(resolvedTheme() === 'dark' ? 'light' : 'dark');
}

export function themeIcon() {
  return resolvedTheme() === 'dark' ? '☀️' : '🌙';
}

/** Call once at boot; also follows OS changes while in 'system' mode. */
export function initTheme() {
  applyTheme(getTheme());
  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getTheme() === 'system') applyTheme('system');
    });
  } catch { /* old browsers */ }
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
