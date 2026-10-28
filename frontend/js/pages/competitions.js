import { t } from '../i18n.js';
import { esc, toast, skeletonGrid, emptyState, deadlineChip, formatDate } from '../ui.js';
import { api } from '../api.js';

export async function renderCompetitions(root) {
  let status = 'upcoming';
  let category = '';
  let mode = '';

  root.innerHTML = `
  <div class="container-x" style="padding-top:1.5rem">
    <h2 style="margin-bottom:1rem">${esc(t('competitions.title'))}</h2>
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.75rem" id="status-row">
      ${['ongoing','upcoming','past'].map((s) => `<button class="chip ${s === status ? 'active' : ''}" data-status="${s}">${esc(t('competitions.' + s))}</button>`).join('')}
    </div>
    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem">
      <select class="input" id="f-cat" style="width:auto">
        <option value="">${esc(t('common.all'))}</option>
        <option value="hackathon">${esc(t('competitions.hackathon'))}</option>
        <option value="olympiad">${esc(t('competitions.olympiad'))}</option>
      </select>
      <select class="input" id="f-mode" style="width:auto">
        <option value="">${esc(t('common.all'))}</option>
        <option value="online">${esc(t('competitions.online'))}</option>
        <option value="offline">${esc(t('competitions.offline'))}</option>
        <option value="hybrid">${esc(t('competitions.hybrid'))}</option>
      </select>
    </div>
    <div id="list">${skeletonGrid(6)}</div>
  </div>`;

  async function load() {
    root.querySelector('#list').innerHTML = skeletonGrid(6);
    const params = new URLSearchParams({ status });
    if (category) params.set('type', category);
    if (mode) params.set('mode', mode);
    try {
      const res = await api.get(`/competitions?${params}`);
      render(res.data || []);
    } catch {
      root.querySelector('#list').innerHTML = emptyState(t('common.error'), { icon: '⚠️' });
    }
  }

  function render(items) {
    const el = root.querySelector('#list');
    if (!items.length) { el.innerHTML = emptyState(t('competitions.empty'), { icon: '🏆' }); return; }
    el.innerHTML = `<div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
      ${items.map((c) => `
        <div class="card card-hover" style="padding:1.15rem;display:flex;flex-direction:column">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem">
            <span class="badge badge-accent">${esc(c.type || '')}</span>
            <span class="badge badge-muted">${esc(t('competitions.' + (c.mode || 'online')))}</span>
          </div>
          <h3 style="font-size:1.05rem;margin:0.5rem 0 0.35rem">${esc(c._l?.name || c.name)}</h3>
          <p class="caption text-muted">${esc(c.organizer || '')}</p>
          <div class="small" style="margin:0.5rem 0;display:flex;flex-direction:column;gap:0.2rem">
            <span>🗓 ${formatDate(c.startDate)} → ${formatDate(c.endDate)}</span>
            ${c.prizeDetails ? `<span>🏅 ${esc(c.prizeDetails)}</span>` : ''}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;margin-top:auto;padding-top:0.5rem">
            ${deadlineChip(c.registrationDeadline)}
            ${c.registrationUrl ? `<a href="${esc(c.registrationUrl)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">${esc(t('competitions.register'))}</a>` : ''}
          </div>
        </div>`).join('')}</div>`;
  }

  root.querySelectorAll('#status-row .chip').forEach((c) =>
    c.addEventListener('click', () => {
      root.querySelectorAll('#status-row .chip').forEach((x) => x.classList.remove('active'));
      c.classList.add('active');
      status = c.dataset.status;
      load();
    })
  );
  root.querySelector('#f-cat').addEventListener('change', (e) => { category = e.target.value; load(); });
  root.querySelector('#f-mode').addEventListener('change', (e) => { mode = e.target.value; load(); });

  load();
}
