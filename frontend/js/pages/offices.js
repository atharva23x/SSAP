import { t } from '../i18n.js';
import { esc, toast, emptyState, skeletonList } from '../ui.js';
import { api } from '../api.js';

const TYPE_COLORS = { Tehsildar: '#1e40af', CSC: '#10b981', Setu: '#f59e0b', 'e-Seva': '#8b5cf6', Collectorate: '#ef4444', Municipal: '#0ea5e9' };

/**
 * Map a document type (from guides / scheme requirements) to the office
 * service filter that actually issues it. Documents that no government
 * office issues (school/bank-issued) return a hint instead.
 */
const DOC_TO_OFFICE = {
  'income certificate': { service: 'Income Certificate' },
  'income cert': { service: 'Income Certificate' },
  'caste certificate': { service: 'Caste Certificate' },
  'caste cert': { service: 'Caste Certificate' },
  'non-creamy layer': { service: 'Caste Certificate', note: 'offices.hintNonCreamy' },
  'non creamy layer': { service: 'Caste Certificate', note: 'offices.hintNonCreamy' },
  'caste validity': { service: 'Caste Certificate', type: 'Tehsildar', note: 'offices.hintValidity' },
  'domicile certificate': { service: 'Domicile Certificate' },
  'domicile': { service: 'Domicile Certificate' },
  'birth certificate': { service: 'Birth Certificate' },
  'aadhaar': { service: 'Aadhaar Update' },
  'aadhaar update': { service: 'Aadhaar Update' },
  'bank passbook': { type: 'CSC', note: 'offices.hintBank' },
  'bonafide certificate': { note: 'offices.hintBonafide' },
  'bonafide': { note: 'offices.hintBonafide' },
  'udid': { type: 'CSC', note: 'offices.hintUdid' },
  'minority': { type: 'Collectorate', note: 'offices.hintMinority' },
  'mark sheet': { note: 'offices.hintSchool' },
  'affidavit': { note: 'offices.hintAffidavit' },
  'entrance test': { note: 'offices.hintExam' },
  'score': { note: 'offices.hintExam' },
  'school leaving certificate': { note: 'offices.hintBonafide' },
  'migration certificate': { note: 'offices.hintBonafide' },
};

function resolveDoc(docName) {
  if (!docName) return null;
  const key = String(docName).toLowerCase().trim();
  if (DOC_TO_OFFICE[key]) return { ...DOC_TO_OFFICE[key], doc: docName };
  // Partial match fallback (e.g. "Caste Certificate (SC)" → Caste Certificate)
  for (const [k, v] of Object.entries(DOC_TO_OFFICE)) {
    if (key.includes(k)) return { ...v, doc: docName };
  }
  return null;
}

export async function renderOffices(root) {
  const params = new URLSearchParams(location.hash.split('?')[1] || '');
  const presetService = params.get('service') || '';
  const presetType = params.get('type') || '';
  const docQuery = resolveDoc(params.get('doc'));

  const isFiltered = !!(docQuery && (docQuery.service || docQuery.type));
  const banner = docQuery ? `
    <div class="card" style="padding:1rem 1.25rem;margin-bottom:1rem;border-left:4px solid var(--primary);display:flex;gap:0.6rem;align-items:flex-start;flex-wrap:wrap">
      <span style="font-size:1.3rem">🗺️</span>
      <div>
        <strong>${isFiltered ? esc(t('offices.issuing', { doc: docQuery.doc })) : esc(docQuery.doc)}</strong>
        ${docQuery.note ? `<div class="small text-muted" style="margin-top:0.15rem">${esc(t(docQuery.note))}</div>` : ''}
      </div>
    </div>` : '';

  root.innerHTML = `
  <div class="container-x" style="padding-top:1.5rem">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:1rem">
      <h2 style="margin:0">${esc(t('offices.title'))}</h2>
      <button class="btn btn-primary btn-sm" id="geo-btn">📍 ${esc(t('offices.useLocation'))}</button>
    </div>
    ${banner}
    <div class="offices-layout">
      <div>
        <div style="display:grid;gap:0.5rem;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));margin-bottom:1rem">
          <select class="input" id="f-state"><option value="">${esc(t('offices.allStates'))}</option></select>
          <select class="input" id="f-district"><option value="">${esc(t('offices.allDistricts'))}</option></select>
          <select class="input" id="f-type">
            <option value="">${esc(t('offices.allTypes'))}</option>
            ${['Tehsildar','CSC','Setu','e-Seva','Collectorate','Municipal'].map((x) => `<option ${x === presetType ? 'selected' : ''}>${x}</option>`).join('')}
          </select>
          <select class="input" id="f-service">
            <option value="">${esc(t('offices.allServices'))}</option>
            ${['Income Certificate','Caste Certificate','Domicile Certificate','Birth Certificate','Aadhaar Update'].map((x) => `<option ${x === presetService || x === docQuery?.service ? 'selected' : ''}>${x}</option>`).join('')}
          </select>
        </div>
        <div id="list" style="display:grid;gap:0.75rem">${skeletonList(4)}</div>
      </div>
      <div class="offices-map">
        <div id="map" role="application" aria-label="${esc(t('offices.title'))}"></div>
      </div>
    </div>
  </div>`;

  const listEl = root.querySelector('#list');
  let offices = [];
  let map = null, markerGroup = null, meMarker = null, tileLayer = null, popupMarkers = new Map();

  const stateSel = root.querySelector('#f-state');
  const districtSel = root.querySelector('#f-district');
  const typeSel = root.querySelector('#f-type');
  const serviceSel = root.querySelector('#f-service');
  if (presetType) typeSel.value = presetType;
  if (presetService) serviceSel.value = presetService;
  if (docQuery?.type && !presetType) typeSel.value = docQuery.type;

  // Google-style clean tiles (CARTO Voyager) — dark tiles follow the theme
  const makeTiles = () => (document.documentElement.dataset.theme === 'dark'
    ? L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19, subdomains: 'abcd', attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      })
    : L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19, subdomains: 'abcd', attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      }));

  if (window.L) {
    map = L.map(root.querySelector('#map')).setView([22.9734, 78.6569], 5); // India center
    tileLayer = makeTiles().addTo(map);
    markerGroup = L.layerGroup().addTo(map);
    window.addEventListener('ssap:theme', () => {
      if (!map) return;
      map.removeLayer(tileLayer);
      tileLayer = makeTiles().addTo(map);
    });
  } else {
    listEl.innerHTML = emptyState('Map could not load — showing list only.');
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371, toR = (d) => (d * Math.PI) / 180;
    const dLat = toR(lat2 - lat1), dLon = toR(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  let userPos = null;

  function directionsUrl(o) {
    return `https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`;
  }

  function renderList() {
    const state = stateSel.value, district = districtSel.value, type = typeSel.value, service = serviceSel.value;
    let filtered = offices.filter((o) =>
      (!state || o.state === state) && (!district || o.district === district) &&
      (!type || o.type === type) && (!service || (o.servicesOffered || []).includes(service))
    );
    // Nearest first once we know the user's location
    if (userPos) {
      filtered = filtered
        .map((o) => ({ ...o, _dist: haversine(userPos[0], userPos[1], o.lat, o.lng) }))
        .sort((a, b) => a._dist - b._dist);
    }
    if (!filtered.length) { listEl.innerHTML = emptyState(t('common.noResults')); return; }
    listEl.innerHTML = filtered.map((o) => `
      <div class="card" style="padding:1rem" data-office="${esc(o._id || o.id)}">
        <div style="display:flex;justify-content:space-between;gap:0.5rem;align-items:flex-start">
          <div>
            <div style="display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap">
              <span class="badge" style="background:${TYPE_COLORS[o.type] || '#1e40af'};color:#fff">${esc(o.type || '')}</span>
              ${o._dist != null ? `<span class="badge badge-muted">📏 ${esc(t('offices.away', { km: o._dist < 10 ? o._dist.toFixed(1) : Math.round(o._dist) }))}</span>` : ''}
            </div>
            <h4 style="margin:0.4rem 0 0.15rem">${esc(o.name)}</h4>
            <p class="small text-muted" style="margin:0">${esc(o.address || '')}</p>
            <p class="small" style="margin:0.25rem 0 0">🕐 ${esc(o.timings || '')} ${o.phone ? ` · 📞 <a href="tel:${esc(o.phone)}">${esc(o.phone)}</a>` : ''}</p>
            ${(o.servicesOffered || []).length ? `<div style="margin-top:0.4rem;display:flex;gap:0.3rem;flex-wrap:wrap">${o.servicesOffered.map((s) => `<span class="chip" style="font-size:0.72rem;padding:0.15rem 0.6rem">${esc(s)}</span>`).join('')}</div>` : ''}
          </div>
        </div>
        <div style="display:flex;gap:0.5rem;margin-top:0.75rem;flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" data-show="${esc(o._id || o.id)}">🗺️ ${esc(t('offices.showOnMap'))}</button>
          <a class="btn btn-primary btn-sm" href="${directionsUrl(o)}" target="_blank" rel="noopener">🧭 ${esc(t('btn.getDirections'))}</a>
        </div>
      </div>`).join('');

    listEl.querySelectorAll('[data-show]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const o = filtered.find((x) => (x._id || x.id) === btn.dataset.show);
        if (!o || !map) return;
        map.setView([o.lat, o.lng], 15);
        popupMarkers.get(o._id || o.id)?.openPopup();
      });
    });

    // Draw markers + fit map to results
    if (map && markerGroup) {
      markerGroup.clearLayers();
      popupMarkers = new Map();
      const bounds = [];
      filtered.slice(0, 60).forEach((o) => {
        const m = L.circleMarker([o.lat, o.lng], {
          radius: 9, color: '#fff', weight: 2, fillColor: TYPE_COLORS[o.type] || '#1e40af', fillOpacity: 1,
        }).bindPopup(`
          <div style="min-width:200px;font-family:inherit">
            <strong>${esc(o.name)}</strong>
            <div style="font-size:12px;color:#555;margin:2px 0 6px">${esc(o.address || '')}</div>
            <div style="font-size:12px">${esc(o.type || '')}${o.phone ? ` · 📞 ${esc(o.phone)}` : ''}</div>
            <div style="font-size:12px">🕐 ${esc(o.timings || '')}</div>
            <a href="${directionsUrl(o)}" target="_blank" rel="noopener"
               style="display:inline-block;margin-top:8px;padding:6px 10px;border-radius:8px;background:#1e40af;color:#fff;text-decoration:none;font-size:12px;font-weight:600">
               🧭 ${esc(t('btn.getDirections'))}</a>
          </div>`);
        m.addTo(markerGroup);
        popupMarkers.set(o._id || o.id, m);
        bounds.push([o.lat, o.lng]);
      });
      if (meMarker) bounds.push([meMarker.getLatLng().lat, meMarker.getLatLng().lng]);
      if (bounds.length) map.fitBounds(bounds, { padding: [40, 40], maxZoom: bounds.length === 1 ? 15 : 12 });
    }
  }

  stateSel.addEventListener('change', async () => {
    districtSel.innerHTML = `<option value="">${esc(t('offices.allDistricts'))}</option>`;
    if (stateSel.value) {
      const dists = [...new Set(offices.filter((o) => o.state === stateSel.value).map((o) => o.district))].sort();
      districtSel.innerHTML += dists.map((d) => `<option>${esc(d)}</option>`).join('');
    }
    renderList();
  });
  districtSel.addEventListener('change', renderList);
  typeSel.addEventListener('change', renderList);
  serviceSel.addEventListener('change', renderList);

  root.querySelector('#geo-btn').addEventListener('click', () => {
    if (!navigator.geolocation) { toast(t('common.error'), 'error'); return; }
    navigator.geolocation.getCurrentPosition((pos) => {
      userPos = [pos.coords.latitude, pos.coords.longitude];
      if (map) {
        if (meMarker) map.removeLayer(meMarker);
        meMarker = L.circleMarker(userPos, {
          radius: 11, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1,
        }).bindPopup(`<strong>📍 ${esc(t('offices.youHere'))}</strong>`).addTo(map);
        map.setView(userPos, 12);
      }
      renderList();
      toast(t('offices.youHere'), 'success');
    }, () => toast(t('common.error'), 'error'), { timeout: 8000 });
  });

  // Load all offices (no filters server-side so every district is on the map)
  try {
    const res = await api.get('/offices?limit=500');
    offices = res.data || [];
    [...new Set(offices.map((o) => o.state))].sort().forEach((s) => {
      stateSel.innerHTML += `<option>${esc(s)}</option>`;
    });
    renderList();
    // Auto-locate on load so distances + nearest sorting work immediately
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        userPos = [pos.coords.latitude, pos.coords.longitude];
        if (map && !meMarker) {
          meMarker = L.circleMarker(userPos, {
            radius: 11, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1,
          }).bindPopup(`<strong>📍 ${esc(t('offices.youHere'))}</strong>`).addTo(map);
        }
        renderList();
      }, () => {}, { timeout: 8000 });
    }
  } catch {
    listEl.innerHTML = emptyState(t('common.error'));
  }
}
