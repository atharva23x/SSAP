import { t } from '../i18n.js';
import { esc, toast, emptyState, spinner } from '../ui.js';
import { api } from '../api.js';
import { getUser, setUser, logout } from '../store.js';

const STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal','Delhi'];
const CATEGORIES = ['General','EWS','OBC','SC','ST'];
const CLASSES = ['10th','12th','UG','PG'];

export async function renderProfile(root) {
  const user = getUser();
  let tab = 'personal';

  root.innerHTML = `
  <div class="container-x" style="padding-top:1.5rem;max-width:820px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem">
      <h2 style="margin:0">${esc(t('profile.title'))}</h2>
      <button class="btn btn-danger btn-sm" id="profile-logout">🚪 ${esc(t('nav.logout'))}</button>
    </div>
    <div class="tabs" style="margin-bottom:1.25rem" id="tabs">
      ${[['personal','profile.personalInfo'],['docs','profile.myDocuments'],['schemes','profile.savedSchemes'],['exams','profile.savedExams'],['prefs','profile.preferences'],['security','profile.security']]
        .map(([k, label], i) => `<button class="tab ${i === 0 ? 'active' : ''}" data-tab="${k}">${esc(t(label))}</button>`).join('')}
    </div>
    <div id="panel"></div>
  </div>`;

  const panel = root.querySelector('#panel');
  root.querySelector('#profile-logout').onclick = async () => {
    if (!confirm(t('profile.confirmLogout') || 'Log out of your account?')) return;
    await logout();
    location.hash = '/';
  };
  root.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => {
    root.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    b.classList.add('active');
    tab = b.dataset.tab;
    renderTab();
  }));

  function renderTab() {
    if (tab === 'personal') return renderPersonal();
    if (tab === 'docs') return renderDocs();
    if (tab === 'schemes') return renderSaved('schemes');
    if (tab === 'exams') return renderSaved('exams');
    if (tab === 'prefs') return renderPrefs();
    if (tab === 'security') return renderSecurity();
  }

  function renderPersonal() {
    const u = user || {};
    panel.innerHTML = `
    <form class="card" style="padding:1.5rem" id="personal-form">
      <div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
        <div class="field"><label class="label">${esc(t('auth.name'))}</label><input class="input" id="p-name" value="${esc(u.name || '')}" /></div>
        <div class="field"><label class="label">${esc(t('auth.phone'))}</label><input class="input" id="p-phone" value="${esc(u.phone || '')}" /></div>
        <div class="field"><label class="label">${esc(t('signup.dob'))}</label><input class="input" type="date" id="p-dob" value="${esc((u.dob || '').slice(0, 10))}" /></div>
        <div class="field"><label class="label">${esc(t('signup.gender'))}</label><select class="input" id="p-gender">${['male','female','other'].map((g) => `<option value="${g}" ${u.gender === g ? 'selected' : ''}>${esc(t('signup.' + g))}</option>`).join('')}</select></div>
        <div class="field"><label class="label">${esc(t('signup.state'))}</label><select class="input" id="p-state">${STATES.map((s) => `<option ${u.state === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
        <div class="field"><label class="label">${esc(t('signup.district'))}</label><input class="input" id="p-district" value="${esc(u.district || '')}" /></div>
        <div class="field"><label class="label">${esc(t('signup.category'))}</label><select class="input" id="p-category">${CATEGORIES.map((c) => `<option ${u.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div class="field"><label class="label">${esc(t('signup.classLevel'))}</label><select class="input" id="p-class">${CLASSES.map((c) => `<option ${u.classLevel === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        <div class="field"><label class="label">${esc(t('signup.annualIncome'))}</label><input class="input" type="number" id="p-income" value="${u.annualIncome ?? 0}" /></div>
      </div>
      <button class="btn btn-primary" type="submit" style="margin-top:0.5rem">${esc(t('profile.saveChanges'))}</button>
    </form>`;
    panel.querySelector('#personal-form').onsubmit = async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true; btn.innerHTML = spinner();
      try {
        const res = await api.put('/profile', {
          name: panel.querySelector('#p-name').value,
          phone: panel.querySelector('#p-phone').value,
          dob: panel.querySelector('#p-dob').value,
          gender: panel.querySelector('#p-gender').value,
          state: panel.querySelector('#p-state').value,
          district: panel.querySelector('#p-district').value,
          category: panel.querySelector('#p-category').value,
          classLevel: panel.querySelector('#p-class').value,
          annualIncome: Number(panel.querySelector('#p-income').value || 0),
        });
        setUser(res.user);
        toast(t('profile.savedSuccess'), 'success');
      } catch { toast(t('common.error'), 'error'); }
      btn.disabled = false; btn.textContent = t('profile.saveChanges');
    };
  }

  async function renderDocs() {
    const u = getUser() || {};
    panel.innerHTML = `
    <div class="card" style="padding:1.5rem">
      <h3 style="margin-top:0">${esc(t('profile.myDocuments'))}</h3>
      <div id="doc-rows"></div>
      <div class="divider"></div>
      <form id="upload-form" style="display:flex;gap:0.5rem;flex-wrap:wrap;align-items:flex-end">
        <div style="flex:1;min-width:180px"><label class="label">${esc(t('schemes.requiredDocuments'))}</label><input class="input" id="up-type" placeholder="Income Certificate" required /></div>
        <input type="file" id="up-file" accept=".pdf,.jpg,.jpeg,.png" class="input" style="flex:1;min-width:180px;padding:0.5rem" />
        <button class="btn btn-primary" type="submit">${esc(t('btn.upload'))}</button>
      </form>
      <p class="hint">PDF / JPG / PNG · max 5MB</p>
    </div>`;
    renderDocRows(u.documents || []);
    function renderDocRows(docs) {
      const el = panel.querySelector('#doc-rows');
      if (!docs.length) { el.innerHTML = emptyState(t('common.none'), { icon: '📄' }); return; }
      el.innerHTML = docs.map((d) => `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;padding:0.6rem 0;border-bottom:1px solid var(--border)">
          <div style="display:flex;align-items:center;gap:0.6rem"><span>${d.verified ? '✅' : '🟡'}</span><span>${esc(d.type)}</span></div>
          <button class="btn btn-ghost btn-sm" data-del="${esc(d.type)}">🗑</button>
        </div>`).join('');
      el.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
        await api.del(`/profile/documents/${encodeURIComponent(b.dataset.del)}`);
        const fresh = (await api.get('/auth/me')).user;
        setUser(fresh);
        renderDocRows(fresh.documents || []);
        toast(t('common.success'), 'success');
      }));
    }
    panel.querySelector('#upload-form').onsubmit = async (e) => {
      e.preventDefault();
      const type = panel.querySelector('#up-type').value.trim();
      const file = panel.querySelector('#up-file').files[0];
      if (!type || !file) return toast('Type and file required', 'warning');
      if (file.size > 5 * 1024 * 1024) return toast('Max 5MB', 'error');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      try {
        const res = await api.post('/profile/documents', fd);
        const fresh = (await api.get('/auth/me')).user;
        setUser(fresh);
        renderDocRows(res.documents || fresh.documents || []);
        toast(t('common.success'), 'success');
      } catch (err) { toast(err.message || t('common.error'), 'error'); }
    };
  }

  async function renderSaved(kind) {
    panel.innerHTML = `<div class="card" style="padding:1.5rem">${esc(t('common.loading'))}</div>`;
    try {
      const res = await api.get('/profile/saved');
      const items = res.data[kind] || [];
      if (!items.length) { panel.innerHTML = `<div class="card" style="padding:1.5rem">${emptyState(t('profile.emptySaved'), { icon: '🔖' })}</div>`; return; }
      panel.innerHTML = `<div class="card" style="padding:1.5rem">${items.map((i) => `
        <a href="${kind === 'schemes' ? '#/schemes/' + i._id : '#/exams'}" style="display:flex;justify-content:space-between;padding:0.6rem 0;color:inherit;text-decoration:none;border-bottom:1px solid var(--border)">
          <span>${esc(i._l?.name || i.name)}</span><span class="badge badge-muted">${esc(i.provider || i.stream || '')}</span>
        </a>`).join('')}</div>`;
    } catch { panel.innerHTML = `<div class="card" style="padding:1.5rem">${emptyState(t('common.error'))}</div>`; }
  }

  async function renderPrefs() {
    const u = getUser() || {};
    const prefs = u.notificationPrefs || {};
    panel.innerHTML = `
    <div class="card" style="padding:1.5rem">
      <h3 style="margin-top:0">${esc(t('profile.preferences'))}</h3>
      <div class="field"><label class="label">${esc(t('common.language'))}</label>
        <select class="input" id="pref-lang">${[['en','English'],['hi','हिंदी'],['mr','मराठी'],['ta','தமிழ்'],['te','తెలుగు'],['bn','বাংলা'],['gu','ગુજરાતી']].map(([c, l]) => `<option value="${c}" ${u.preferredLanguage === c ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      <h4>${esc(t('profile.notificationPrefs'))}</h4>
      ${[['deadline','notifications.deadline'],['newScheme','notifications.newScheme'],['exam','notifications.exam']].map(([k, label]) => `
        <label style="display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0"><input type="checkbox" data-pref="${k}" ${prefs[k] !== false ? 'checked' : ''} /> ${esc(t(label))}</label>`).join('')}
      <button class="btn btn-primary" id="save-prefs" style="margin-top:1rem">${esc(t('profile.saveChanges'))}</button>
    </div>`;
    panel.querySelector('#save-prefs').onclick = async () => {
      const notificationPrefs = {};
      panel.querySelectorAll('[data-pref]').forEach((c) => (notificationPrefs[c.dataset.pref] = c.checked));
      try {
        const res = await api.put('/profile', { preferredLanguage: panel.querySelector('#pref-lang').value, notificationPrefs });
        setUser(res.user);
        toast(t('profile.savedSuccess'), 'success');
      } catch { toast(t('common.error'), 'error'); }
    };
  }

  function renderSecurity() {
    panel.innerHTML = `
    <div class="card" style="padding:1.5rem;margin-bottom:1rem">
      <h3 style="margin-top:0">${esc(t('profile.changePassword'))}</h3>
      <form id="pw-form">
        <div class="field"><label class="label">${esc(t('profile.currentPassword'))}</label><input class="input" type="password" id="cur-pw" required /></div>
        <div class="field"><label class="label">${esc(t('profile.newPassword'))}</label><input class="input" type="password" id="new-pw" required minlength="6" /></div>
        <button class="btn btn-primary" type="submit">${esc(t('profile.changePassword'))}</button>
      </form>
    </div>
    <div class="card" style="padding:1.5rem">
      <h3 style="margin-top:0">${esc(t('nav.logout'))}</h3>
      <div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        <button class="btn btn-ghost" id="logout-all">${esc(t('profile.logoutAllDevices'))}</button>
        <button class="btn btn-danger" id="logout-one">${esc(t('nav.logout'))}</button>
      </div>
    </div>`;
    panel.querySelector('#pw-form').onsubmit = async (e) => {
      e.preventDefault();
      try {
        await api.put('/profile/password', { currentPassword: panel.querySelector('#cur-pw').value, newPassword: panel.querySelector('#new-pw').value });
        toast(t('common.success'), 'success');
        e.target.reset();
      } catch { toast(t('msg.invalidCreds'), 'error'); }
    };
    panel.querySelector('#logout-all').onclick = async () => {
      const { api: a } = await import('../api.js');
      await a.post('/auth/logout-all');
      await logout(); location.hash = '/';
    };
    panel.querySelector('#logout-one').onclick = async () => { await logout(); location.hash = '/'; };
  }

  renderTab();
}
