import { t } from '../i18n.js';
import { esc, toast, skeletonGrid, emptyState, statusBadge, deadlineChip, formatDate, matchRing, shareWhatsApp, copyText } from '../ui.js';
import { api } from '../api.js';

const STATES = ['All India','Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal','Delhi'];
const CATEGORIES = ['General','EWS','OBC','SC','ST'];
const CLASSES = ['10th','12th','UG','PG'];
const TYPES = ['central','state','private'];

export async function renderSchemes(root) {
  const filters = { state: '', category: '', class: '', type: '', sort: 'deadline' };

  root.innerHTML = `
  <div class="container-x" style="padding-top:1.5rem">
    <h2 style="margin-bottom:1rem">${esc(t('schemes.title'))}</h2>
    <div style="display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap">
      <input class="input" id="q" placeholder="${esc(t('schemes.searchPlaceholder'))}" style="flex:1;min-width:200px" />
      <select class="input" id="sort" style="width:auto">
        <option value="deadline">${esc(t('schemes.sortDeadline'))}</option>
        <option value="match">${esc(t('schemes.sortMatch'))}</option>
      </select>
    </div>

    <div style="display:grid;gap:0.5rem;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-bottom:1rem">
      <select class="input" id="f-state">${STATES.map((s) => `<option value="${s === 'All India' ? '' : esc(s)}">${esc(s)}</option>`).join('')}</select>
      <select class="input" id="f-cat"><option value="">${esc(t('schemes.allCategories'))}</option>${CATEGORIES.map((c) => `<option>${c}</option>`).join('')}</select>
      <select class="input" id="f-class"><option value="">${esc(t('schemes.allClasses'))}</option>${CLASSES.map((c) => `<option>${c}</option>`).join('')}</select>
      <select class="input" id="f-type"><option value="">${esc(t('schemes.allTypes'))}</option>${TYPES.map((c) => `<option value="${c}">${esc(t('schemes.' + c))}</option>`).join('')}</select>
    </div>

    <div id="list">${skeletonGrid(6)}</div>
    <div id="pager" style="display:flex;justify-content:center;gap:0.5rem;margin-top:1.5rem"></div>
  </div>`;

  let page = 1;
  const qEl = root.querySelector('#q');
  let timer;

  async function load() {
    root.querySelector('#list').innerHTML = skeletonGrid(6);
    const params = new URLSearchParams({ page, limit: 12, sort: filters.sort });
    if (qEl.value) params.set('q', qEl.value);
    if (filters.state) params.set('state', filters.state);
    if (filters.category) params.set('category', filters.category);
    if (filters.class) params.set('class', filters.class);
    if (filters.type) params.set('type', filters.type);
    try {
      const res = await api.get(`/schemes?${params}`);
      const matchRes = await api.get(`/schemes/match?limit=100`).catch(() => ({ data: [] }));
      const matchMap = new Map((matchRes.data || []).map((m) => [m._id, m]));
      const items = (res.data || []).map((s) => ({ ...s, ...(matchMap.get(s._id) || {}) }));
      if (filters.sort === 'match') items.sort((a, b) => (b.matchPercent || 0) - (a.matchPercent || 0));
      renderList(items, res.meta);
    } catch {
      root.querySelector('#list').innerHTML = emptyState(t('common.error'), { icon: '⚠️' });
    }
  }

  function renderList(items, meta) {
    const el = root.querySelector('#list');
    if (!items.length) { el.innerHTML = emptyState(t('schemes.empty'), { icon: '🔍', action: { act: 'clear', label: t('btn.retry') } }); return; }
    el.innerHTML = `<div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
      ${items.map((s) => `
        <a href="#/schemes/${s._id}" class="card card-hover" style="padding:1.15rem;text-decoration:none;color:inherit;display:block">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.5rem">
            <span class="badge badge-primary">${esc(t('schemes.' + (s.type || 'central')))}</span>
            ${s.status ? statusBadge(s.status) : ''}
          </div>
          <h3 style="font-size:1.05rem;margin:0 0 0.35rem;line-height:1.3">${esc(s._l?.name || s.name)}</h3>
          <p class="caption text-muted" style="margin:0 0 0.6rem">${esc(s.provider || '')}${s.state && s.state !== 'ALL' ? ' · ' + esc(s.state) : ''}</p>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem">
            <div style="display:flex;align-items:center;gap:0.5rem">
              ${s.benefits?.amount ? `<strong class="text-primary">₹${Number(s.benefits.amount).toLocaleString('en-IN')}</strong>` : ''}
              ${s.matchPercent != null ? `<span class="badge ${s.matchPercent >= 80 ? 'badge-success' : s.matchPercent >= 50 ? 'badge-accent' : 'badge-muted'}">${s.matchPercent}%</span>` : ''}
            </div>
            ${deadlineChip(s.deadline)}
          </div>
        </a>`).join('')}</div>`;

    // pager
    const pager = root.querySelector('#pager');
    if (meta && meta.pages > 1) {
      pager.innerHTML = `
        <button class="btn btn-ghost btn-sm" ${meta.page <= 1 ? 'disabled' : ''} data-p="${meta.page - 1}">←</button>
        <span class="small text-muted" style="align-self:center">${esc(t('common.page'))} ${meta.page} ${esc(t('common.of'))} ${meta.pages}</span>
        <button class="btn btn-ghost btn-sm" ${meta.page >= meta.pages ? 'disabled' : ''} data-p="${meta.page + 1}">→</button>`;
      pager.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => { page = Number(b.dataset.p); load(); }));
    } else pager.innerHTML = '';
  }

  qEl.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { page = 1; load(); }, 350); });
  root.querySelector('#sort').addEventListener('change', (e) => { filters.sort = e.target.value; load(); });
  root.querySelector('#f-state').addEventListener('change', (e) => { filters.state = e.target.value; page = 1; load(); });
  root.querySelector('#f-cat').addEventListener('change', (e) => { filters.category = e.target.value; page = 1; load(); });
  root.querySelector('#f-class').addEventListener('change', (e) => { filters.class = e.target.value; page = 1; load(); });
  root.querySelector('#f-type').addEventListener('change', (e) => { filters.type = e.target.value; page = 1; load(); });

  load();
}

/* ---------------- Scheme detail ---------------- */

export async function renderSchemeDetail(root, id) {
  root.innerHTML = `<div class="container-x" style="padding-top:1.5rem">${skeletonGrid(1)}</div>`;
  let scheme;
  try {
    const res = await api.get(`/schemes/${id}`);
    scheme = res.data;
  } catch {
    root.innerHTML = `<div class="container-x">${emptyState(t('common.error'), { icon: '⚠️' })}</div>`;
    return;
  }

  const s = scheme;
  root.innerHTML = `
  <div class="container-x" style="padding-top:1.25rem">
    <a href="#/schemes" class="small text-primary" style="text-decoration:none">← ${esc(t('nav.schemes'))}</a>
    <div class="card" style="padding:1.5rem;margin:0.75rem 0">
      <div style="display:flex;gap:1.25rem;align-items:flex-start;flex-wrap:wrap">
        ${matchRing(s.matchPercent ?? 0)}
        <div style="flex:1;min-width:220px">
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.5rem">
            <span class="badge badge-primary">${esc(t('schemes.' + (s.type || 'central')))}</span>
            ${s.status ? statusBadge(s.status) : ''}
            ${deadlineChip(s.deadline)}
          </div>
          <h2 style="margin:0 0 0.35rem">${esc(s._l?.name || s.name)}</h2>
          <p class="text-muted" style="margin:0">${esc(s.provider || '')}${s.state && s.state !== 'ALL' ? ' · ' + esc(s.state) : ''}</p>
          ${s.benefits?.amount ? `<p style="margin:0.5rem 0 0"><strong class="text-primary" style="font-size:1.25rem">₹${Number(s.benefits.amount).toLocaleString('en-IN')}</strong> <span class="text-muted small">${esc(s.benefits.duration || '')}</span></p>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:0.5rem">
          <button class="btn btn-ghost btn-sm" id="save-btn">${s.saved ? '🔖 ' + esc(t('btn.saved')) : '🔖 ' + esc(t('btn.save'))}</button>
          <button class="btn btn-ghost btn-sm" id="share-btn">📤 ${esc(t('btn.share'))}</button>
        </div>
      </div>
    </div>

    <div class="tabs" style="margin-bottom:1rem">
      <button class="tab active" data-tab="overview">${esc(t('schemes.tabOverview'))}</button>
      <button class="tab" data-tab="eligibility">${esc(t('schemes.tabEligibility'))}</button>
      <button class="tab" data-tab="documents">${esc(t('schemes.tabDocuments'))}</button>
      <button class="tab" data-tab="apply">${esc(t('schemes.tabApply'))}</button>
    </div>

    <div id="tab-content"></div>
  </div>`;

  const tabs = {
    overview: () => `
      <div class="card" style="padding:1.5rem">
        <p style="margin-top:0">${esc(s._l?.description || s.description || '')}</p>
        ${s.startDate ? `<p class="small text-muted">${esc(t('common.all'))}: ${formatDate(s.startDate)} → ${formatDate(s.deadline)}</p>` : ''}
        ${s.tags?.length ? `<div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.75rem">${s.tags.map((tag) => `<span class="badge badge-muted">#${esc(tag)}</span>`).join('')}</div>` : ''}
      </div>`,
    eligibility: () => `
      <div class="card" style="padding:1.5rem">
        <h3 style="margin-top:0">${esc(t('schemes.yourCriteria'))}</h3>
        <ul style="list-style:none;padding:0;margin:0">
          ${(s.checks || []).map((c) => `
            <li style="display:flex;gap:0.6rem;align-items:flex-start;padding:0.6rem 0;border-bottom:1px solid var(--border)">
              <span style="font-size:1.1rem">${c.passed ? '✅' : '❌'}</span>
              <div><strong>${esc(c.label)}</strong><div class="small ${c.passed ? 'text-muted' : 'text-danger'}">${esc(c.reason)}</div></div>
            </li>`).join('') || `<li class="text-muted">${esc(t('common.none'))}</li>`}
        </ul>
      </div>`,
    documents: () => `
      <div class="card" style="padding:1.5rem">
        <h3 style="margin-top:0">${esc(t('schemes.requiredDocuments'))}</h3>
        <ul style="list-style:none;padding:0;margin:0" id="doc-list">
          ${(s.requiredDocuments || []).map((d) => `
            <li style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;padding:0.6rem 0;border-bottom:1px solid var(--border);flex-wrap:wrap">
              <span style="display:flex;align-items:center;gap:0.4rem"><a href="#/offices?doc=${encodeURIComponent(d)}" title="${esc(t('offices.showOnMap'))}" style="text-decoration:none">🗺️</a>${esc(d)}</span>
              <span style="display:flex;gap:0.4rem;flex-wrap:wrap">
                <a href="#/offices?doc=${encodeURIComponent(d)}" class="btn btn-ghost btn-sm">${esc(t('offices.showOnMap'))}</a>
                <a href="#/documents?scheme=${s._id}" class="btn btn-secondary btn-sm">${esc(t('schemes.getThisDoc'))}</a>
              </span>
            </li>`).join('') || `<li class="text-muted">${esc(t('common.none'))}</li>`}
        </ul>
      </div>`,
    apply: () => `
      <div class="card" style="padding:1.5rem;text-align:center">
        <div style="font-size:2.5rem;margin-bottom:0.5rem">🚀</div>
        <h3 style="margin-bottom:0.5rem">${esc(t('schemes.tabApply'))}</h3>
        <p class="text-muted" style="max-width:420px;margin:0 auto 1.25rem">${esc(s._l?.description || s.description || '').slice(0, 140)}…</p>
        ${s.applicationUrl ? `<a href="${esc(s.applicationUrl)}" target="_blank" rel="noopener" class="btn btn-primary btn-lg">${esc(t('btn.apply'))} ↗</a>` : `<button class="btn btn-primary btn-lg" disabled>${esc(t('btn.apply'))}</button>`}
        <p class="caption text-muted" style="margin-top:0.75rem">${esc(t('schemes.officialPortal'))}: ${esc(s.officialPortal || '—')}</p>
      </div>`,
  };

  const content = root.querySelector('#tab-content');
  function showTab(name) {
    root.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
    content.innerHTML = tabs[name]();
  }
  root.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));
  showTab('overview');

  root.querySelector('#save-btn').onclick = async () => {
    try {
      const r = await api.post(`/schemes/${id}/save`);
      root.querySelector('#save-btn').innerHTML = r.saved ? `🔖 ${esc(t('btn.saved'))}` : `🔖 ${esc(t('btn.save'))}`;
      toast(r.saved ? t('btn.saved') : t('btn.save'), 'success');
    } catch { toast(t('common.error'), 'error'); }
  };
  root.querySelector('#share-btn').onclick = () => shareWhatsApp(`${s._l?.name || s.name} — ${location.origin}/#/schemes/${id}`);
}
