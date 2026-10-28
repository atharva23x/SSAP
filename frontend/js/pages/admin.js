import { t } from '../i18n.js';
import { esc, toast, emptyState, skeletonList, modal, confirmDialog, spinner } from '../ui.js';
import { api } from '../api.js';

export async function renderAdmin(root) {
  let tab = 'stats';

  root.innerHTML = `
  <div class="container-x" style="padding-top:1.5rem">
    <h2 style="margin-bottom:1rem">🛠 ${esc(t('admin.title'))}</h2>
    <div class="tabs" style="margin-bottom:1.25rem" id="tabs">
      ${[['stats','admin.stats'],['schemes','admin.schemes'],['exams','admin.exams'],['competitions','admin.competitions'],['materials','admin.materials'],['offices','admin.offices'],['guides','admin.guides'],['users','admin.users']]
        .map(([k, l], i) => `<button class="tab ${i === 0 ? 'active' : ''}" data-tab="${k}">${esc(t(l))}</button>`).join('')}
    </div>
    <div id="panel"></div>
  </div>`;

  const panel = root.querySelector('#panel');
  root.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => {
    root.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    tab = b.dataset.tab;
    load();
  }));

  async function load() {
    panel.innerHTML = `<div class="card" style="padding:1.5rem">${skeletonList(4)}</div>`;
    try {
      if (tab === 'stats') return renderStats();
      if (tab === 'users') return renderUsers();
      return renderCrud(tab);
    } catch {
      panel.innerHTML = emptyState(t('common.error'), { icon: '⚠️' });
    }
  }

  async function renderStats() {
    const res = await api.get('/admin/stats');
    const d = res.data;
    const cards = [
      [t('admin.totalUsers'), d.users, '👥', 'var(--primary)'],
      [t('admin.activeSchemes'), d.schemes, '🎓', 'var(--success)'],
      [t('admin.exams'), d.exams, '📝', 'var(--accent)'],
      [t('admin.competitions'), d.competitions, '🏆', '#8b5cf6'],
      [t('admin.materials'), d.materials, '📚', '#0ea5e9'],
      [t('admin.offices'), d.offices, '📍', '#ef4444'],
      [t('admin.aiQueries'), d.aiQueries, '🤖', '#64748b'],
      [t('admin.unreadAlerts'), d.unreadAlerts, '🔔', '#f43f5e'],
    ];
    panel.innerHTML = `<div style="display:grid;gap:0.75rem;grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
      ${cards.map(([label, value, icon, color]) => `
        <div class="card" style="padding:1rem">
          <div style="font-size:1.5rem">${icon}</div>
          <div style="font-size:1.75rem;font-weight:700;color:${color};line-height:1.2">${value ?? '—'}</div>
          <div class="caption text-muted">${esc(label)}</div>
        </div>`).join('')}
    </div>`;
  }

  async function renderUsers() {
    const res = await api.get('/admin/users');
    const users = res.data || [];
    panel.innerHTML = `<div class="card" style="padding:1.25rem;overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
        <thead><tr style="text-align:left;border-bottom:2px solid var(--border)">
          <th style="padding:0.5rem">Name</th><th>Email</th><th>State</th><th>Category</th><th>Class</th><th>Docs</th><th>Role</th>
        </tr></thead>
        <tbody>${users.map((u) => `
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:0.5rem">${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.state || '—')}</td>
            <td>${esc(u.category || '—')}</td><td>${esc(u.classLevel || '—')}</td>
            <td>${(u.documents || []).length}</td><td><span class="badge badge-primary">${esc(u.role)}</span></td>
          </tr>`).join('')}</tbody>
      </table>
    </div>`;
  }

  const SCHEMES_FIELDS = [
    ['name','Name','text'],['provider','Provider','text'],['type','Type (central/state/private)','text'],
    ['state','State (or ALL)','text'],['description','Description','textarea'],['applicationUrl','Application URL','text'],
    ['deadline','Deadline','date'],['requiredDocuments','Required Docs (comma separated)','text'],
  ];

  function renderCrud(kind) {
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem">
        <span class="text-muted small" id="count"></span>
        <button class="btn btn-primary btn-sm" id="add-btn">＋ ${esc(t('admin.addNew'))}</button>
      </div>
      <div id="rows">${skeletonList(5)}</div>`;

    api.get(`/admin/${kind}?limit=50`).then((res) => {
      const items = res.data || [];
      panel.querySelector('#count').textContent = `${items.length} ${esc(t('common.results'))}`;
      const el = panel.querySelector('#rows');
      if (!items.length) { el.innerHTML = emptyState(t('common.noResults'), { icon: '🗂️' }); return; }
      el.innerHTML = `<div class="card" style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.85rem">
        <thead><tr style="text-align:left;border-bottom:2px solid var(--border)">
          <th style="padding:0.5rem">Name / Title</th><th>Type</th><th>Actions</th></tr></thead>
        <tbody>${items.map((i) => `
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:0.5rem">${esc(i.name || i.title || i.docType || i._id)}</td>
            <td>${esc(i.type || i.stream || i.category || i.docType || '—')}</td>
            <td style="display:flex;gap:0.3rem;padding:0.5rem">
              <button class="btn btn-ghost btn-sm" data-edit="${i._id}">✏️</button>
              <button class="btn btn-ghost btn-sm" data-del="${i._id}">🗑</button>
            </td>
          </tr>`).join('')}</tbody></table></div>`;

      el.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
        confirmDialog('Delete this record?', async () => {
          await api.del(`/admin/${kind}/${b.dataset.del}`);
          toast(t('common.success'), 'success'); load();
        }, { danger: true });
      }));
      el.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => {
        const item = items.find((x) => x._id === b.dataset.edit);
        openForm(kind, item, SCHEMES_FIELDS, () => load());
      }));
    }).catch(() => { panel.querySelector('#rows').innerHTML = emptyState(t('common.error'), { icon: '⚠️' }); });

    panel.querySelector('#add-btn').onclick = () => openForm(kind, null, SCHEMES_FIELDS, () => load());
  }

  function openForm(kind, item, fields, onDone) {
    const body = `<form id="crud-form">${fields.map(([key, label, type]) => `
      <div class="field">
        <label class="label">${esc(label)}</label>
        ${type === 'textarea'
          ? `<textarea class="input" name="${key}" rows="3">${esc(item?.[key] || '')}</textarea>`
          : `<input class="input" type="${type}" name="${key}" value="${esc(item?.[key] ?? '')}" />`}
      </div>`).join('')}</form>`;
    const m = modal({
      title: item ? 'Edit' : t('admin.addNew'),
      body,
      actions: [
        { label: t('common.cancel'), className: 'btn-ghost' },
        {
          label: t('common.confirm'), className: 'btn-primary',
          onClick: async (close) => {
            const form = document.getElementById('crud-form');
            const data = Object.fromEntries(new FormData(form).entries());
            if (data.requiredDocuments) data.requiredDocuments = data.requiredDocuments.split(',').map((s) => s.trim()).filter(Boolean);
            try {
              if (item) await api.put(`/admin/${kind}/${item._id}`, data);
              else await api.post(`/admin/${kind}`, data);
              toast(t('common.success'), 'success');
              close(); onDone();
            } catch (err) { toast(err.message || t('common.error'), 'error'); }
          },
        },
      ],
    });
  }

  load();
}
