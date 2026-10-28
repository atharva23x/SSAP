import { t, getLang } from '../i18n.js';
import { esc, toast } from '../ui.js';
import { api } from '../api.js';

export async function renderAssistant(root) {
  root.innerHTML = `
  <div class="container-x" style="padding-top:1.25rem;display:flex;flex-direction:column;height:calc(100vh - 160px)">
    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
      <div style="width:44px;height:44px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.4rem">🤖</div>
      <div><h2 style="margin:0;font-size:1.3rem">${esc(t('assistant.title'))}</h2><p class="caption text-muted">${esc(t('assistant.subtitle'))}</p></div>
    </div>

    <div class="card" style="flex:1;overflow-y:auto;padding:1.25rem;margin-bottom:0.75rem" id="chat" role="log" aria-live="polite"></div>

    <div class="chip-row" style="margin-bottom:0.75rem" id="suggestions"></div>

    <form id="chat-form" style="display:flex;gap:0.5rem">
      <input class="input" id="chat-input" placeholder="${esc(t('assistant.placeholder'))}" autocomplete="off" style="flex:1" />
      <button class="btn btn-primary" type="submit" id="send-btn" aria-label="${esc(t('btn.send'))}">➤</button>
    </form>
  </div>`;

  const chat = root.querySelector('#chat');
  const input = root.querySelector('#chat-input');
  const form = root.querySelector('#chat-form');
  const suggestions = root.querySelector('#suggestions');

  const welcome = t('assistant.title');
  addBot(`Namaste! 👋 ${welcome}. ${t('assistant.subtitle')}`, []);

  // Suggestions
  try {
    const res = await api.get('/ai/suggestions');
    suggestions.innerHTML = (res.data || []).map((s) => `<button class="chip" data-q="${esc(s.query)}">${esc(t(s.label))}</button>`).join('');
    suggestions.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => send(b.dataset.q)));
  } catch { /* ignore */ }

  // Pending query from dashboard
  const pending = sessionStorage.getItem('ssap_pending_q');
  if (pending) { sessionStorage.removeItem('ssap_pending_q'); setTimeout(() => send(pending), 300); }

  form.onsubmit = (e) => {
    e.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    input.value = '';
    send(q);
  };

  async function send(query) {
    addUser(query);
    const typing = showTyping();
    try {
      const res = await api.post('/ai/query', { query, lang: getLang() });
      typing.remove();
      const d = res.data;
      addBot(d.response, d.roadmapSteps || [], d.suggestions);
    } catch {
      typing.remove();
      addBot(t('common.error'), []);
    }
    chat.scrollTop = chat.scrollHeight;
  }

  function addUser(text) {
    const row = document.createElement('div');
    row.className = 'chat-row';
    row.innerHTML = `<div class="chat-bubble chat-user">${esc(text)}</div>`;
    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
  }

  function addBot(text, roadmap = [], sugg) {
    const row = document.createElement('div');
    row.className = 'chat-row';
    const roadmapHtml = roadmap.length ? `
      <div style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px dashed var(--border)">
        <div class="caption text-muted" style="margin-bottom:0.5rem;font-weight:600">🗺 ${esc(t('assistant.roadmap'))}</div>
        ${roadmap.map((step, i) => `
          <div style="display:flex;gap:0.6rem;margin-bottom:0.5rem">
            <div class="stepper-dot active" style="width:22px;height:22px;font-size:0.7rem;flex-shrink:0">${i + 1}</div>
            <div class="small">${esc(step)}</div>
          </div>`).join('')}
      </div>` : '';
    const suggHtml = sugg?.length ? `<div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.75rem">${sugg.map((s) => `<button class="chip" data-sq="${esc(s.query)}">${esc(s.label)}</button>`).join('')}</div>` : '';
    row.innerHTML = `<div class="chat-bubble chat-bot">${esc(text)}${roadmapHtml}${suggHtml}</div>`;
    chat.appendChild(row);
    row.querySelectorAll('[data-sq]').forEach((b) => b.addEventListener('click', () => send(b.dataset.sq)));
    chat.scrollTop = chat.scrollHeight;
  }

  function showTyping() {
    const row = document.createElement('div');
    row.className = 'chat-row';
    row.innerHTML = `<div class="chat-bubble chat-bot typing"><span></span><span></span><span></span> <span class="caption text-muted" style="margin-left:0.3rem">${esc(t('assistant.typing'))}</span></div>`;
    chat.appendChild(row);
    chat.scrollTop = chat.scrollHeight;
    return row;
  }
}
