import { t } from '../i18n.js';
import { esc, toast, spinner } from '../ui.js';
import { api } from '../api.js';
import { setUser } from '../store.js';

export function renderLogin(root) {
  root.innerHTML = `
  <div style="min-height:calc(100vh - 64px);display:flex;align-items:center;justify-content:center;padding:1.5rem;background:linear-gradient(135deg,#eff6ff,#f8fafc)">
    <div class="card" style="width:100%;max-width:420px;padding:2rem">
      <div style="text-align:center;margin-bottom:1.5rem">
        <div style="font-size:3.25rem;line-height:1">🎓</div>
        <div class="brand-name" style="font-size:1.4rem;margin-top:0.35rem">${esc(t('app.shortName'))}</div>
        <h2 style="margin:0.5rem 0 0.25rem">${esc(t('auth.loginTitle'))}</h2>
        <p class="text-muted small">${esc(t('auth.loginSubtitle'))}</p>
      </div>

      <form id="login-form" novalidate>
        <div class="field">
          <label class="label" for="email">${esc(t('auth.email'))}</label>
          <input class="input" type="email" id="email" name="email" autocomplete="email" required placeholder="demo@student.in" />
        </div>
        <div class="field">
          <label class="label" for="password">${esc(t('auth.password'))}</label>
          <div style="position:relative">
            <input class="input" type="password" id="password" name="password" autocomplete="current-password" required placeholder="••••••••" style="padding-right:2.75rem" />
            <button type="button" id="toggle-pw" aria-label="${esc(t('auth.showPassword'))}" style="position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted)">👁️</button>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem">
          <label style="display:flex;align-items:center;gap:0.4rem;font-size:0.85rem">
            <input type="checkbox" id="remember" /> ${esc(t('auth.rememberMe'))}
          </label>
          <a href="#" class="small text-primary" id="forgot">${esc(t('auth.forgotPassword'))}</a>
        </div>
        <button class="btn btn-primary btn-block btn-lg" type="submit" id="submit-btn">${esc(t('btn.login'))}</button>
      </form>

      <div style="text-align:center;margin:1.25rem 0;font-size:0.85rem;color:var(--muted)">${esc(t('auth.orContinue'))}</div>
      <button class="btn btn-ghost btn-block" id="google-btn">
        <span style="font-size:1.1rem">G</span> ${esc(t('auth.google'))}
      </button>

      <p style="text-align:center;margin-top:1.5rem;font-size:0.9rem">
        ${esc(t('auth.noAccount'))} <a href="#/signup" class="text-primary" style="font-weight:600">${esc(t('nav.signup'))}</a>
      </p>
      <div style="text-align:center;margin-top:1.25rem">
        <div class="caption text-muted" style="margin-bottom:0.5rem">${esc(t('auth.demoAccounts') || 'Quick demo logins — tap to fill')}</div>
        <div style="display:flex;gap:0.5rem;justify-content:center;flex-wrap:wrap">
          <button class="badge badge-primary" style="cursor:pointer;border:none" id="demo-hint" title="Demo student">🎓 demo@student.in / demo123</button>
          <button class="badge badge-muted" style="cursor:pointer;border:none" id="admin-hint" title="Admin">🛠 admin@ssap.in / admin123</button>
        </div>
      </div>
    </div>
  </div>`;

  const form = root.querySelector('#login-form');
  const btn = root.querySelector('#submit-btn');
  const pw = root.querySelector('#password');

  root.querySelector('#toggle-pw').onclick = () => {
    const showing = pw.type === 'text';
    pw.type = showing ? 'password' : 'text';
    root.querySelector('#toggle-pw').setAttribute('aria-label', showing ? t('auth.showPassword') : t('auth.hidePassword'));
  };
  const fillCreds = (email, password, label) => {
    root.querySelector('#email').value = email;
    pw.value = password;
    toast(label, 'info');
  };
  root.querySelector('#demo-hint').onclick = () => fillCreds('demo@student.in', 'demo123', 'Demo student credentials filled');
  root.querySelector('#admin-hint').onclick = () => fillCreds('admin@ssap.in', 'admin123', 'Admin credentials filled');
  root.querySelector('#google-btn').onclick = () => toast('Google sign-in is optional and not wired in this build', 'warning');
  root.querySelector('#forgot').onclick = (e) => {
    e.preventDefault();
    const email = root.querySelector('#email').value;
    if (!email) return toast('Enter your email first', 'warning');
    api.post('/auth/forgot-password', { email })
      .then(() => toast('If registered, a reset link was sent', 'success'))
      .catch(() => toast(t('common.error'), 'error'));
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const email = root.querySelector('#email').value.trim();
    const password = pw.value;
    if (!email || !password) return toast('Enter email and password', 'warning');

    btn.disabled = true;
    btn.innerHTML = `${spinner()} ${esc(t('btn.login'))}`;
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.user);
      toast(t('msg.loggedIn'), 'success');
      location.hash = '/dashboard';
    } catch (err) {
      toast(err.status === 401 ? t('msg.invalidCreds') : t('common.error'), 'error');
      btn.disabled = false;
      btn.textContent = t('btn.login');
    }
  };
}
