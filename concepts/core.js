/* Beam core: config, content detection, sending, input wiring and the settings sheet.
   Every design loads this and only does its own visuals. Exposes window.Beam. */
(() => {
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
    return { ms: Math.round(performance.now() - t0), kind: d.kind };
  }

  /** Paste/drop/shortcut wiring shared by all designs. */
  function wire({ input, onFile, onDrag, onSend }) {
    input.addEventListener('paste', (e) => {
      const f = [...(e.clipboardData?.files || [])][0];
      if (!f) return;
      e.preventDefault();
      onFile(f.name === 'image.png' ? new File([f], `paste-${Date.now()}.png`, { type: f.type }) : f);
    });
    let depth = 0;
    addEventListener('dragenter', (e) => { e.preventDefault(); if (++depth === 1) onDrag?.(true); });
    addEventListener('dragleave', () => { if (--depth <= 0) { depth = 0; onDrag?.(false); } });
    addEventListener('dragover', (e) => e.preventDefault());
    addEventListener('drop', (e) => {
      e.preventDefault(); depth = 0; onDrag?.(false);
      const f = e.dataTransfer.files[0];
      if (f) return onFile(f);
      const t = e.dataTransfer.getData('text');
      if (t) { input.value = t; input.dispatchEvent(new Event('input')); }
    });
    addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onSend(); }
    });
    const p = new URLSearchParams(location.search);
    const pre = p.get('text') || p.get('url');
    if (pre) { input.value = pre; queueMicrotask(() => input.dispatchEvent(new Event('input'))); }
  }

  const pickFile = () => new Promise((resolve) => {
    const i = Object.assign(document.createElement('input'), { type: 'file' });
    i.onchange = () => resolve(i.files[0] || null);
    i.click();
  });

  /* ---------- settings sheet (themed by the page's --beam-* variables) ---------- */
  let dlg;
  function buildSettings() {
    const css = document.createElement('style');
    css.textContent = `
      .beam-dlg { position: fixed; inset: 0; margin: auto; height: fit-content; max-height: calc(100dvh - 32px); border: 0; padding: 0; background: none; color: var(--beam-ink, #111); width: min(420px, calc(100vw - 32px)); max-width: none; overflow: visible; }
      .beam-dlg::backdrop { background: rgb(0 0 0 / .4); backdrop-filter: blur(6px); }
      .beam-dlg[open] .beam-sheet { animation: beam-pop .32s cubic-bezier(.2, 1.3, .4, 1); }
      @keyframes beam-pop { from { opacity: 0; transform: translateY(12px) scale(.96); } }
      .beam-sheet { display: grid; gap: 14px; padding: 20px; background: var(--beam-bg, #fff); border: 1px solid var(--beam-line, #e5e5e5);
        border-radius: var(--beam-radius, 18px); font: 14px/1.5 var(--beam-font, system-ui, sans-serif); box-shadow: 0 30px 80px -20px rgb(0 0 0 / .45); }
      .beam-sheet h2 { font-size: 15px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
      .beam-sheet label { display: grid; gap: 6px; font-size: 12px; color: var(--beam-muted, #888); }
      .beam-sheet input { width: 100%; font: 13.5px var(--beam-mono, ui-monospace, Menlo, monospace); color: inherit; background: var(--beam-field, rgb(127 127 127 / .08));
        border: 1px solid var(--beam-line, #e5e5e5); border-radius: calc(var(--beam-radius, 18px) * .55); padding: 9px 11px; outline: 0; }
      .beam-sheet input:focus { border-color: var(--beam-accent, #4f6bff); }
      .beam-row { display: flex; gap: 8px; }
      .beam-sheet button { font: inherit; cursor: pointer; color: inherit; background: none; border: 1px solid var(--beam-line, #e5e5e5);
        border-radius: calc(var(--beam-radius, 18px) * .55); padding: 0 12px; }
      .beam-sheet button:hover { background: var(--beam-field, rgb(127 127 127 / .08)); }
      .beam-sheet .beam-done { padding: 10px; font-weight: 600; background: var(--beam-ink, #111); color: var(--beam-bg, #fff); border: 0; }
      .beam-sheet .beam-done:hover { background: var(--beam-ink, #111); opacity: .9; }
      .beam-sheet .beam-x { border: 0; font-size: 20px; line-height: 1; padding: 2px 6px; color: var(--beam-muted, #888); }
      .beam-sheet p { font-size: 12.5px; color: var(--beam-muted, #888); }
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

  /* ---------- the dock: design switcher + sound toggle, bottom-right, quiet until hovered ---------- */
  const ICON = (d) => `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const DESIGNS = [
    ['classic', 'Classic', '<rect x="4" y="6" width="16" height="12" rx="3"/><path d="M8 10h8"/>'],
    ['lockscreen', 'Lockscreen', '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 6h2"/>'],
    ['signal', 'Signal', '<circle cx="12" cy="12" r="2.2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4"/>'],
    ['teleprinter', 'Teleprinter', '<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/><path d="M9 8h6M9 12h4"/>'],
  ];
  const SPEAKER = '<path d="M11 5 6 9H3v6h3l5 4z"/>';
  const SOUND_ON = ICON(SPEAKER + '<path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>');
  const SOUND_OFF = ICON(SPEAKER + '<path d="m16 9 5 6M21 9l-5 6"/>');

  function buildDock() {
    const current = (location.pathname.match(/(lockscreen|signal|teleprinter)/) || [, 'classic'])[1];
    const href = (id) => id === 'classic' ? '/' : `/concepts/${id}.html`;
    const css = document.createElement('style');
    css.textContent = `
      .beam-dock { position: fixed; right: 16px; bottom: 16px; z-index: 100; display: flex; align-items: center; gap: 2px; padding: 4px;
        border-radius: 999px; border: 1px solid var(--beam-line, var(--line, rgb(127 127 127 / .25)));
        background: color-mix(in srgb, var(--beam-bg, var(--card, #fff)) 78%, transparent); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
        color: var(--beam-muted, var(--muted, #888)); font: 11px/1 var(--beam-font, system-ui, sans-serif); opacity: .45; transition: opacity .3s; }
      .beam-dock:hover, .beam-dock:focus-within { opacity: 1; }
      @media (pointer: coarse) { .beam-dock { opacity: .7; } }
      .beam-dock a, .beam-dock button { position: relative; width: 28px; height: 28px; display: grid; place-items: center; border: 0; border-radius: 50%;
        background: none; color: inherit; cursor: pointer; transition: background .2s, color .2s; }
      .beam-dock a:hover, .beam-dock button:hover, .beam-dock a[aria-current] { color: var(--beam-ink, var(--ink, #111)); background: rgb(127 127 127 / .14); }
      .beam-dock button[aria-pressed="false"] { opacity: .6; }
      .beam-dock i { width: 1px; height: 14px; margin: 0 4px; background: currentColor; opacity: .3; }
      .beam-dock [data-tip]:hover::after { content: attr(data-tip); position: absolute; bottom: calc(100% + 9px); left: 50%; translate: -50% 0; white-space: nowrap;
        padding: 4px 8px; border-radius: 6px; background: var(--beam-ink, var(--ink, #111)); color: var(--beam-bg, var(--card, #fff)); pointer-events: none; }
      .beam-dock > :last-child:hover::after { left: auto; right: 0; translate: 0; }`;
    document.head.append(css);
    const dock = document.createElement('nav');
    dock.className = 'beam-dock'; dock.setAttribute('aria-label', 'Design and sound');
    dock.innerHTML = DESIGNS.map(([id, name, d]) =>
      `<a href="${href(id)}" data-tip="${name}" aria-label="${name} design"${id === current ? ' aria-current="page"' : ''}>${ICON(d)}</a>`).join('')
      + '<i></i><button type="button" id="beam-sound"></button>';
    document.body.append(dock);
    const btn = dock.querySelector('#beam-sound');
    const paint = () => {
      const on = soundOn();
      btn.innerHTML = on ? SOUND_ON : SOUND_OFF;
      btn.setAttribute('aria-pressed', on); btn.dataset.tip = on ? 'Sound on' : 'Sound off';
      btn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
    };
    btn.onclick = () => { store.set('sound', soundOn() ? '0' : '1'); paint(); sfx('tap'); };
    dock.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => sfx('tap')));
    paint();
  }
  document.readyState === 'loading' ? addEventListener('DOMContentLoaded', buildDock) : buildDock();

  window.Beam = {
    cfg, firstRun, reducedMotion, detect, send, wire, pickFile, fmtSize, serverHost, openSettings, sfx,
    soundOn, onConfig: (fn) => { listeners.add(fn); fn(cfg); },
  };
})();
