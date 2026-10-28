import { t } from '../i18n.js';
import { esc, toast, skeletonGrid, emptyState, deadlineChip, formatDate } from '../ui.js';
import { api } from '../api.js';

const STREAMS = ['JEE','NEET','MHT-CET','GATE','CLAT','CA','UPSC','SSC','Banking','Defence','Management','Olympiad'];

export async function renderExams(root) {
  let stream = '';
  let selected = null;

  root.innerHTML = `
  <div class="container-x" style="padding-top:1.5rem">
    <h2 style="margin-bottom:1rem">${esc(t('exams.title'))}</h2>
    <div class="chip-row" style="margin-bottom:1rem" id="streams">
      <button class="chip active" data-s="">${esc(t('common.all'))}</button>
      ${STREAMS.map((s) => `<button class="chip" data-s="${s}">${s}</button>`).join('')}
    </div>
    <div id="detail"></div>
    <div id="list">${skeletonGrid(6)}</div>
  </div>`;

  async function load() {
    root.querySelector('#list').innerHTML = skeletonGrid(6);
    try {
      const res = await api.get(`/exams?limit=50${stream ? '&stream=' + stream : ''}`);
      renderCards(res.data || []);
    } catch {
      root.querySelector('#list').innerHTML = emptyState(t('common.error'), { icon: '⚠️' });
    }
  }

  function renderCards(exams) {
    const el = root.querySelector('#list');
    if (!exams.length) { el.innerHTML = emptyState(t('exams.empty'), { icon: '📝' }); return; }
    el.innerHTML = `<div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
      ${exams.map((e) => `
        <div class="card card-hover" style="padding:1.15rem;display:flex;flex-direction:column">
          <span class="badge badge-accent" style="align-self:flex-start">${esc(e.stream || '')}</span>
          <h3 style="font-size:1.05rem;margin:0.5rem 0 0.35rem">${esc(e._l?.name || e.name)}</h3>
          <p class="caption text-muted">${esc(e.conductingBody || '')}</p>
          <div class="small" style="margin:0.5rem 0;display:flex;flex-direction:column;gap:0.25rem">
            <span>📅 ${esc(t('exams.examDate'))}: <strong>${formatDate(e.examDate)}</strong></span>
            <span>📝 ${esc(t('exams.regDeadline'))}: ${deadlineChip(e.registrationDeadline)}</span>
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top:auto" data-detail="${e._id}">${esc(t('exams.viewRoadmap'))}</button>
        </div>`).join('')}</div>`;
    el.querySelectorAll('[data-detail]').forEach((b) => b.addEventListener('click', () => openDetail(b.dataset.detail, exams)));
  }

  async function openDetail(id, exams) {
    const e = exams.find((x) => x._id === id);
    if (!e) return;
    selected = e;
    const d = root.querySelector('#detail');
    d.innerHTML = `
      <div class="card" style="padding:1.5rem;margin-bottom:1.25rem;border-left:4px solid var(--primary)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;flex-wrap:wrap">
          <div>
            <span class="badge badge-accent">${esc(e.stream || '')}</span>
            <h3 style="margin:0.5rem 0 0.25rem">${esc(e._l?.name || e.name)}</h3>
            <p class="small text-muted" style="margin:0">${esc(e.conductingBody || '')}</p>
          </div>
          <button class="btn btn-ghost btn-sm" id="close-detail">✕</button>
        </div>

        <div class="divider"></div>

        <!-- Timeline -->
        <h4 style="margin:0 0 0.75rem">${esc(t('exams.timeline'))}</h4>
        <div style="margin-bottom:1.25rem">
          <div class="timeline-item"><strong>${esc(t('exams.regDeadline'))}</strong><div class="caption text-muted">${formatDate(e.registrationDeadline)}</div></div>
          <div class="timeline-item"><strong>${esc(t('exams.examDate'))}</strong><div class="caption text-muted">${formatDate(e.examDate)}</div></div>
        </div>

        ${e.roadmap?.length ? `
        <h4 style="margin:0 0 0.75rem">${esc(t('exams.roadmap'))}</h4>
        <div style="margin-bottom:1.25rem">
          ${e.roadmap.map((r) => `<div class="timeline-item"><strong>${esc(r.title)}</strong>${r.months ? ` <span class="badge badge-muted">${esc(r.months)}</span>` : ''}<div class="small text-muted">${esc(r.detail || '')}</div></div>`).join('')}
        </div>` : ''}

        ${e.freeResources?.length ? `
        <h4 style="margin:0 0 0.75rem">${esc(t('exams.freeResources'))}</h4>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.25rem">
          ${e.freeResources.map((r) => `<a href="${esc(r.url || '#')}" target="_blank" rel="noopener" class="chip">${esc(r.provider || 'Free')} · ${esc(r.title)}</a>`).join('')}
        </div>` : ''}

        ${e.recommendedBooks?.length ? `
        <h4 style="margin:0 0 0.75rem">${esc(t('exams.recommendedBooks'))}</h4>
        <ul style="margin:0 0 1.25rem;padding-left:1.25rem" class="small">
          ${e.recommendedBooks.map((b) => `<li>${esc(b.title)} <span class="text-muted">— ${esc(b.author || '')}</span></li>`).join('')}
        </ul>` : ''}

        ${e.mockTests?.length ? `
        <h4 style="margin:0 0 0.75rem">${esc(t('exams.mockTests'))}</h4>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-bottom:1.25rem">
          ${e.mockTests.map((m) => `<a href="${esc(m.url || '#')}" target="_blank" rel="noopener" class="chip">${esc(m.title)}</a>`).join('')}
        </div>` : ''}

        <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
          ${e.officialUrl ? `<a href="${esc(e.officialUrl)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">${esc(t('btn.apply'))} ↗</a>` : ''}
          <button class="btn btn-secondary btn-sm" id="ics-btn">📅 ${esc(t('exams.addCalendar'))}</button>
          <button class="btn btn-ghost btn-sm" id="save-exam">🔖 ${esc(t('btn.save'))}</button>
        </div>
      </div>`;
    d.querySelector('#close-detail').onclick = () => { d.innerHTML = ''; };
    d.querySelector('#ics-btn').onclick = () => downloadICS(e);
    d.querySelector('#save-exam').onclick = async () => {
      try { await api.post(`/exams/${e._id}/save`); toast(t('btn.saved'), 'success'); } catch { toast(t('common.error'), 'error'); }
    };
    d.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  root.querySelectorAll('#streams .chip').forEach((c) =>
    c.addEventListener('click', () => {
      root.querySelectorAll('#streams .chip').forEach((x) => x.classList.remove('active'));
      c.classList.add('active');
      stream = c.dataset.s;
      root.querySelector('#detail').innerHTML = '';
      load();
    })
  );

  load();
}

function downloadICS(exam) {
  const dt = exam.examDate ? new Date(exam.examDate) : new Date();
  const fmt = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SSAP//Exam//EN', 'BEGIN:VEVENT',
    `UID:${exam._id}@ssap`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(dt)}`,
    `SUMMARY:${exam.name} — Exam Date`, `DESCRIPTION:${exam.conductingBody || ''}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${exam.name.replace(/\s+/g, '-')}.ics`;
  a.click();
  toast(t('exams.addCalendar'), 'success');
}
