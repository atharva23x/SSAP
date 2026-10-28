import { t } from '../i18n.js';
import { esc, toast, emptyState, skeletonList } from '../ui.js';
import { api } from '../api.js';

const ICONS = { deadline: '⏳', newScheme: '🎓', hackathon: '🏆', exam: '📝', system: '🔔', document: '📄' };

export async function renderNotifications(root) {
  let filter = '';

  root.innerHTML = `
  <div class="container-x" style="padding-top:1.5rem;max-width:760px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap">
      <h2 style="margin:0">${esc(t('notifications.title'))}</h2>
      <div style="display:flex;gap:0.4rem">
        <button class="btn btn-ghost btn-sm" id="read-all">${esc(t('btn.markAllRead'))}</button>
        <button class="btn btn-ghost btn-sm" id="clear-all">${esc(t('btn.clearAll'))}</button>
      </div>
    </div>
    <div class="chip-row" style="margin-bottom:1rem" id="filters">
      <button class="chip active" data-f="">${esc(t('notifications.all'))}</button>
      <button class="chip" data-f="unread">${esc(t('notifications.unread'))}</button>
      <button class="chip" data-f="deadline">${esc(t('notifications.deadline'))}</button>
      <button class="chip" data-f="newScheme">${esc(t('notifications.newScheme'))}</button>
      <button class="chip" data-f="exam">${esc(t('notifications.exam'))}</button>
      <button class="chip" data-f="hackathon">${esc(t('notifications.hackathon'))}</button>
    </div>
    <div id="list">${skeletonList(5)}</div>
  </div>`;

  async function load() {
    root.querySelector('#list').innerHTML = skeletonList(5);
    const params = new URLSearchParams({ limit: 50 });
    if (filter === 'unread') params.set('unreadOnly', 'true');
    else if (filter) params.set('type', filter);
    try {
      const res = await api.get(`/notifications?${params}`);
      render(res.data || []);
    } catch {
      root.querySelector('#list').innerHTML = emptyState(t('common.error'), { icon: '⚠️' });
    }
  }

  function render(items) {
    const el = root.querySelector('#list');
    if (!items.length) { el.innerHTML = emptyState(t('notifications.empty'), { icon: '🔔' }); return; }
    el.innerHTML = items.map((n) => `
      <div class="card" style="padding:1rem;margin-bottom:0.65rem;border-left:4px solid ${n.read ? 'var(--border)' : 'var(--primary)'};${n.read ? 'opacity:0.75' : ''}" data-id="${n._id}">
        <div style="display:flex;gap:0.75rem;align-items:flex-start">
          <span style="font-size:1.4rem">${ICONS[n.type] || '🔔'}</span>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;gap:0.5rem;align-items:flex-start">
              <strong style="font-size:0.98rem">${esc(n._l?.title || n.title)}</strong>
              ${n.read ? '' : '<span class="badge badge-primary">•</span>'}
            </div>
            <p class="small text-muted" style="margin:0.25rem 0">${esc(n.body || '')}</p>
            <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap">
              <span class="caption text-muted">${new Date(n.createdAt).toLocaleString()}</span>
              ${n.link ? `<a href="#${esc(n.link)}" class="caption text-primary" style="text-decoration:none">${esc(t('btn.viewDetails'))} →</a>` : ''}
              ${n.read ? '' : `<button class="btn btn-ghost btn-sm" data-read="${n._id}">${esc(t('notifications.markRead'))}</button>`}
            </div>
          </div>
        </div>
      </div>`).join('');
    el.querySelectorAll('[data-read]').forEach((b) => b.addEventListener('click', async () => {
      await api.patch(`/notifications/${b.dataset.read}/read`);
      load();
    }));
    el.querySelectorAll('[data-id]').forEach((c) => c.addEventListener('click', async (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
      if (!c.querySelector('.badge-primary')) return;
      await api.patch(`/notifications/${c.dataset.id}/read`);
    }));
  }

  root.querySelectorAll('#filters .chip').forEach((c) => c.addEventListener('click', () => {
    root.querySelectorAll('#filters .chip').forEach((x) => x.classList.remove('active'));
    c.classList.add('active');
    filter = c.dataset.f;
    load();
  }));
  root.querySelector('#read-all').onclick = async () => { await api.patch('/notifications/read-all'); toast(t('common.success'), 'success'); load(); };
  root.querySelector('#clear-all').onclick = async () => { await api.del('/notifications/clear'); toast(t('common.success'), 'success'); load(); };

  load();
}
