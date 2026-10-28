import { t } from '../i18n.js';
import { esc, toast, skeletonGrid, skeletonList, emptyState, deadlineChip, formatDate, statusBadge } from '../ui.js';
import { api } from '../api.js';
import { getUser } from '../store.js';

export async function renderDashboard(root) {
  const user = getUser();
  root.innerHTML = `
    <div class="container-x" style="padding-top:1.5rem">
      <div class="hero-grad" style="color:#fff;border-radius:16px;padding:1.75rem;margin-bottom:1.5rem">
        <h2 style="color:#fff;margin:0 0 0.25rem">${esc(t('dashboard.welcome'))}, ${esc(user?.name?.split(' ')[0] || 'Student')} 👋</h2>
        <p style="opacity:0.9;margin:0">${esc(t('app.tagline'))}</p>
      </div>

      <div id="stats" style="display:grid;gap:0.75rem;grid-template-columns:repeat(2,1fr);margin-bottom:1.5rem"></div>

      <div id="doc-alert"></div>

      <!-- AI card -->
      <div class="card" style="padding:1.25rem;margin-bottom:1.5rem;border-left:4px solid var(--primary)">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
          <div style="font-size:1.75rem">🤖</div>
          <div><h3 style="margin:0;font-size:1.1rem">${esc(t('assistant.title'))}</h3><p class="caption text-muted">${esc(t('dashboard.askAi'))}</p></div>
        </div>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap" id="ai-chips"></div>
      </div>

      <div style="display:grid;gap:1.5rem;grid-template-columns:1fr" class="dash-grid">
        <div>
          <h3 style="margin-bottom:0.75rem">${esc(t('dashboard.eligibleForYou'))}</h3>
          <div id="eligible">${skeletonGrid(3)}</div>
        </div>
        <div>
          <h3 style="margin-bottom:0.75rem">${esc(t('dashboard.deadlineRadar'))} <span class="badge badge-muted">${esc(t('dashboard.next30Days'))}</span></h3>
          <div class="card" style="padding:1.25rem" id="radar">${skeletonList(4)}</div>
        </div>
      </div>

      <h3 style="margin:1.5rem 0 0.75rem">${esc(t('dashboard.upcomingExams'))}</h3>
      <div id="exams">${skeletonGrid(3)}</div>

      <h3 style="margin:1.5rem 0 0.75rem">${esc(t('dashboard.continueWhere'))}</h3>
      <div id="saved"></div>
    </div>`;

  // AI suggestion chips
  const chips = root.querySelector('#ai-chips');
  const sugg = [
    t('assistant.suggestions.scholarships'),
    t('assistant.suggestions.incomeCert'),
    t('assistant.suggestions.neet'),
  ];
  chips.innerHTML = sugg.map((s) => `<button class="chip" data-q="${esc(s)}">💬 ${esc(s)}</button>`).join('');
  chips.querySelectorAll('[data-q]').forEach((b) =>
    b.addEventListener('click', () => {
      sessionStorage.setItem('ssap_pending_q', b.dataset.q);
      location.hash = '/assistant';
    })
  );

  // Load data
  try {
    const [matchRes, savedRes, examRes] = await Promise.all([
      api.get('/schemes/match?limit=50'),
      api.get('/profile/saved'),
      api.get('/exams?limit=3'),
    ]);

    renderStats(root, matchRes, savedRes);
    renderEligible(root, matchRes.data.slice(0, 6));
    renderRadar(root, matchRes.data);
    renderExams(root, examRes.data);
    renderSaved(root, savedRes.data);
  } catch (err) {
    toast(t('common.error'), 'error');
  }
}

function renderStats(root, matchRes, savedRes) {
  const data = matchRes.data || [];
  const eligible = data.filter((s) => s.status === 'eligible').length;
  const deadlines = data.filter((s) => s.deadlineDays != null && s.deadlineDays >= 0 && s.deadlineDays <= 30).length;
  // Missing docs count derived from eligible schemes requiring docs
  const missing = data.filter((s) => s.status !== 'not_eligible').length; // placeholder; refined below
  const savedExams = (savedRes.data?.exams || []).length;

  const cards = [
    { label: t('dashboard.eligibleSchemes'), value: eligible, icon: '✅', color: 'var(--success)', href: '#/schemes' },
    { label: t('dashboard.upcomingDeadlines'), value: deadlines, icon: '⏳', color: 'var(--accent)', href: '#/schemes' },
    { label: t('dashboard.missingDocuments'), value: '—', icon: '📄', color: 'var(--danger)', href: '#/documents' },
    { label: t('dashboard.savedExams'), value: savedExams, icon: '📝', color: 'var(--primary)', href: '#/exams' },
  ];
  root.querySelector('#stats').innerHTML = cards.map((c) => `
    <a href="${c.href}" class="card card-hover" style="padding:1rem;text-decoration:none;color:inherit;display:flex;gap:0.75rem;align-items:center">
      <div style="width:44px;height:44px;border-radius:12px;background:${c.color}1a;display:flex;align-items:center;justify-content:center;font-size:1.4rem">${c.icon}</div>
      <div><div style="font-size:1.5rem;font-weight:700;color:${c.color};line-height:1.1">${c.value}</div>
      <div class="caption text-muted">${esc(c.label)}</div></div>
    </a>`).join('');

  // Document gap banner
  const alertEl = root.querySelector('#doc-alert');
  if (eligible > 0) {
    alertEl.innerHTML = `
      <div class="card" style="padding:1rem 1.25rem;margin-bottom:1.5rem;border-left:4px solid var(--accent);background:var(--soft-amber)">
        <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap">
          <span style="font-size:1.5rem">⚠️</span>
          <div style="flex:1;min-width:180px"><strong>${esc(t('dashboard.docGapAlert'))}</strong>
          <div class="small text-muted">${eligible} ${esc(t('dashboard.eligibleSchemes').toLowerCase())}</div></div>
          <a href="#/documents" class="btn btn-accent btn-sm">${esc(t('dashboard.fixNow'))}</a>
        </div>
      </div>`;
  }
}

function renderEligible(root, schemes) {
  const el = root.querySelector('#eligible');
  if (!schemes.length) { el.innerHTML = emptyState(t('common.noResults'), { icon: '🔍' }); return; }
  el.innerHTML = `<div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
    ${schemes.map((s) => schemeCard(s)).join('')}</div>`;
}

function schemeCard(s) {
  return `
  <a href="#/schemes/${s._id}" class="card card-hover" style="padding:1.15rem;text-decoration:none;color:inherit;display:block">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;margin-bottom:0.5rem">
      <span class="badge badge-primary">${esc(s.type || '')}</span>
      ${statusBadge(s.status)}
    </div>
    <h3 style="font-size:1.05rem;margin:0 0 0.35rem;line-height:1.3">${esc(s._l?.name || s.name)}</h3>
    <p class="caption text-muted" style="margin:0 0 0.5rem">${esc(s.provider || '')}</p>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem">
      ${s.benefits?.amount ? `<strong class="text-primary">₹${Number(s.benefits.amount).toLocaleString('en-IN')}</strong>` : '<span></span>'}
      ${deadlineChip(s.deadline)}
    </div>
  </a>`;
}

function renderRadar(root, schemes) {
  const el = root.querySelector('#radar');
  const soon = schemes.filter((s) => s.deadlineDays != null && s.deadlineDays >= 0 && s.deadlineDays <= 30).slice(0, 6);
  if (!soon.length) { el.innerHTML = emptyState(t('common.noResults'), { icon: '📭' }); return; }
  el.innerHTML = soon.map((s) => `
    <div class="timeline-item">
      <div style="display:flex;justify-content:space-between;gap:0.5rem;flex-wrap:wrap">
        <a href="#/schemes/${s._id}" style="font-weight:600;color:inherit;text-decoration:none">${esc(s._l?.name || s.name)}</a>
        ${deadlineChip(s.deadline)}
      </div>
      <div class="caption text-muted">${esc(s.provider || '')} · ${formatDate(s.deadline)}</div>
    </div>`).join('');
}

function renderExams(root, exams) {
  const el = root.querySelector('#exams');
  if (!exams.length) { el.innerHTML = emptyState(t('exams.empty'), { icon: '📝' }); return; }
  el.innerHTML = `<div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">
    ${exams.map((e) => `
      <a href="#/exams" class="card card-hover" style="padding:1.15rem;text-decoration:none;color:inherit">
        <span class="badge badge-accent">${esc(e.stream || '')}</span>
        <h3 style="font-size:1rem;margin:0.5rem 0 0.25rem">${esc(e._l?.name || e.name)}</h3>
        <p class="caption text-muted">${esc(e.conductingBody || '')}</p>
        <div style="margin-top:0.5rem">${deadlineChip(e.registrationDeadline)}</div>
      </a>`).join('')}</div>`;
}

function renderSaved(root, data) {
  const el = root.querySelector('#saved');
  const schemes = data.schemes || [];
  const exams = data.exams || [];
  if (!schemes.length && !exams.length) { el.innerHTML = `<div class="card" style="padding:1.25rem">${emptyState(t('dashboard.noSaved'), { icon: '🔖' })}</div>`; return; }
  el.innerHTML = `<div class="card" style="padding:1.25rem">
    ${schemes.map((s) => `<a href="#/schemes/${s._id}" style="display:flex;justify-content:space-between;padding:0.5rem 0;color:inherit;text-decoration:none;border-bottom:1px solid var(--border)"><span>${esc(s._l?.name || s.name)}</span><span class="badge badge-primary">${esc(t('nav.schemes'))}</span></a>`).join('')}
    ${exams.map((e) => `<a href="#/exams" style="display:flex;justify-content:space-between;padding:0.5rem 0;color:inherit;text-decoration:none"><span>${esc(e._l?.name || e.name)}</span><span class="badge badge-accent">${esc(t('nav.exams'))}</span></a>`).join('')}
  </div>`;
}
