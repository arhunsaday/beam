/* Beam core: config, content detection, sending, input wiring, the settings sheet and sound effects.
   Every design imports this and only does its own visuals. */

const store = {
  get: (k, d) => { try { return localStorage.getItem('beam.' + k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem('beam.' + k, v); } catch {} },
};
const randomTopic = () => {
  const abc = 'abcdefghijkmnpqrstuvwxyz23456789';
  return 'beam-' + Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => abc[b % abc.length]).join('');
};

const cfg = {
  server: store.get('server', 'https://ntfy.sh'),
  topic: store.get('topic', '') || randomTopic(),
  token: store.get('token', ''),
};
store.set('topic', cfg.topic);
const firstRun = !store.get('seen', '');
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn(cfg));

const isUrl = (s) => /^https?:\/\/[^\s]+$/i.test(s);
const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
const fmtSize = (n) => n < 1024 ? n + ' B' : n < 1048576 ? Math.round(n / 1024) + ' KB' : (n / 1048576).toFixed(1) + ' MB';
const serverHost = () => cfg.server.replace(/^https?:\/\//, '').replace(/\/+$/, '');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/** What the input currently is, and how the phone will show it. */
function detect(text = '', file = null) {
  const t = text.trim();
  if (file) return { kind: 'file', emoji: '📎', title: file.name, body: t || `${fmtSize(file.size)} · tap to download`, size: fmtSize(file.size) };
  if (!t) return { kind: 'empty' };
  if (isUrl(t)) return { kind: 'link', emoji: '🔗', title: hostOf(t), body: t, host: hostOf(t) };
  return { kind: 'text', emoji: '📝', title: 'Note', body: t };
}

/** Publish to ntfy. Metadata rides in query params: no CORS preflight, no header-encoding issues. */
async function send({ text = '', file = null }) {
  const d = detect(text, file), t = text.trim();
  if (d.kind === 'empty') throw new Error('Nothing to send');
  if (!cfg.topic) throw new Error('Set a topic first');
  const url = new URL(cfg.server.replace(/\/+$/, '') + '/' + encodeURIComponent(cfg.topic));
  const q = url.searchParams;
  let method = 'POST', body = t;
  q.set('title', d.title);
  if (d.kind === 'link') { q.set('click', t); q.set('tags', 'link'); }
  else if (d.kind === 'text') q.set('tags', 'memo');
  else { method = 'PUT'; body = file; q.set('filename', file.name); q.set('tags', 'paperclip'); if (t) q.set('message', t); }
  const headers = cfg.token ? { Authorization: 'Bearer ' + cfg.token } : {};
  const t0 = performance.now();
  let res;
  try { res = await fetch(url, { method, body, headers }); }
  catch { throw new Error('Can’t reach ' + serverHost()); }
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error ? j.error.replace(/;.*$/, '') : `HTTP ${res.status}`);
  }
  const ms = Math.round(performance.now() - t0);
  record({ kind: d.kind, title: d.title, text: t, fileName: file?.name, fileSize: file?.size, topic: cfg.topic, ms });
  return { ms, kind: d.kind };
}

/* ---------- sent history: kept only in this browser ---------- */
const HISTORY_MAX = 500;
const DAY = 86400000;
function history() {
  try { const h = JSON.parse(store.get('history', '[]')); return Array.isArray(h) ? h : []; } catch { return []; }
}
function saveHistory(h) { store.set('history', JSON.stringify(h.slice(0, HISTORY_MAX))); if (hist?.open) renderHistory(); }
function record(entry) {
  const id = crypto.randomUUID?.() || String(Date.now()) + Math.random().toString(36).slice(2);
  saveHistory([{ id, t: Date.now(), ...entry }, ...history()]);
}

/** Paste/drop/shortcut wiring shared by all designs. Everything is removed when `signal` aborts. */
function wire({ input, onFile, onDrag, onSend, signal }) {
  const o = { signal };
  input.addEventListener('paste', (e) => {
    const f = [...(e.clipboardData?.files || [])][0];
    if (!f) return;
    e.preventDefault();
    onFile(f.name === 'image.png' ? new File([f], `paste-${Date.now()}.png`, { type: f.type }) : f);
  }, o);
  let depth = 0;
  addEventListener('dragenter', (e) => { e.preventDefault(); if (++depth === 1) onDrag?.(true); }, o);
  addEventListener('dragleave', () => { if (--depth <= 0) { depth = 0; onDrag?.(false); } }, o);
  addEventListener('dragover', (e) => e.preventDefault(), o);
  addEventListener('drop', (e) => {
    e.preventDefault(); depth = 0; onDrag?.(false);
    const f = e.dataTransfer.files[0];
    if (f) return onFile(f);
    const t = e.dataTransfer.getData('text');
    if (t) { input.value = t; input.dispatchEvent(new Event('input')); }
  }, o);
  addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onSend(); }
  }, o);
}

const pickFile = () => new Promise((resolve) => {
  const i = Object.assign(document.createElement('input'), { type: 'file' });
  i.onchange = () => resolve(i.files[0] || null);
  i.click();
});

/* ---------- settings sheet (themed by the active design's --beam-* variables) ---------- */
let dlg;
function buildSettings() {
  const css = document.createElement('style');
  css.textContent = `
    .beam-dlg { position: fixed; inset: 0; margin: auto; height: fit-content; max-height: calc(100dvh - 32px); border: 0; padding: 0; background: none;
      color: var(--beam-ink, #111); width: min(420px, calc(100vw - 32px)); max-width: none; overflow: visible; }
    .beam-dlg::backdrop { background: rgb(0 0 0 / .4); backdrop-filter: blur(6px); }
    .beam-dlg[open] .beam-sheet { animation: beam-pop .32s cubic-bezier(.2, 1.3, .4, 1); }
    @keyframes beam-pop { from { opacity: 0; transform: translateY(12px) scale(.96); } }
    .beam-sheet { display: grid; gap: 14px; padding: 20px; background: var(--beam-bg, #fff); border: 1px solid var(--beam-line, #e5e5e5);
      border-radius: var(--beam-radius, 18px); font: 14px/1.5 var(--beam-font, system-ui, sans-serif); box-shadow: 0 30px 80px -20px rgb(0 0 0 / .45); }
    .beam-sheet h2 { font-size: 15px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; margin: 0; }
    .beam-sheet label { display: grid; gap: 6px; font-size: 12px; color: var(--beam-muted, #888); }
    .beam-sheet input { width: 100%; box-sizing: border-box; font: 13.5px var(--beam-mono, ui-monospace, Menlo, monospace); color: inherit; background: var(--beam-field, rgb(127 127 127 / .08));
      border: 1px solid var(--beam-line, #e5e5e5); border-radius: calc(var(--beam-radius, 18px) * .55); padding: 9px 11px; outline: 0; }
    .beam-sheet input:focus { border-color: var(--beam-accent, #4f6bff); }
    .beam-row { display: flex; gap: 8px; }
    .beam-sheet button { font: inherit; cursor: pointer; color: inherit; background: none; border: 1px solid var(--beam-line, #e5e5e5);
      border-radius: calc(var(--beam-radius, 18px) * .55); padding: 0 12px; }
    .beam-sheet button:hover { background: var(--beam-field, rgb(127 127 127 / .08)); }
    .beam-sheet button:focus:not(:focus-visible) { outline: none; }
    .beam-sheet .beam-done { padding: 10px; font-weight: 600; background: var(--beam-ink, #111); color: var(--beam-bg, #fff); border: 0; }
    .beam-sheet .beam-done:hover { background: var(--beam-ink, #111); opacity: .9; }
    .beam-sheet .beam-x { border: 0; font-size: 20px; line-height: 1; padding: 2px 6px; color: var(--beam-muted, #888); }
    .beam-sheet p { font-size: 12.5px; color: var(--beam-muted, #888); margin: 0; }
    .beam-sheet p b { color: var(--beam-ink, #111); font-family: var(--beam-mono, ui-monospace, monospace); font-weight: 500; }
    .beam-sheet a { color: var(--beam-accent, #4f6bff); }`;
  document.head.append(css);
  dlg = document.createElement('dialog');
  dlg.className = 'beam-dlg';
  dlg.innerHTML = `
    <form method="dialog" class="beam-sheet">
      <h2>Settings <button class="beam-x" value="x" aria-label="Close">×</button></h2>
      <label>Topic <div class="beam-row"><input name="topic" spellcheck="false" autocomplete="off"><button type="button" data-new>New</button></div></label>
      <label>Server <input name="server" spellcheck="false" autocomplete="off" placeholder="https://ntfy.sh"></label>
      <label>Access token · optional <input name="token" type="password" autocomplete="off" placeholder="tk_…"></label>
      <p>On your phone, install <a href="https://ntfy.sh" target="_blank" rel="noopener">ntfy</a>, tap <b>+</b> and subscribe to
        <b data-topic></b>. Anyone who knows a topic name can read it, so keep it hard to guess.</p>
      <button class="beam-done" value="done">Done</button>
    </form>`;
  document.body.append(dlg);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  for (const k of ['topic', 'server', 'token']) {
    dlg.querySelector(`[name=${k}]`).addEventListener('input', (e) => {
      cfg[k] = e.target.value.trim() || (k === 'server' ? 'https://ntfy.sh' : '');
      store.set(k, cfg[k]); sync(); emit();
    });
  }
  dlg.querySelector('[data-new]').onclick = () => {
    cfg.topic = randomTopic(); store.set('topic', cfg.topic);
    dlg.querySelector('[name=topic]').value = cfg.topic; sync(); emit();
  };
}
const sync = () => { dlg.querySelector('[data-topic]').textContent = cfg.topic; };
function openSettings() {
  if (!dlg) buildSettings();
  for (const k of ['topic', 'server', 'token']) dlg.querySelector(`[name=${k}]`).value = cfg[k];
  sync(); dlg.showModal(); store.set('seen', '1');
}

/* ---------- history sheet ---------- */
let hist, histRange = 7, clearArmed = 0;
const RANGES = [[1, 'Today'], [7, '7 days'], [30, '30 days'], [0, 'All']];
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SVG = (d) => `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ACT = {
  copy: SVG('<rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>'),
  resend: SVG('<path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5"/>'),
  open: SVG('<path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>'),
  del: SVG('<path d="M18 6 6 18M6 6l12 12"/>'),
};
const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
function dayLabel(t) {
  const today = startOfDay(Date.now()), d = startOfDay(t);
  if (d === today) return 'Today';
  if (d === today - DAY) return 'Yesterday';
  return new Date(t).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: d < today - 300 * DAY ? 'numeric' : undefined });
}

function buildHistory() {
  if (!dlg) buildSettings();   // shares the sheet styles
  const css = document.createElement('style');
  css.textContent = `
    .beam-dlg.beam-hist { inset: 0 0 0 auto; margin: 0 0 0 auto; width: min(420px, 100vw); height: 100dvh; max-height: 100dvh; }
    .beam-hist .beam-sheet { height: 100%; border-radius: 0; border-width: 0 0 0 1px; grid-template-rows: auto auto minmax(0, 1fr) auto; gap: 14px; padding: 20px 16px 16px; }
    .beam-hist[open] .beam-sheet { animation: beam-slide .4s cubic-bezier(.2, 1, .3, 1); }
    @keyframes beam-slide { from { opacity: 0; transform: translateX(48px); } }
    @media (max-width: 560px) {
      .beam-dlg.beam-hist { inset: auto 0 0 0; margin: auto 0 0 0; width: 100vw; height: 85dvh; }
      .beam-hist .beam-sheet { border-radius: 20px 20px 0 0; border-width: 1px 0 0; }
      @keyframes beam-slide { from { opacity: 0; transform: translateY(60px); } }
    }
    .beam-hist h2 small { font-weight: 400; color: var(--beam-muted, #888); font-size: 12.5px; margin-left: 8px; }
    .beam-seg { display: flex; padding: 3px; gap: 2px; border-radius: calc(var(--beam-radius, 18px) * .6); background: var(--beam-field, rgb(127 127 127 / .08)); }
    .beam-sheet .beam-seg button { flex: 1; border: 0; padding: 6px 0; font-size: 12.5px; color: var(--beam-muted, #888); border-radius: calc(var(--beam-radius, 18px) * .45); }
    .beam-sheet .beam-seg button[aria-pressed="true"] { background: var(--beam-bg, #fff); color: var(--beam-ink, #111); box-shadow: 0 1px 3px rgb(0 0 0 / .15); }
    .beam-list { overflow-y: auto; margin: 0 -6px; padding: 0 6px; overscroll-behavior: contain; }
    .beam-day { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--beam-muted, #888); margin: 14px 4px 4px; }
    .beam-day:first-child { margin-top: 0; }
    .beam-item { display: grid; grid-template-columns: 22px minmax(0, 1fr) auto; gap: 10px; align-items: start; padding: 10px 8px; border-radius: calc(var(--beam-radius, 18px) * .6);
      animation: beam-in .3s ease both; }
    @keyframes beam-in { from { opacity: 0; transform: translateY(4px); } }
    .beam-item:hover, .beam-item:focus-within { background: var(--beam-field, rgb(127 127 127 / .08)); }
    .beam-item .e { font-size: 15px; line-height: 1.35; }
    .beam-item .tt { font-weight: 600; font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .beam-item .bd { font-size: 13px; line-height: 1.4; word-break: break-word; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .beam-item .tt + .bd { color: var(--beam-muted, #888); -webkit-line-clamp: 1; }
    .beam-item .mt { font: 11px var(--beam-mono, ui-monospace, monospace); color: var(--beam-muted, #888); margin-top: 3px; opacity: .85; }
    .beam-item .acts { display: flex; gap: 0; opacity: 0; transition: opacity .15s; }
    .beam-item:hover .acts, .beam-item:focus-within .acts { opacity: 1; }
    @media (pointer: coarse) { .beam-item .acts { opacity: 1; } }
    .beam-sheet .acts button { border: 0; width: 28px; height: 28px; padding: 0; display: grid; place-items: center; color: var(--beam-muted, #888); text-decoration: none; }
    .beam-sheet .acts button:hover { color: var(--beam-ink, #111); }
    .beam-sheet .acts button.ok { color: #22a55b; }
    .beam-empty { text-align: center; color: var(--beam-muted, #888); padding: 48px 12px; font-size: 13.5px; }
    .beam-sheet .beam-empty button { margin-top: 10px; padding: 6px 12px; }
    .beam-foot { display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; color: var(--beam-muted, #888); }
    .beam-sheet .beam-foot button { border: 0; padding: 4px 6px; font-size: 12px; color: var(--beam-muted, #888); }
    .beam-sheet .beam-foot button:hover { color: #e5484d; background: none; }
    .beam-sheet .beam-foot button.armed { color: #e5484d; }`;
  document.head.append(css);
  hist = document.createElement('dialog');
  hist.className = 'beam-dlg beam-hist';
  hist.innerHTML = `
    <div class="beam-sheet">
      <h2><span>History<small data-count></small></span><button class="beam-x" data-close aria-label="Close">×</button></h2>
      <div class="beam-seg" role="group" aria-label="Time range">${RANGES.map(([d, l]) => `<button type="button" data-range="${d}">${l}</button>`).join('')}</div>
      <div class="beam-list" data-list></div>
      <div class="beam-foot"><span>Stored only in this browser</span><button type="button" data-clear>Clear history</button></div>
    </div>`;
  document.body.append(hist);
  hist.addEventListener('click', async (e) => {
    if (e.target === hist || e.target.closest('[data-close]')) return hist.close();
    const range = e.target.closest('[data-range]');
    if (range) { histRange = +range.dataset.range; sfx('tap'); return renderHistory(); }
    if (e.target.closest('[data-clear]')) {
      if (Date.now() - clearArmed < 3000) { clearArmed = 0; saveHistory([]); sfx('error'); }
      else { clearArmed = Date.now(); renderHistory(); setTimeout(() => hist.open && renderHistory(), 3100); }
      return;
    }
    if (e.target.closest('[data-showall]')) { histRange = 0; return renderHistory(); }
    const btn = e.target.closest('[data-act]'), row = e.target.closest('[data-id]');
    if (!btn || !row) return;
    const entry = history().find((x) => x.id === row.dataset.id);
    if (!entry) return;
    const act = btn.dataset.act;
    if (act === 'del') { saveHistory(history().filter((x) => x.id !== entry.id)); return; }
    if (act === 'open') { window.open(entry.text, '_blank', 'noopener'); return; }
    if (act === 'copy') {
      try { await navigator.clipboard.writeText(entry.text || entry.fileName || entry.title); flash(btn); sfx('tap'); } catch {}
      return;
    }
    if (act === 'resend') {
      btn.disabled = true;
      try { await send({ text: entry.text }); sfx('deliver'); } catch (err) { sfx('error'); btn.title = err.message; btn.disabled = false; }
    }
  });
}
function flash(btn) {
  const was = btn.innerHTML;
  btn.innerHTML = SVG('<path d="m5 12 5 5 9-10"/>'); btn.classList.add('ok');
  setTimeout(() => { btn.innerHTML = was; btn.classList.remove('ok'); }, 1200);
}
function renderHistory() {
  const all = history();
  const since = histRange ? startOfDay(Date.now()) - (histRange - 1) * DAY : 0;
  const items = all.filter((x) => x.t >= since);
  for (const b of hist.querySelectorAll('[data-range]')) b.setAttribute('aria-pressed', +b.dataset.range === histRange);
  hist.querySelector('[data-count]').textContent = items.length ? `${items.length} sent` : '';
  const clear = hist.querySelector('[data-clear]');
  const armed = Date.now() - clearArmed < 3000;
  clear.textContent = armed ? 'Click again to clear' : 'Clear history';
  clear.classList.toggle('armed', armed); clear.hidden = !all.length;
  const list = hist.querySelector('[data-list]');
  if (!items.length) {
    const label = RANGES.find(([d]) => d === histRange)[1].toLowerCase();
    list.innerHTML = `<div class="beam-empty">${all.length ? `Nothing sent ${histRange === 1 ? 'today' : `in the last ${label}`}.<br><button type="button" data-showall>Show all ${all.length}</button>` : 'Nothing sent yet.<br>Everything you send shows up here.'}</div>`;
    return;
  }
  let html = '', day = '';
  items.forEach((x, i) => {
    const label = dayLabel(x.t);
    if (label !== day) { day = label; html += `<div class="beam-day">${esc(label)}</div>`; }
    const time = new Date(x.t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const emoji = x.kind === 'link' ? '🔗' : x.kind === 'file' ? '📎' : '📝';
    const head = x.kind === 'text' ? '' : `<div class="tt">${esc(x.kind === 'file' ? x.fileName : x.title)}</div>`;
    const body = x.kind === 'file' ? (x.text || fmtSize(x.fileSize || 0)) : x.text;
    html += `<div class="beam-item" data-id="${esc(x.id)}" style="animation-delay:${Math.min(i, 12) * 18}ms">
      <div class="e">${emoji}</div>
      <div>${head}<div class="bd">${esc(body)}</div><div class="mt">${esc(time)} · ${esc(x.topic || '')}</div></div>
      <div class="acts">
        ${x.kind === 'link' ? `<button type="button" data-act="open" title="Open" aria-label="Open link">${ACT.open}</button>` : ''}
        ${x.kind === 'file' ? '' : `<button type="button" data-act="copy" title="Copy" aria-label="Copy">${ACT.copy}</button>
        <button type="button" data-act="resend" title="Send again" aria-label="Send again">${ACT.resend}</button>`}
        <button type="button" data-act="del" title="Remove" aria-label="Remove from history">${ACT.del}</button>
      </div>
    </div>`;
  });
  list.innerHTML = html;
}
function openHistory() {
  if (!hist) buildHistory();
  histRange = 7; clearArmed = 0;
  renderHistory(); hist.showModal();
  hist.querySelector('[data-list]').scrollTop = 0;
}

/* ---------- sound: tiny synthesized effects, no audio files ---------- */
let ac, master, noiseBuf;
const soundOn = () => store.get('sound', '1') === '1';
function audio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ac) {
    ac = new AC();
    const comp = ac.createDynamicsCompressor();
    master = ac.createGain(); master.gain.value = .55;
    master.connect(comp).connect(ac.destination);
  }
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
// Browsers only allow audio after a user gesture: warm the context up on the first one.
const unlock = () => { if (soundOn()) audio(); };
addEventListener('pointerdown', unlock, { once: true, capture: true });
addEventListener('keydown', unlock, { once: true, capture: true });

function env(g, now, gain, attack, dur) {
  g.gain.setValueAtTime(.0001, now);
  g.gain.exponentialRampToValueAtTime(gain, now + attack);
  g.gain.exponentialRampToValueAtTime(.0001, now + dur);
}
function tone({ f = 440, f2, type = 'sine', t = 0, dur = .2, gain = .1, attack = .005, lp }) {
  const now = ac.currentTime + t, o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, now);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + dur);
  env(g, now, gain, attack, dur);
  let node = o;
  if (lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; node = node.connect(fl); }
  node.connect(g).connect(master);
  o.start(now); o.stop(now + dur + .05);
}
function noise({ t = 0, dur = .1, gain = .1, type = 'bandpass', f = 1000, f2, q = 1, attack = .002 }) {
  if (!noiseBuf) {
    noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const now = ac.currentTime + t, s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
  s.buffer = noiseBuf; s.loop = true;
  fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, now);
  if (f2) fl.frequency.exponentialRampToValueAtTime(f2, now + dur);
  env(g, now, gain, attack, dur);
  s.connect(fl).connect(g).connect(master);
  s.start(now, Math.random() * .5); s.stop(now + dur + .05);
}
const SFX = {
  tap: () => tone({ f: 1500, type: 'triangle', dur: .06, gain: .06 }),
  swap: () => { tone({ f: 660, dur: .12, gain: .04 }); tone({ f: 990, t: .06, dur: .16, gain: .04 }); },
  send: () => { noise({ dur: .5, f: 400, f2: 3800, q: .9, gain: .09, attack: .18 }); tone({ f: 300, f2: 820, dur: .45, gain: .035, attack: .12 }); },
  deliver: () => { tone({ f: 880, dur: .55, gain: .1 }); tone({ f: 1318.5, t: .09, dur: .8, gain: .1 }); tone({ f: 2637, t: .09, dur: .35, gain: .015 }); },
  error: () => { tone({ f: 311, type: 'triangle', dur: .2, gain: .12 }); tone({ f: 233, type: 'triangle', t: .15, dur: .35, gain: .12 }); },
  buzz: () => { for (let i = 0; i < 2; i++) tone({ f: 155, type: 'sawtooth', t: i * .17, dur: .12, gain: .05, attack: .015, lp: 600 }); },
  charge: () => { tone({ f: 160, f2: 880, dur: .85, gain: .06, attack: .35 }); tone({ f: 163, f2: 890, type: 'triangle', dur: .85, gain: .025, attack: .35 }); },
  zap: () => { tone({ f: 1700, f2: 90, type: 'sawtooth', dur: .38, gain: .06, lp: 3200 }); noise({ dur: .55, type: 'lowpass', f: 3000, f2: 180, gain: .12 }); tone({ f: 58, f2: 38, dur: .55, gain: .22 }); },
  key: () => { tone({ f: 150, f2: 60, dur: .09, gain: .22 }); noise({ dur: .035, type: 'highpass', f: 2800, gain: .1 }); },
  type: () => noise({ dur: .022, type: 'bandpass', f: 2600 + Math.random() * 1600, q: 2.5, gain: .05 }),
  feed: ({ steps = 16, dur = 1 } = {}) => {
    for (let i = 0; i < steps; i++) noise({ t: (i * dur) / steps, dur: .028, type: 'bandpass', f: 1700 + (i % 2) * 300, q: 3, gain: .08 });
    tone({ f: 92, type: 'square', dur, gain: .02, attack: .05, lp: 380 });
  },
  bell: () => [1, 2.76, 5.4].forEach((m, i) => tone({ f: 1568 * m, dur: 1.3 / (i + 1), gain: .08 / (i + 1) })),
  stamp: () => { tone({ f: 115, f2: 45, dur: .2, gain: .32 }); noise({ dur: .13, type: 'lowpass', f: 900, gain: .22 }); },
};
/** Play a named effect (optionally after `delay` ms). Silent when sound is off or unsupported. */
function sfx(name, opts, delay = 0) {
  if (!soundOn() || !SFX[name]) return;
  const play = () => { if (audio()) try { SFX[name](opts); } catch {} };
  delay ? setTimeout(play, delay) : play();
}
const setSound = (on) => store.set('sound', on ? '1' : '0');

export const Beam = {
  cfg, store, firstRun, reducedMotion, detect, send, wire, pickFile, fmtSize, serverHost, openSettings,
  sfx, soundOn, setSound, history, openHistory,
  /** Subscribe to config changes; unsubscribed automatically when `signal` aborts. */
  onConfig(fn, signal) { listeners.add(fn); signal?.addEventListener('abort', () => listeners.delete(fn)); fn(cfg); },
};
