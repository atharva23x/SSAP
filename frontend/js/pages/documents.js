import { t } from '../i18n.js';
import { esc, toast, emptyState, skeletonList } from '../ui.js';
import { api } from '../api.js';

export async function renderDocuments(root) {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const presetScheme = params.get('scheme');

  root.innerHTML = `
  <div class="container-x" style="padding-top:1.5rem">
    <h2 style="margin-bottom:0.35rem">${esc(t('documents.title'))}</h2>
    <p class="text-muted" style="margin-bottom:1.25rem">${esc(t('documents.subtitle'))}</p>

    <div class="card" style="padding:1.25rem;margin-bottom:1.25rem">
      <label class="label" for="scheme-select">${esc(t('documents.selectScheme'))}</label>
      <select class="input" id="scheme-select"><option value="">— ${esc(t('common.selectLanguage'))} —</option></select>
    </div>

    <div id="gap-result"></div>
  </div>`;

  const select = root.querySelector('#scheme-select');
  const result = root.querySelector('#gap-result');

  // Populate schemes the user is eligible/action-needed for
  try {
    const res = await api.get('/schemes/match?limit=100');
    const list = (res.data || []).filter((s) => s.status !== 'not_eligible');
    select.innerHTML = `<option value="">— ${esc(t('common.selectLanguage'))} —</option>` +
      list.map((s) => `<option value="${s._id}">${esc(s._l?.name || s.name)}</option>`).join('');
    if (presetScheme) { select.value = presetScheme; loadGap(); }
  } catch { /* ignore */ }

  select.addEventListener('change', loadGap);

  async function loadGap() {
    const id = select.value;
    if (!id) { result.innerHTML = ''; return; }
    result.innerHTML = `<div class="card" style="padding:1.25rem">${skeletonList(4)}</div>`;
    try {
      const res = await api.get(`/documents/gap?schemeId=${id}`);
      const d = res.data;
      const missing = d.requiredDocuments.filter((r) => r.status === 'missing');
      result.innerHTML = `
        <div class="card" style="padding:1.5rem;margin-bottom:1.25rem">
          <h3 style="margin:0 0 0.25rem">${esc(t('documents.gapFor'))}: ${esc(d.schemeName)}</h3>
          <p class="${missing.length ? 'text-danger' : 'text-success'}" style="margin:0 0 1rem">
            ${missing.length ? `${missing.length} ${esc(t('documents.missingCount'))}` : `✅ ${esc(t('documents.allSet'))}`}
          </p>
          <ul style="list-style:none;padding:0;margin:0">
            ${d.requiredDocuments.map((r) => `
              <li style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;padding:0.65rem 0;border-bottom:1px solid var(--border)">
                <div style="display:flex;align-items:center;gap:0.6rem">
                  <span style="font-size:1.1rem">${r.status === 'missing' ? '❌' : r.status === 'verified' ? '✅' : '🟡'}</span>
                  <span>${esc(r.docType)}</span>
                </div>
                <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
                  <a class="btn btn-ghost btn-sm" href="#/offices?doc=${encodeURIComponent(r.docType)}" title="${esc(t('offices.showOnMap'))}">🗺️</a>
                  ${r.status === 'missing' ? `<button class="btn btn-secondary btn-sm" data-guide="${esc(r.docType)}">${esc(t('documents.guide'))}</button>` : ''}
                  <button class="btn btn-ghost btn-sm" data-obtain="${esc(r.docType)}">${esc(t('documents.markObtained'))}</button>
                </div>
              </li>`).join('')}
          </ul>
          <div style="margin-top:1rem;display:flex;gap:0.5rem;flex-wrap:wrap">
            <a href="#/offices?doc=${encodeURIComponent(missing[0]?.docType || 'Income Certificate')}" class="btn btn-primary btn-sm">📍 ${esc(t('documents.findOffice'))}</a>
          </div>
        </div>
        <div id="guide-slot"></div>`;

      result.querySelectorAll('[data-obtain]').forEach((b) =>
        b.addEventListener('click', async () => {
          try {
            await api.post('/documents/mark', { docType: b.dataset.obtain });
            toast(t('documents.obtained'), 'success');
            loadGap();
          } catch { toast(t('common.error'), 'error'); }
        })
      );
      result.querySelectorAll('[data-guide]').forEach((b) =>
        b.addEventListener('click', () => loadGuide(b.dataset.guide))
      );
    } catch (err) {
      result.innerHTML = emptyState(t('common.error'), { icon: '⚠️' });
    }
  }

  async function loadGuide(docType) {
    const slot = root.querySelector('#guide-slot');
    slot.innerHTML = `<div class="card" style="padding:1.25rem">${skeletonList(3)}</div>`;
    try {
      const res = await api.get(`/documents/guide/${encodeURIComponent(docType)}`);
      const g = res.data;
      slot.innerHTML = `
        <div class="card" style="padding:1.5rem">
          <h3 style="margin:0 0 1rem">📘 ${esc(g.docTypeDisplay || g.docType)}</h3>
          ${g.summary ? `<p class="text-muted small">${esc(g.summary)}</p>` : ''}
          <div style="margin:1rem 0">
            ${(g.steps || []).map((s) => `
              <div class="accordion-item">
                <div class="accordion-head"><span>${esc(s.title)}</span><span class="accordion-chevron">▾</span></div>
                <div class="accordion-body">
                  <p class="small text-muted">${esc(s.description || '')}</p>
                  <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.5rem">
                    ${s.officeType ? `<a class="badge badge-primary" style="text-decoration:none" href="#/offices?type=${encodeURIComponent(s.officeType)}" title="${esc(t('offices.showOnMap'))}">🏢 ${esc(s.officeType)} · 🗺️</a>` : ''}
                    ${s.fee ? `<span class="badge badge-muted">💰 ${esc(s.fee)}</span>` : ''}
                    ${s.timeline ? `<span class="badge badge-muted">⏱ ${esc(s.timeline)}</span>` : ''}
                  </div>
                </div>
              </div>`).join('')}
          </div>
          ${g.requiredProofs?.length ? `<div><strong class="small">${esc(t('documents.requiredProofs'))}:</strong><div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.4rem">${g.requiredProofs.map((p) => `<span class="badge badge-muted">${esc(p)}</span>`).join('')}</div></div>` : ''}
        </div>`;
      slot.querySelectorAll('.accordion-head').forEach((h) =>
        h.addEventListener('click', () => h.parentElement.classList.toggle('open'))
      );
      slot.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {
      slot.innerHTML = emptyState(t('common.noResults'), { icon: '📄' });
    }
  }
}
