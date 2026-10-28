import { t } from '../i18n.js';
import { esc, toast, spinner } from '../ui.js';
import { api } from '../api.js';
import { setUser } from '../store.js';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman & Nicobar','Chandigarh','Dadra & Nagar Haveli','Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry'];
const CATEGORIES = ['General','EWS','OBC','SC','ST'];
const CLASS_LEVELS = ['10th','12th','UG','PG'];
const LANGS = [['en','English'],['hi','हिंदी'],['mr','मराठी'],['ta','தமிழ்'],['te','తెలుగు'],['bn','বাংলা'],['gu','ગુજરાતી']];

const state = { step: 1, data: { preferredLanguage: 'en' } };

export function renderSignup(root) {
  state.step = 1;
  draw(root);

  function draw(root) {
    root.innerHTML = `
    <div style="min-height:calc(100vh - 64px);padding:1.5rem;background:linear-gradient(135deg,#eff6ff,#f8fafc)">
      <div class="card" style="max-width:560px;margin:0 auto;padding:1.75rem">
        <!-- Progress -->
        <div style="margin-bottom:1.25rem">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
            <span class="caption text-muted">${esc(t('auth.step'))} ${state.step} ${esc(t('auth.of'))} 4</span>
            <span class="caption text-primary" style="font-weight:600">${esc(t(`signup.step${state.step}`))}</span>
          </div>
          <div class="progress"><span style="width:${state.step * 25}%"></span></div>
        </div>

        <h2 style="margin:0 0 0.25rem;font-size:1.85rem">${esc(t('auth.signupTitle'))}</h2>
        <p class="text-muted small" style="margin-bottom:1.25rem">${esc(t('auth.signupSubtitle'))}</p>

        <form id="step-form">${stepBody()}</form>

        <div style="display:flex;gap:0.5rem;margin-top:1.5rem">
          ${state.step > 1 ? `<button class="btn btn-ghost" id="back-btn">← ${esc(t('btn.back'))}</button>` : ''}
          <button class="btn btn-primary" style="flex:1" id="next-btn">${state.step === 4 ? esc(t('auth.createAccount')) : esc(t('btn.continue'))} →</button>
        </div>

        <p style="text-align:center;margin-top:1.25rem;font-size:0.9rem">
          ${esc(t('auth.haveAccount'))} <a href="#/login" class="text-primary" style="font-weight:600">${esc(t('nav.login'))}</a>
        </p>
      </div>
    </div>`;

    root.querySelector('#back-btn')?.addEventListener('click', () => { collect(); state.step--; draw(root); });
    root.querySelector('#next-btn').addEventListener('click', (e) => { e.preventDefault(); next(root); });
  }

  function stepBody() {
    const d = state.data;
    if (state.step === 1) {
      return `
        <div class="field"><label class="label" for="name">${esc(t('auth.name'))}</label>
          <input class="input" id="name" value="${esc(d.name || '')}" required autocomplete="name" /></div>
        <div class="field"><label class="label" for="email">${esc(t('auth.email'))}</label>
          <input class="input" type="email" id="email" value="${esc(d.email || '')}" required autocomplete="email" /></div>
        <div class="field"><label class="label" for="phone">${esc(t('auth.phone'))}</label>
          <input class="input" id="phone" value="${esc(d.phone || '')}" autocomplete="tel" /></div>
        <div class="field"><label class="label" for="password">${esc(t('auth.password'))}</label>
          <input class="input" type="password" id="password" required autocomplete="new-password" /></div>
        <div class="field"><label class="label" for="confirm">${esc(t('auth.confirmPassword'))}</label>
          <input class="input" type="password" id="confirm" required autocomplete="new-password" /></div>`;
    }
    if (state.step === 2) {
      return `
        <div class="field"><label class="label" for="dob">${esc(t('signup.dob'))}</label>
          <input class="input" type="date" id="dob" value="${esc(d.dob || '')}" /></div>
        <div class="field"><label class="label">${esc(t('signup.gender'))}</label>
          <div style="display:flex;gap:0.5rem">
            ${['male','female','other'].map((g) => `<label class="chip ${d.gender === g ? 'active' : ''}" style="flex:1;justify-content:center"><input type="radio" name="gender" value="${g}" ${d.gender === g ? 'checked' : ''} class="sr-only" /> ${esc(t(`signup.${g}`))}</label>`).join('')}
          </div></div>
        <div class="field"><label class="label" for="state">${esc(t('signup.state'))}</label>
          <select class="input" id="state">${STATES.map((s) => `<option ${d.state === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select></div>
        <div class="field"><label class="label" for="district">${esc(t('signup.district'))}</label>
          <input class="input" id="district" value="${esc(d.district || '')}" /></div>
        <div class="field"><label class="label" for="category">${esc(t('signup.category'))}</label>
          <select class="input" id="category">${CATEGORIES.map((c) => `<option ${d.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
        <div class="field"><label class="label" for="classLevel">${esc(t('signup.classLevel'))}</label>
          <select class="input" id="classLevel">${CLASS_LEVELS.map((c) => `<option ${d.classLevel === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>`;
    }
    if (state.step === 3) {
      const inc = d.annualIncome ?? 100000;
      return `
        <div class="field"><label class="label" for="annualIncome">${esc(t('signup.annualIncome'))}</label>
          <div style="display:flex;align-items:center;gap:1rem">
            <input type="range" id="income-range" min="0" max="1000000" step="5000" value="${inc}" style="flex:1" />
            <input class="input" type="number" id="annualIncome" value="${inc}" style="width:140px" />
          </div>
          <div class="hint">₹<span id="income-fmt">${Number(inc).toLocaleString('en-IN')}</span> / year</div></div>
        <div class="field"><label style="display:flex;align-items:center;gap:0.5rem;font-size:0.9rem">
          <input type="checkbox" id="aadhaarLinked" ${d.aadhaarLinked ? 'checked' : ''} /> ${esc(t('signup.aadhaarLinked'))} <span class="text-muted">(${esc(t('common.optional'))})</span>
        </label></div>
        <div class="card" style="padding:1rem;background:var(--soft-blue);border:none">
          <p class="small text-muted">Income helps the Eligibility Engine match you to need-based scholarships. It stays private.</p>
        </div>`;
    }
    return `
      <div class="field"><label class="label">${esc(t('signup.preferredLanguage'))}</label>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:0.5rem">
          ${LANGS.map(([code, label]) => `
            <label class="chip ${(d.preferredLanguage || 'en') === code ? 'active' : ''}" style="justify-content:center">
              <input type="radio" name="lang" value="${code}" ${(d.preferredLanguage || 'en') === code ? 'checked' : ''} class="sr-only" /> ${label}
            </label>`).join('')}
        </div></div>
      <div class="field">
        <label class="label">${esc(t('signup.uploadDocs'))}</label>
        <div id="dropzone" style="border:2px dashed var(--border);border-radius:12px;padding:1.5rem;text-align:center;cursor:pointer">
          <div style="font-size:1.75rem">📄</div>
          <p class="small text-muted" style="margin:0.5rem 0">${esc(t('signup.dropHere'))}</p>
          <p class="caption text-muted">${esc(t('signup.uploadHint'))}</p>
          <input type="file" id="doc-files" accept=".pdf,.jpg,.jpeg,.png" multiple hidden />
        </div>
        <div id="file-list" style="margin-top:0.75rem"></div>
      </div>`;
  }

  function bindDynamic(root) {
    if (state.step === 2) {
      root.querySelectorAll('input[name="gender"]').forEach((r) =>
        r.addEventListener('change', () => root.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c.querySelector('input')?.checked)))
      );
    }
    if (state.step === 3) {
      const range = root.querySelector('#income-range');
      const num = root.querySelector('#annualIncome');
      const fmt = root.querySelector('#income-fmt');
      range?.addEventListener('input', () => { num.value = range.value; fmt.textContent = Number(range.value).toLocaleString('en-IN'); });
      num?.addEventListener('input', () => { range.value = num.value; fmt.textContent = Number(num.value || 0).toLocaleString('en-IN'); });
    }
    if (state.step === 4) {
      root.querySelectorAll('input[name="lang"]').forEach((r) =>
        r.addEventListener('change', () => root.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c.querySelector('input')?.checked)))
      );
      const dz = root.querySelector('#dropzone');
      const input = root.querySelector('#doc-files');
      const list = root.querySelector('#file-list');
      dz.addEventListener('click', () => input.click());
      dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.style.borderColor = 'var(--primary)'; });
      dz.addEventListener('dragleave', () => (dz.style.borderColor = 'var(--border)'));
      dz.addEventListener('drop', (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); });
      input.addEventListener('change', () => handleFiles(input.files));
      function handleFiles(files) {
        [...files].forEach((f) => {
          if (f.size > 5 * 1024 * 1024) return toast('Max 5MB per file', 'error');
          const row = document.createElement('div');
          row.className = 'badge badge-muted';
          row.style.marginRight = '0.4rem';
          row.textContent = f.name;
          list.appendChild(row);
          (state.files = state.files || []).push(f);
        });
      }
    }
  }

  function collect() {
    const d = state.data;
    const g = (id) => root.querySelector(`#${id}`)?.value;
    if (state.step === 1) {
      d.name = g('name'); d.email = g('email'); d.phone = g('phone');
    } else if (state.step === 2) {
      d.dob = g('dob');
      d.gender = root.querySelector('input[name="gender"]:checked')?.value || d.gender;
      d.state = g('state'); d.district = g('district'); d.category = g('category'); d.classLevel = g('classLevel');
    } else if (state.step === 3) {
      d.annualIncome = Number(g('annualIncome') || 0);
      d.aadhaarLinked = !!root.querySelector('#aadhaarLinked')?.checked;
    } else if (state.step === 4) {
      d.preferredLanguage = root.querySelector('input[name="lang"]:checked')?.value || 'en';
    }
  }

  async function next(root) {
    collect();
    const d = state.data;
    if (state.step === 1) {
      if (!d.name || !d.email || !root.querySelector('#password')?.value) return toast('Fill all required fields', 'warning');
      if (root.querySelector('#password').value !== root.querySelector('#confirm').value) return toast('Passwords do not match', 'error');
      d.password = root.querySelector('#password').value;
      state.step = 2; draw(root); bindDynamic(root); return;
    }
    if (state.step < 4) { state.step++; draw(root); bindDynamic(root); return; }

    // Final submit
    const btn = root.querySelector('#next-btn');
    btn.disabled = true; btn.innerHTML = `${spinner()} ${esc(t('auth.createAccount'))}`;
    try {
      const res = await api.post('/auth/register', {
        name: d.name, email: d.email, password: d.password, phone: d.phone,
        preferredLanguage: d.preferredLanguage,
      });
      setUser(res.user);
      // Persist the rest of the profile
      await api.put('/profile', {
        dob: d.dob, gender: d.gender, state: d.state, district: d.district,
        category: d.category, classLevel: d.classLevel, annualIncome: d.annualIncome,
        aadhaarLinked: d.aadhaarLinked,
      }).catch(() => {});
      toast(t('msg.registered'), 'success');
      location.hash = '/dashboard';
    } catch (err) {
      toast(err.message === 'EMAIL_ALREADY_REGISTERED' ? 'Email already registered' : t('common.error'), 'error');
      btn.disabled = false; btn.textContent = `${t('auth.createAccount')} →`;
    }
  }

  bindDynamic(root);
}
