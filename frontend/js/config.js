// Runtime configuration.
// Priority: ?api= query → window.__API_URL__ → localStorage → Render backend → localhost.
// On Vercel/Netlify (static) the frontend calls the backend hosted on Render/Railway.
const fromQuery = new URLSearchParams(location.search).get('api');
const isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
export const API_URL = (
  fromQuery ||
  window.__API_URL__ ||
  localStorage.getItem('ssap_api') ||
  (isLocal ? 'http://localhost:5000' : 'https://ssap-api.onrender.com')
).replace(/\/+$/, '');

// Allow overriding the API base from a Vercel env at build time if present.
if (!isLocal && !fromQuery && !window.__API_URL__ && !localStorage.getItem('ssap_api')) {
  // no-op: default Render URL already set above
}

export const LANGS = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
];
