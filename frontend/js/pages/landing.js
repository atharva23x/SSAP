import { t } from '../i18n.js';
import { esc } from '../ui.js';
import { isLoggedIn } from '../store.js';

export function renderLanding(root) {
  /* ----------------------------- data for grids ----------------------------- */
  const challenges = [1, 2, 3, 4].map((i) => `
    <div class="card card-hover" style="padding:1.5rem">
      <div style="font-size:2rem;margin-bottom:0.75rem" aria-hidden="true">${['🗂️', '❓', '📄', '🧭'][i - 1]}</div>
      <h3 style="font-size:1.15rem;margin-bottom:0.5rem">${esc(t(`landing.challenge${i}Title`))}</h3>
      <p class="text-muted small">${esc(t(`landing.challenge${i}Body`))}</p>
    </div>`).join('');

  const featureIcons = ['⚡', '📍', '🔔', '🤖', '📝', '🏆', '📚', '🗂️', '🏛️'];
  const featureColors = ['var(--primary)', 'var(--success)', 'var(--accent)', 'var(--primary)', 'var(--success)', 'var(--accent)', 'var(--primary)', 'var(--success)', 'var(--accent)'];
  const features = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `
    <div class="card card-hover" style="padding:1.5rem;border-top:4px solid ${featureColors[i - 1]}">
      <div style="font-size:2rem;margin-bottom:0.6rem" aria-hidden="true">${featureIcons[i - 1]}</div>
      <h3 style="font-size:1.1rem;margin-bottom:0.4rem">${esc(t(`landing.feature${i}Title`))}</h3>
      <p class="text-muted small">${esc(t(`landing.feature${i}Body`))}</p>
    </div>`).join('');

  const catIcons = ['🤝', '🎓', '🕌', '👩‍🎓', '♿', '🥇', '🏦', '🗺️'];
  const cats = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => `
    <a href="${isLoggedIn() ? '#/schemes' : '#/signup'}" class="card card-hover" style="padding:1.1rem;display:flex;gap:0.75rem;align-items:center;text-decoration:none">
      <span style="font-size:1.6rem" aria-hidden="true">${catIcons[i - 1]}</span>
      <span style="font-weight:600;font-size:0.95rem">${esc(t(`landing.cat${i}Label`))}</span>
    </a>`).join('');

  const steps = [1, 2, 3, 4].map((i) => `
    <div style="display:flex;gap:1rem;align-items:flex-start">
      <div class="stepper-dot active" style="flex-shrink:0">${i}</div>
      <div>
        <h3 style="font-size:1.1rem;margin-bottom:0.35rem">${esc(t(`landing.step${i}Title`))}</h3>
        <p class="text-muted small">${esc(t(`landing.step${i}Body`))}</p>
      </div>
    </div>`).join('<div style="height:1.5rem"></div>');

  const stats = [
    ['1,067+', t('landing.stat1Label')],
    ['7', t('landing.stat2Label')],
    ['68', t('landing.stat3Label')],
    ['10', t('landing.stat4Label')],
  ].map(([n, label]) => `
    <div style="text-align:center;padding:0.75rem">
      <div style="font-size:1.9rem;font-weight:800;color:#fff">${n}</div>
      <div class="small" style="opacity:0.9">${esc(label)}</div>
    </div>`).join('');

  const engineStatuses = [
    ['statusEligible', 'statusEligibleBody', 'var(--success)', '✅'],
    ['statusAction', 'statusActionBody', '#d97706', '⚠️'],
    ['statusNot', 'statusNotBody', 'var(--danger)', '⛔'],
  ].map(([k, kb, color, icon]) => `
    <div class="card" style="padding:1.1rem;border-left:4px solid ${color}">
      <div style="font-weight:700;margin-bottom:0.3rem">${icon} ${esc(t(`landing.${k}`))}</div>
      <p class="text-muted small">${esc(t(`landing.${kb}`))}</p>
    </div>`).join('');

  const langs = [
    ['English', 'EN'], ['हिन्दी', 'HI'], ['मराठी', 'MR'], ['தமிழ்', 'TA'],
    ['తెలుగు', 'TE'], ['বাংলা', 'BN'], ['ગુજરાતી', 'GU'],
  ].map(([name, code]) => `
    <span class="badge badge-primary" style="font-size:0.9rem;padding:0.45rem 0.8rem">${code} · ${name}</span>`).join('');

  const stories = [1, 2, 3].map((i) => `
    <div class="card" style="padding:1.5rem;display:flex;flex-direction:column;gap:0.75rem">
      <div style="color:var(--accent);font-size:1.1rem" aria-hidden="true">★★★★★</div>
      <p class="small" style="font-style:italic">“${esc(t(`landing.story${i}Quote`))}”</p>
      <div>
        <div style="font-weight:700;font-size:0.95rem">${esc(t(`landing.story${i}Name`))}</div>
        <div class="caption text-muted">${esc(t(`landing.story${i}Role`))}</div>
      </div>
    </div>`).join('');

  const why = [1, 2, 3, 4].map((i) => `
    <div style="display:flex;gap:0.85rem;align-items:flex-start">
      <span style="font-size:1.4rem" aria-hidden="true">${['📱', '🗣️', '⏰', '✔️'][i - 1]}</span>
      <div>
        <h3 style="font-size:1rem;margin-bottom:0.25rem">${esc(t(`landing.why${i}Title`))}</h3>
        <p class="text-muted small">${esc(t(`landing.why${i}Body`))}</p>
      </div>
    </div>`).join('');

  const faqs = [1, 2, 3, 4, 5, 6].map((i) => `
    <details class="card" style="padding:1rem 1.25rem">
      <summary style="font-weight:600;cursor:pointer">${esc(t(`landing.faq${i}Q`))}</summary>
      <p class="text-muted small" style="margin-top:0.6rem">${esc(t(`landing.faq${i}A`))}</p>
    </details>`).join('');

  /* --------------------------------- render --------------------------------- */
  root.innerHTML = `
  <div>
    <!-- Hero -->
    <section class="hero-grad" style="color:#fff">
      <div class="container-x" style="padding-top:4rem;padding-bottom:2.5rem;text-align:center">
        <div style="font-size:4rem;line-height:1;margin-bottom:0.5rem" aria-hidden="true">🎓</div>
        <div style="font-family:'Poppins',var(--font-body);font-weight:800;font-size:1.8rem;letter-spacing:-0.01em;color:#fff;margin-bottom:1rem;text-shadow:0 2px 12px rgba(0,0,0,0.25)">${esc(t('app.shortName'))}</div>
        <span class="badge" style="background:rgba(255,255,255,0.2);color:#fff;margin-bottom:1rem">🇮🇳 ${esc(t('app.madeFor'))}</span>
        <h1 class="hero-title" style="color:#fff;max-width:900px;margin:0 auto 1rem">${esc(t('app.tagline'))}</h1>
        <p style="max-width:680px;margin:0 auto 2rem;opacity:0.95;font-size:1.1rem">${esc(t('app.subtagline'))}</p>
        <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap">
          <a href="${isLoggedIn() ? '#/dashboard' : '#/signup'}" class="btn btn-lg" style="background:#fff">${esc(t('btn.getStarted'))}</a>
          <a href="${isLoggedIn() ? '#/schemes' : '#/login'}" class="btn btn-lg btn-ghost" style="color:#fff;border-color:rgba(255,255,255,0.6)">${esc(t('btn.explore'))}</a>
        </div>
      </div>
      <!-- Stats strip -->
      <div style="background:rgba(0,0,0,0.18);padding:1.25rem 0">
        <div class="container-x" style="display:grid;gap:0.5rem;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">${stats}</div>
      </div>
    </section>

    <!-- Trust / sources -->
    <section class="container-x" style="padding-top:2rem;text-align:center">
      <div style="font-weight:700;margin-bottom:0.5rem">🏛️ ${esc(t('landing.trustTitle'))}</div>
      <p class="text-muted small" style="max-width:760px;margin:0 auto">${esc(t('landing.trustNote'))}</p>
    </section>

    <!-- The Challenge -->
    <section class="container-x" style="padding-top:3rem;padding-bottom:2rem">
      <h2 style="text-align:center;margin-bottom:2rem">${esc(t('landing.challengeTitle'))}</h2>
      <div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">${challenges}</div>
    </section>

    <!-- Features (9) -->
    <section class="section-alt">
      <div class="container-x">
        <h2 style="text-align:center;margin-bottom:2rem">${esc(t('landing.featuresTitle'))}</h2>
        <div style="display:grid;gap:1.25rem;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">${features}</div>
      </div>
    </section>

    <!-- Categories -->
    <section class="container-x" style="padding-top:3.5rem;padding-bottom:2rem">
      <h2 style="text-align:center;margin-bottom:2rem">${esc(t('landing.catTitle'))}</h2>
      <div style="display:grid;gap:0.85rem;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">${cats}</div>
    </section>

    <!-- How it works (4 steps) -->
    <section class="container-x" style="padding-top:3.5rem;padding-bottom:3rem">
      <h2 style="text-align:center;margin-bottom:2.5rem">${esc(t('landing.howTitle'))}</h2>
      <div style="max-width:680px;margin:0 auto">${steps}</div>
    </section>

    <!-- Eligibility engine explainer -->
    <section class="section-alt">
      <div class="container-x">
        <h2 style="text-align:center;margin-bottom:1rem">🧮 ${esc(t('landing.engineTitle'))}</h2>
        <p class="text-muted" style="max-width:760px;margin:0 auto 2rem;text-align:center">${esc(t('landing.engineBody'))}</p>
        <div style="display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));max-width:900px;margin:0 auto">${engineStatuses}</div>
      </div>
    </section>

    <!-- Languages -->
    <section class="container-x" style="padding-top:3.5rem;padding-bottom:3rem;text-align:center">
      <h2 style="margin-bottom:1rem">🌐 ${esc(t('landing.langTitle'))}</h2>
      <p class="text-muted" style="max-width:720px;margin:0 auto 1.5rem">${esc(t('landing.langBody'))}</p>
      <div style="display:flex;gap:0.6rem;justify-content:center;flex-wrap:wrap">${langs}</div>
    </section>

    <!-- Success stories -->
    <section class="section-alt">
      <div class="container-x">
        <h2 style="text-align:center;margin-bottom:2rem">💛 ${esc(t('landing.storyTitle'))}</h2>
        <div style="display:grid;gap:1.25rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">${stories}</div>
      </div>
    </section>

    <!-- Built for Bharat -->
    <section class="container-x" style="padding-top:3.5rem;padding-bottom:3rem">
      <h2 style="text-align:center;margin-bottom:2rem">🇮🇳 ${esc(t('landing.whyTitle'))}</h2>
      <div style="display:grid;gap:1.5rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));max-width:960px;margin:0 auto">${why}</div>
    </section>

    <!-- FAQ -->
    <section class="section-alt">
      <div class="container-x" style="max-width:760px">
        <h2 style="text-align:center;margin-bottom:2rem">❓ ${esc(t('landing.faqTitle'))}</h2>
        <div style="display:flex;flex-direction:column;gap:0.75rem">${faqs}</div>
      </div>
    </section>

    <!-- CTA -->
    <section class="hero-grad" style="color:#fff;padding:3rem 0">
      <div class="container-x" style="text-align:center">
        <h2 class="hero-title" style="color:#fff;margin-bottom:0.5rem;font-size:clamp(1.9rem,4.5vw,2.8rem)">${esc(t('app.tagline'))}</h2>
        <p style="opacity:0.95;margin-bottom:1.5rem">${esc(t('landing.ctaSub'))}</p>
        <a href="${isLoggedIn() ? '#/dashboard' : '#/signup'}" class="btn btn-lg" style="background:#fff">${esc(t('btn.getStarted'))}</a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="site-footer">
      <div class="container-x" style="display:grid;gap:2rem;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">
        <div>
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem"><span class="brand-logo" aria-hidden="true">🎓</span><span style="font-family:'Poppins',var(--font-body);font-weight:700;font-size:1.25rem;color:#fff">${esc(t('app.name'))}</span></div>
          <p class="small" style="opacity:0.8">${esc(t('footer.tagline'))}</p>
        </div>
        <div>
          <div style="font-weight:600;color:#fff;margin-bottom:0.75rem">${esc(t('footer.product'))}</div>
          <div style="display:flex;flex-direction:column;gap:0.4rem" class="small">
            <a href="#/schemes" style="color:#cbd5e1">${esc(t('nav.schemes'))}</a>
            <a href="#/exams" style="color:#cbd5e1">${esc(t('nav.exams'))}</a>
            <a href="#/competitions" style="color:#cbd5e1">${esc(t('nav.competitions'))}</a>
          </div>
        </div>
        <div>
          <div style="font-weight:600;color:#fff;margin-bottom:0.75rem">${esc(t('footer.resources'))}</div>
          <div style="display:flex;flex-direction:column;gap:0.4rem" class="small">
            <a href="#/materials" style="color:#cbd5e1">${esc(t('nav.materials'))}</a>
            <a href="#/documents" style="color:#cbd5e1">${esc(t('nav.documents'))}</a>
            <a href="#/offices" style="color:#cbd5e1">${esc(t('nav.offices'))}</a>
          </div>
        </div>
        <div>
          <div style="font-weight:600;color:#fff;margin-bottom:0.75rem">${esc(t('footer.contact'))}</div>
          <div class="small" style="display:flex;flex-direction:column;gap:0.4rem">
            <a href="mailto:${esc(t('footer.supportEmail'))}" style="color:#cbd5e1">${esc(t('footer.supportEmail'))}</a>
            <span style="opacity:0.8">${esc(t('app.madeFor'))} ❤️</span>
          </div>
        </div>
      </div>
    </footer>
  </div>`;
}
