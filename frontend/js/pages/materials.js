import { t } from '../i18n.js';
import { esc, toast, skeletonGrid, emptyState } from '../ui.js';
import { api } from '../api.js';

const TYPES = ['notes','video','pyq','mock'];
const CLASSES = ['10th','12th','UG','PG'];

export async function renderMaterials(root) {
  const filters = { subject: '', classLevel: '', type: '', language: '' };
  let q = '';

  root.innerHTML = `
  <div class="container-x" style="padding-top:1.5rem">
    <h2 style="margin-bottom:1rem">${esc(t('materials.title'))}</h2>
    <input class="input" id="q" placeholder="${esc(t('materials.searchPlaceholder'))}" style="margin-bottom:0.75rem" />
    <div style="display:grid;gap:0.5rem;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin-bottom:1rem">
      <select class="input" id="f-type"><option value="">${esc(t('materials.type'))}</option>${TYPES.map((x) => `<option value="${x}">${esc(t('materials.' + x))}</option>`).join('')}</select>
      <select class="input" id="f-class"><option value="">${esc(t('common.all'))}</option>${CLASSES.map((x) => `<option>${x}</option>`).join('')}</select>
      <select class="input" id="f-lang"><option value="">${esc(t('materials.language'))}</option><option value="en">English</option><option value="hi">हिंदी</option><option value="mr">मराठी</option><option value="ta">தமிழ்</option><option value="te">తెలుగు</option><option value="bn">বাংলা</option><option value="gu">ગુજરાતી</option></select>
    </div>
    <div id="list">${skeletonGrid(8)}</div>
  </div>`;

  async function load() {
    root.querySelector('#list').innerHTML = skeletonGrid(8);
    const params = new URLSearchParams({ limit: 60 });
    if (q) params.set('q', q);
    if (filters.type) params.set('type', filters.type);
    if (filters.classLevel) params.set('class', filters.classLevel);
    if (filters.language) params.set('language', filters.language);
    try {
      const res = await api.get(`/materials?${params}`);
      render(res.data || []);
    } catch {
      root.querySelector('#list').innerHTML = emptyState(t('common.error'), { icon: '⚠️' });
    }
  }

  function render(items) {
    const el = root.querySelector('#list');
    if (!items.length) { el.innerHTML = emptyState(t('materials.empty'), { icon: '📚' }); return; }
    el.innerHTML = `<div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
      ${items.map((m) => `
        <div class="card card-hover" style="padding:0;display:flex;flex-direction:column;overflow:hidden">
          <div style="height:96px;background:linear-gradient(135deg,var(--primary),var(--primary-light));display:flex;align-items:center;justify-content:center;font-size:2rem">
            ${m.type === 'video' ? '🎬' : m.type === 'pyq' ? '📄' : m.type === 'mock' ? '🧪' : '📘'}
          </div>
          <div style="padding:0.9rem;display:flex;flex-direction:column;flex:1">
            <div style="display:flex;gap:0.3rem;flex-wrap:wrap;margin-bottom:0.4rem">
              <span class="badge badge-primary">${esc(t('materials.' + (m.type || 'notes')))}</span>
              ${m.free ? `<span class="badge badge-success">${esc(t('materials.free'))}</span>` : ''}
            </div>
            <h3 style="font-size:0.98rem;margin:0 0 0.25rem;line-height:1.3">${esc(m.title)}</h3>
            <p class="caption text-muted">${esc(m.subject || '')} · ${esc(m.classLevel || '')}</p>
            <p class="caption text-muted">${esc(t('materials.provider'))}: ${esc(m.provider || '')}</p>
            ${m.url ? `<a href="${esc(m.url)}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm" style="margin-top:auto">${esc(t('materials.open'))} ↗</a>` : ''}
          </div>
        </div>`).join('')}</div>`;
  }

  let timer;
  root.querySelector('#q').addEventListener('input', (e) => { clearTimeout(timer); timer = setTimeout(() => { q = e.target.value; load(); }, 350); });
  root.querySelector('#f-type').addEventListener('change', (e) => { filters.type = e.target.value; load(); });
  root.querySelector('#f-class').addEventListener('change', (e) => { filters.classLevel = e.target.value; load(); });
  root.querySelector('#f-lang').addEventListener('change', (e) => { filters.language = e.target.value; load(); });

  load();
}
