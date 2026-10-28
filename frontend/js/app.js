import { initI18n, t, getLang, setLang, onLangChange, LANGS } from './i18n.js';
import { api, setUnauthorizedHandler } from './api.js';
import { getUser, setUser, isLoggedIn, isAdmin, onAuthChange, logout } from './store.js';
import * as router from './router.js';
import { esc, toast, bindLanguageSwitcher, initTheme, toggleTheme, themeIcon } from './ui.js';

// Expose LANGS for the ui helper
window.__LANGS__ = { LANGS };

import { renderLanding } from './pages/landing.js';
import { renderLogin } from './pages/login.js';
import { renderSignup } from './pages/signup.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderSchemes, renderSchemeDetail } from './pages/schemes.js';
import { renderExams } from './pages/exams.js';
import { renderCompetitions } from './pages/competitions.js';
import { renderMaterials } from './pages/materials.js';
import { renderDocuments } from './pages/documents.js';
import { renderOffices } from './pages/offices.js';
import { renderAssistant } from './pages/assistant.js';
import { renderProfile } from './pages/profile.js';
import { renderNotifications } from './pages/notifications.js';
import { renderAdmin } from './pages/admin.js';

const PUBLIC = ['/', '/login', '/signup'];

// Session validity cache — validated once, invalidated on logout/401.
let sessionValid = false;

async function ensureSession() {
  if (!isLoggedIn()) return false;
  if (sessionValid) return true;
  try {
    const r = await api.get('/auth/me');
    setUser(r.user);
    sessionValid = true;
    return true;
  } catch {
    setUser(null);
    sessionValid = false;
    return false;
  }
}

function invalidateSession() {
  sessionValid = false;
  setUser(null);
}

/** Wrap a protected route so it validates the session before rendering. */
function protect(handler) {
  return async (ctx) => {
    const ok = await ensureSession();
    if (!ok) {
      if (router.currentPath() !== '/login') location.hash = '/login';
      return;
    }
    if (ctx.path === '/admin' && !isAdmin()) {
      location.hash = '/dashboard';
      return;
    }
    return handler(ctx);
  };
}

/* ---------------- Layout chrome ---------------- */

function navbar() {
  const user = getUser();
  return `
  <header class="navbar">
    <div class="container-x" style="height:100%;display:flex;align-items:center;justify-content:space-between;gap:0.5rem">
      <div style="display:flex;align-items:center;gap:0.6rem">
        <button class="btn btn-ghost btn-sm" id="menu-btn" aria-label="${t('nav.menu')}" style="display:none" data-mobile>☰</button>
        <a href="#/" class="font-head" style="font-weight:700;text-decoration:none;display:flex;align-items:center;gap:0.5rem">
          <span class="brand-logo" aria-hidden="true">🎓</span>
          <span class="brand-name">${t('app.shortName')}</span>
        </a>
        <nav style="display:flex;gap:0.15rem;margin-left:1rem" class="desktop-nav">
          <a class="nav-link" href="#/dashboard">${t('nav.dashboard')}</a>
          <a class="nav-link" href="#/schemes">${t('nav.schemes')}</a>
          <a class="nav-link" href="#/exams">${t('nav.exams')}</a>
          <a class="nav-link" href="#/competitions">${t('nav.competitions')}</a>
          <a class="nav-link" href="#/materials">${t('nav.materials')}</a>
          ${isAdmin() ? `<a class="nav-link" href="#/admin">${t('nav.admin')}</a>` : ''}
        </nav>
      </div>
      <div style="display:flex;align-items:center;gap:0.4rem">
        <button class="btn btn-ghost btn-sm" id="theme-btn" data-theme-toggle aria-label="${t('common.themeToggle')}" title="${t('common.themeToggle')}">${themeIcon()}</button>
        <div id="lang-slot">${''}</div>
        ${user ? `
          <a href="#/notifications" class="btn btn-ghost btn-sm" aria-label="${t('nav.notifications')}" style="position:relative">
            🔔<span id="notif-dot" class="badge badge-danger" style="position:absolute;top:-4px;right:-4px;padding:0 5px;display:none"></span>
          </a>
          <a href="#/profile" class="btn btn-ghost btn-sm" style="display:none" data-desktop-user>
            <span aria-hidden="true">👤</span><span class="brand-text">${esc(user.name?.split(' ')[0] || '')}</span>
          </a>
        ` : `
          <a href="#/login" class="btn btn-ghost btn-sm brand-text">${t('nav.login')}</a>
          <a href="#/signup" class="btn btn-primary btn-sm brand-text">${t('nav.signup')}</a>
        `}
      </div>
    </div>
  </header>`;
}

function drawer() {
  const user = getUser();
  return `
  <div class="drawer" id="drawer" aria-hidden="true">
    <div style="position:absolute;inset:0;background:rgba(15,23,42,0.4)" data-close></div>
    <nav class="drawer-panel" aria-label="${t('nav.menu')}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
        <span style="display:flex;align-items:center;gap:0.5rem"><span class="brand-logo" aria-hidden="true">🎓</span><span class="brand-name">${t('app.shortName')}</span></span>
        <button class="btn btn-ghost btn-sm" data-close aria-label="${t('nav.close')}">✕</button>
      </div>
      ${user ? `
        <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;background:var(--soft-blue);border-radius:12px;margin-bottom:1rem">
          <div style="width:42px;height:42px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700">${esc((user.name || 'S')[0].toUpperCase())}</div>
          <div><div style="font-weight:600">${esc(user.name)}</div><div class="caption text-muted">${esc(user.email)}</div></div>
        </div>
        <a class="nav-link" href="#/dashboard">${t('nav.dashboard')}</a>
        <a class="nav-link" href="#/schemes">${t('nav.schemes')}</a>
        <a class="nav-link" href="#/exams">${t('nav.exams')}</a>
        <a class="nav-link" href="#/competitions">${t('nav.competitions')}</a>
        <a class="nav-link" href="#/materials">${t('nav.materials')}</a>
        <a class="nav-link" href="#/documents">${t('nav.documents')}</a>
        <a class="nav-link" href="#/offices">${t('nav.offices')}</a>
        <a class="nav-link" href="#/assistant">${t('nav.assistant')}</a>
        <a class="nav-link" href="#/profile">${t('nav.profile')}</a>
        <a class="nav-link" href="#/notifications">${t('nav.notifications')}</a>
        ${isAdmin() ? `<a class="nav-link" href="#/admin">${t('nav.admin')}</a>` : ''}
        <div class="divider"></div>
        <button class="btn btn-ghost btn-block" id="drawer-logout">${t('nav.logout')}</button>
      ` : `
        <a class="nav-link" href="#/">${t('nav.home')}</a>
        <div class="divider"></div>
        <a class="btn btn-secondary btn-block" href="#/login" style="margin-bottom:0.5rem">${t('nav.login')}</a>
        <a class="btn btn-primary btn-block" href="#/signup">${t('nav.signup')}</a>
      `}
      <div class="divider"></div>
      <button class="btn btn-ghost btn-block" data-theme-toggle>${themeIcon()} ${t('common.themeToggle')}</button>
    </nav>
  </div>`;
}

function bottomNav() {
  if (!isLoggedIn()) return '';
  const items = [
    { href: '#/dashboard', icon: '🏠', label: t('nav.home') },
    { href: '#/schemes', icon: '🎓', label: t('nav.schemes') },
    { href: '#/exams', icon: '📝', label: t('nav.exams') },
    { href: '#/documents', icon: '🗂️', label: t('nav.documents') },
    { href: '#/profile', icon: '👤', label: t('nav.profile') },
  ];
  return `<nav class="bottom-nav" aria-label="${t('nav.menu')}">
    ${items.map((i) => `<a href="${i.href}"><span style="font-size:1.2rem" aria-hidden="true">${i.icon}</span>${i.label}</a>`).join('')}
  </nav>`;
}

function chatFab() {
  if (!isLoggedIn()) return '';
  return `<button class="chat-fab" id="chat-fab" aria-label="${t('assistant.title')}" title="${t('assistant.title')}">
    <span style="font-size:1.5rem" aria-hidden="true">🤖</span>
  </button>`;
}

function setActiveNav() {
  const path = router.currentPath();
  document.querySelectorAll('.nav-link, .bottom-nav a').forEach((a) => {
    const href = a.getAttribute('href')?.replace('#', '');
    a.classList.toggle('active', href === path || (path.startsWith('/schemes/') && href === '/schemes'));
  });
}

function highlightDesktop() {
  document.querySelectorAll('.desktop-nav, [data-desktop-user]').forEach((el) => {
    el.style.display = window.innerWidth >= 900 ? '' : 'none';
  });
  const menuBtn = document.getElementById('menu-btn');
  if (menuBtn) menuBtn.style.display = window.innerWidth < 900 ? '' : 'none';
}

function renderShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <a href="#app-main" class="skip-link">Skip to content</a>
    ${navbar()}
    <main id="app-main" class="page-pad" tabindex="-1"></main>
    ${bottomNav()}
    ${drawer()}
    ${chatFab()}
  `;

  // Language switcher
  const slot = document.getElementById('lang-slot');
  slot.innerHTML = `<div style="position:relative" id="lang-wrap">
    <button class="btn btn-ghost btn-sm" id="lang-btn" aria-haspopup="true" aria-expanded="false" aria-label="${t('common.selectLanguage')}">
      <span aria-hidden="true">🌐</span>
    </button>
    <div class="lang-menu" id="lang-menu" hidden>
      ${LANGS.map((l) => `<button data-lang="${l.code}" class="${l.code === getLang() ? 'active' : ''}"><span aria-hidden="true">${l.flag}</span>${l.label}</button>`).join('')}
    </div>
  </div>`;
  bindLanguageSwitcher(slot, (lang) => setLang(lang).then(() => renderShell() || router.refreshRoute()));

  // Drawer
  const drawerEl = document.getElementById('drawer');
  document.getElementById('menu-btn')?.addEventListener('click', () => {
    drawerEl.classList.add('open');
    drawerEl.setAttribute('aria-hidden', 'false');
  });
  drawerEl.querySelectorAll('[data-close]').forEach((el) =>
    el.addEventListener('click', () => {
      drawerEl.classList.remove('open');
      drawerEl.setAttribute('aria-hidden', 'true');
    })
  );
  drawerEl.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => drawerEl.classList.remove('open'))
  );
  document.getElementById('drawer-logout')?.addEventListener('click', async () => {
    invalidateSession();
    await logout();
    toast(t('msg.loggedOut'), 'success');
    location.hash = '/';
    renderShell();
  });

  // Chat FAB
  document.getElementById('chat-fab')?.addEventListener('click', () => (location.hash = '/assistant'));

  // Theme toggle (navbar + drawer)
  app.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      toggleTheme();
      app.querySelectorAll('[data-theme-toggle]').forEach((b) => {
        b.innerHTML = b.id === 'theme-btn' ? themeIcon() : `${themeIcon()} ${t('common.themeToggle')}`;
      });
    });
  });

  highlightDesktop();
  setActiveNav();
  loadNotifCount();
}

async function loadNotifCount() {
  if (!isLoggedIn()) return;
  try {
    const res = await api.get('/notifications?unreadOnly=true&limit=1');
    const n = res?.meta?.unread || 0;
    const dot = document.getElementById('notif-dot');
    if (dot && n > 0) {
      dot.textContent = n > 9 ? '9+' : n;
      dot.style.display = '';
    }
  } catch { /* ignore */ }
}

/* ---------------- Routes ---------------- */

function registerRoutes() {
  // Public
  router.on('/', () => renderLanding(document.getElementById('app-main')));
  router.on('/login', () => renderLogin(document.getElementById('app-main')));
  router.on('/signup', () => renderSignup(document.getElementById('app-main')));

  // Protected (session validated before render)
  router.on('/dashboard', protect(() => renderDashboard(document.getElementById('app-main'))));
  router.on('/schemes', protect(() => renderSchemes(document.getElementById('app-main'))));
  router.on('/schemes/:id', protect(({ params }) => renderSchemeDetail(document.getElementById('app-main'), params.id)));
  router.on('/exams', protect(() => renderExams(document.getElementById('app-main'))));
  router.on('/competitions', protect(() => renderCompetitions(document.getElementById('app-main'))));
  router.on('/materials', protect(() => renderMaterials(document.getElementById('app-main'))));
  router.on('/documents', protect(() => renderDocuments(document.getElementById('app-main'))));
  router.on('/offices', protect(() => renderOffices(document.getElementById('app-main'))));
  router.on('/assistant', protect(() => renderAssistant(document.getElementById('app-main'))));
  router.on('/profile', protect(() => renderProfile(document.getElementById('app-main'))));
  router.on('/notifications', protect(() => renderNotifications(document.getElementById('app-main'))));
  router.on('/admin', protect(() => renderAdmin(document.getElementById('app-main'))));
}

/* ---------------- Boot ---------------- */

async function boot() {
  initTheme(); // resolve saved/system theme before anything renders
  await initI18n();

  // If any protected request still401s after a refresh attempt, the session is
  // dead — clear it and bounce to login instead of leaving a spinner running.
  setUnauthorizedHandler(() => {
    if (!isLoggedIn()) return;
    invalidateSession();
    const p = router.currentPath();
    if (!PUBLIC.includes(p)) {
      toast('Session expired — please log in again.', 'warning');
      location.hash = '/login';
    }
  });

  renderShell();
  registerRoutes();
  router.startRouter();

  onLangChange(() => {
    renderShell();
    router.refreshRoute();
  });
  onAuthChange(() => {
    renderShell();
    setActiveNav();
  });
  window.addEventListener('resize', highlightDesktop);

  // Validate any restored session once (sets sessionValid / clears bad state).
  await ensureSession();
  if (!isLoggedIn() && !PUBLIC.includes(router.currentPath())) location.hash = '/login';
}

boot().catch((err) => {
  // Never leave a blank screen — explain and offer a retry.
  console.error('boot failed', err);
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:1rem;padding:2rem;text-align:center">
        <div style="font-size:3rem">📡</div>
        <h2>Can't reach the SSAP server</h2>
        <p class="text-muted">The server may be restarting. This page retries automatically in a few seconds — or click Retry.</p>
        <button class="btn btn-primary" onclick="location.reload()">Retry now</button>
      </div>`;
  }
  setTimeout(() => location.reload(), 5000);
});
