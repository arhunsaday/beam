import { Beam } from '../core.js';

export const theme = '#05060a';

export const css = `
  :root {
    --bg: #05060a; --ink: #e8f0ff; --muted: #5a6275; --line: #1b1f2a; --accent: #7df9ff; --accent2: #a58bff; --err: #ff5d73;
    --beam-bg: #0b0d14; --beam-ink: var(--ink); --beam-muted: #8590a6; --beam-line: #232838; --beam-accent: var(--accent); --beam-field: #070910;
    --beam-font: Geist, system-ui, sans-serif; --beam-mono: "Geist Mono", ui-monospace, monospace; --beam-radius: 16px;
    color-scheme: dark;
  }
  * { box-sizing: border-box; margin: 0; }
  html, body { height: 100%; }
  body { background: var(--bg); color: var(--ink); font: 15px/1.5 Geist, system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow: hidden; }
  body::after { content: ""; position: fixed; inset: 0; pointer-events: none;
    background: radial-gradient(60% 45% at 50% 62%, rgb(125 249 255 / .07), transparent 70%), radial-gradient(120% 80% at 50% 120%, rgb(165 139 255 / .12), transparent 60%); }
  canvas { position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; }
  #fx { z-index: 10; }

  header { position: fixed; top: 0; left: 0; right: 0; display: flex; justify-content: space-between; align-items: center; padding: 22px 28px; z-index: 5;
           font: 12px "Geist Mono", monospace; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
  header b { color: var(--ink); font-weight: 500; } header b span { color: var(--accent); }
  .topic { border: 0; background: none; color: inherit; font: inherit; letter-spacing: .04em; text-transform: none; cursor: pointer; padding: 6px 10px; border-radius: 8px;
           max-width: 60vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .topic:hover { color: var(--ink); background: rgb(255 255 255 / .05); }

  main { position: relative; z-index: 2; height: 100%; display: grid; place-items: center; padding: 90px 20px 60px; }
  .stage { width: 100%; max-width: 760px; display: grid; justify-items: center; gap: 26px; }
  .status { font: 12px "Geist Mono", monospace; letter-spacing: .22em; color: var(--muted); display: flex; align-items: center; gap: 10px; height: 18px; }
  .status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; box-shadow: 0 0 10px currentColor; }
  .status.armed { color: var(--accent); } .status.err { color: var(--err); } .status.busy::before { animation: blink .5s steps(2) infinite; }
  @keyframes blink { 50% { opacity: .2; } }
  textarea { width: 100%; resize: none; border: 0; outline: 0; background: none; color: var(--ink); caret-color: var(--accent); text-align: center;
             font: 300 clamp(24px, 4.4vw, 40px)/1.25 Geist, system-ui, sans-serif; letter-spacing: -.02em; max-height: 38vh; overflow-y: auto; padding: 0 10px; }
  textarea::placeholder { color: #2c3242; }
  textarea.vanish { color: transparent; }
  .drag textarea::placeholder { color: var(--accent); }
  .file { display: none; align-items: center; gap: 10px; padding: 8px 8px 8px 14px; border: 1px solid var(--line); border-radius: 999px;
          font: 13px "Geist Mono", monospace; color: var(--ink); background: rgb(255 255 255 / .02); }
  .file.on { display: inline-flex; } .file.vanish { visibility: hidden; }
  .file span { color: var(--muted); }
  .file button { border: 0; background: rgb(255 255 255 / .06); color: var(--muted); width: 22px; height: 22px; border-radius: 50%; cursor: pointer; }

  .controls { display: flex; align-items: center; gap: 22px; margin-top: 6px; }
  .side { width: 44px; height: 44px; border: 1px solid var(--line); border-radius: 50%; background: none; color: var(--muted); display: grid; place-items: center; cursor: pointer; transition: .2s; }
  .side:hover { color: var(--ink); border-color: #2b3142; }
  .side.ghost { visibility: hidden; }
  .tx { position: relative; width: 96px; height: 96px; border: 0; border-radius: 50%; background: none; cursor: pointer; display: grid; place-items: center; }
  .tx .ring { position: absolute; inset: 0; border-radius: 50%; padding: 1.5px;
              background: conic-gradient(from 0deg, transparent 0 25%, var(--accent) 55%, var(--accent2) 75%, transparent 90%);
              -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude;
              animation: spin 6s linear infinite; opacity: .35; transition: opacity .4s; }
  .tx .track { position: absolute; inset: 0; border-radius: 50%; border: 1px solid var(--line); }
  .tx .core { width: 62px; height: 62px; border-radius: 50%; display: grid; place-items: center; color: #3a4154; background: radial-gradient(circle at 50% 35%, #161a26, #0b0d14);
              border: 1px solid #1d2230; transition: all .4s cubic-bezier(.2, 1.3, .4, 1); }
  .tx.armed .ring { opacity: 1; animation-duration: 1.8s; }
  .tx.armed .core { color: #021014; background: radial-gradient(circle at 50% 30%, #e8feff, var(--accent) 60%, #2bb6c4);
                    border-color: transparent; box-shadow: 0 0 30px rgb(125 249 255 / .45), 0 0 80px rgb(125 249 255 / .18); }
  .tx.armed:hover .core { transform: scale(1.06); }
  .tx.armed:active .core { transform: scale(.94); }
  .tx.fire .core { animation: fire .5s cubic-bezier(.2, 1.4, .4, 1); }
  @keyframes fire { 30% { transform: scale(.82); box-shadow: 0 0 60px #fff, 0 0 140px var(--accent); background: #fff; } }
  .tx.hold .core { animation: hold .9s ease-in-out infinite; }
  @keyframes hold { 50% { box-shadow: 0 0 50px rgb(125 249 255 / .8), 0 0 120px rgb(125 249 255 / .3); } }
  .wave { position: absolute; inset: 0; border-radius: 50%; border: 1.5px solid var(--accent); pointer-events: none; }
  @keyframes spin { to { transform: rotate(1turn); } }
  .hint { font: 11.5px "Geist Mono", monospace; color: #3a4154; letter-spacing: .06em; }
  .hint kbd { font: inherit; color: var(--muted); }
  @media (pointer: coarse) { .hint { display: none; } }
`;

export const html = `
<canvas id="stars"></canvas>
<canvas id="fx"></canvas>
<header><b>Beam<span>/</span>Signal</b><button class="topic" id="topic"></button></header>
<main>
  <div class="stage">
    <div class="status" id="status">STANDBY</div>
    <textarea id="msg" rows="1" placeholder="Say something to your phone"></textarea>
    <div class="file" id="file"><span>FILE</span><b id="fname"></b><span id="fsize"></span><button id="unfile" aria-label="Remove file">×</button></div>
    <div class="controls">
      <button class="side" id="attach" aria-label="Attach file"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m21.4 11.1-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8l8.5-8.5a3.7 3.7 0 0 1 5.2 5.2l-8.5 8.5a1.8 1.8 0 0 1-2.6-2.6l7.8-7.8"/></svg></button>
      <button class="tx" id="tx" aria-label="Transmit"><span class="track"></span><span class="ring"></span>
        <span class="core"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></span></button>
      <button class="side ghost" aria-hidden="true" tabindex="-1"></button>
    </div>
    <div class="hint"><kbd id="mod">⌘</kbd> <kbd>↵</kbd> transmit · drop a file anywhere</div>
  </div>
</main>
`;

const ease = (t) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function mount({ signal, draft }) {
  const $ = (id) => document.getElementById(id);
  const msg = $('msg'), tx = $('tx'), statusEl = $('status'), fileEl = $('file');
  const on = (target, ev, fn) => target.addEventListener(ev, fn, { signal });
  let file = null, busy = false;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const RM = Beam.reducedMotion;

  /* ---------- status line with a decoding effect ---------- */
  let scrambleId = 0, lastStatus = '';
  function status(text, cls = '') {
    statusEl.className = 'status ' + cls;
    const id = ++scrambleId, glyphs = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#/·';
    if (RM) return void (statusEl.textContent = text);
    const start = performance.now(), dur = 380;
    (function step(now) {
      if (id !== scrambleId || signal.aborted) return;
      const p = Math.min(1, (now - start) / dur), n = Math.floor(p * text.length);
      statusEl.textContent = text.slice(0, n) + [...text.slice(n)].map((c) => c === ' ' ? ' ' : glyphs[Math.random() * glyphs.length | 0]).join('');
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }
  function idleStatus() {
    const d = Beam.detect(msg.value, file);
    const s = d.kind === 'empty' ? 'STANDBY' : d.kind === 'link' ? `LINK — ${d.host.toUpperCase()}` : d.kind === 'file' ? `FILE — ${d.size}` : `NOTE — ${msg.value.trim().length} CH`;
    tx.classList.toggle('armed', d.kind !== 'empty');
    if (s !== lastStatus) { lastStatus = s; status(s, d.kind === 'empty' ? '' : 'armed'); }
  }

  /* ---------- starfield ---------- */
  const sc = $('stars'), sx = sc.getContext('2d'), fc = $('fx'), fx = fc.getContext('2d');
  let W, H, stars = [], warp = 0, mx = 0, my = 0;
  function resize() {
    W = innerWidth; H = innerHeight;
    for (const c of [sc, fc]) { c.width = W * dpr; c.height = H * dpr; c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0); }
    stars = Array.from({ length: Math.round(W * H / 5000) }, () => ({ x: Math.random() * W, y: Math.random() * H, z: Math.random() * .9 + .1, tw: Math.random() * 6 }));
  }
  resize();
  on(window, 'resize', resize);
  on(window, 'pointermove', (e) => { mx = (e.clientX / W - .5); my = (e.clientY / H - .5); });
  function drawStars(t) {
    sx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const v = s.z * (.15 + warp * 26);
      s.y -= v; if (s.y < -30) { s.y = H + 10; s.x = Math.random() * W; }
      const x = s.x - mx * 24 * s.z, y = s.y - my * 24 * s.z;
      const a = (.25 + .6 * s.z) * (.6 + .4 * Math.sin(t / 700 + s.tw));
      if (warp > .02) {
        sx.strokeStyle = `rgba(190, 240, 255, ${a})`; sx.lineWidth = s.z * 1.4;
        sx.beginPath(); sx.moveTo(x, y); sx.lineTo(x, y + v * 3); sx.stroke();
      } else {
        sx.fillStyle = `rgba(200, 225, 255, ${a})`;
        sx.fillRect(x, y, s.z * 1.6, s.z * 1.6);
      }
    }
  }

  /* ---------- particle effects ---------- */
  let parts = [], phase = 'idle', phaseStart = 0;

  function sampleText(el, text) {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    const c = document.createElement('canvas'); c.width = Math.ceil(r.width); c.height = Math.ceil(r.height);
    const g = c.getContext('2d', { willReadFrequently: true });
    g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`; g.fillStyle = '#fff'; g.textBaseline = 'top';
    const padL = parseFloat(cs.paddingLeft), padR = parseFloat(cs.paddingRight), maxW = r.width - padL - padR;
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.25, center = cs.textAlign === 'center';
    const lines = [];
    for (const para of text.split('\n')) {
      let line = '';
      for (const word of para.split(/(\s+)/)) {
        if (g.measureText(line + word).width > maxW && line.trim()) { lines.push(line); line = word.trimStart(); }
        else line += word;
        while (g.measureText(line).width > maxW) { let i = line.length; while (i > 1 && g.measureText(line.slice(0, i)).width > maxW) i--; lines.push(line.slice(0, i)); line = line.slice(i); }
      }
      lines.push(line);
    }
    const top = parseFloat(cs.paddingTop) - el.scrollTop + (lh - parseFloat(cs.fontSize)) / 2;
    lines.forEach((l, i) => {
      g.textAlign = center ? 'center' : 'left';
      g.fillText(l, center ? r.width / 2 : padL, top + i * lh);
    });
    const data = g.getImageData(0, 0, c.width, c.height).data;
    let lit = 0; for (let i = 3; i < data.length; i += 4) if (data[i] > 128) lit++;
    const gap = Math.max(2, Math.ceil(Math.sqrt(lit / 2600)));
    const out = [];
    for (let y = 0; y < c.height; y += gap) for (let x = 0; x < c.width; x += gap)
      if (data[(y * c.width + x) * 4 + 3] > 128) out.push({ ox: r.left + x, oy: r.top + y, x: r.left + x, y: r.top + y, d: Math.random() * 180, s: gap * .8, vx: 0, vy: 0 });
    return out;
  }

  function drawFx(now) {
    fx.clearRect(0, 0, W, H);
    if (phase === 'idle') return;
    const t = now - phaseStart, b = tx.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2;
    fx.globalCompositeOperation = 'lighter';

    if (phase === 'in' || phase === 'hold') {
      for (const p of parts) {
        const k = ease(Math.min(1, Math.max(0, (t - p.d) / 560)));
        const ang = now / 260 + p.ox * .05, rad = phase === 'hold' ? 6 + (p.oy % 9) : 0;
        p.x = p.ox + (cx + Math.cos(ang) * rad * k - p.ox) * k;
        p.y = p.oy + (cy + Math.sin(ang) * rad * k - p.oy) * k - Math.sin(k * Math.PI) * 60;
        fx.fillStyle = k > .6 ? `rgba(125, 249, 255, ${1 - k * .4})` : `rgba(232, 240, 255, ${1 - k * .3})`;
        fx.fillRect(p.x, p.y, p.s, p.s);
      }
      if (phase === 'in' && t > 760) phase = 'hold';
    }

    if (phase === 'up') {
      const k = Math.min(1, t / 900), w = (1 - k) * 14 + 1;
      const grd = fx.createLinearGradient(0, cy, 0, 0);
      grd.addColorStop(0, `rgba(255, 255, 255, ${1 - k})`); grd.addColorStop(.3, `rgba(125, 249, 255, ${.9 * (1 - k)})`); grd.addColorStop(1, 'rgba(165, 139, 255, 0)');
      fx.fillStyle = grd; fx.shadowColor = '#7df9ff'; fx.shadowBlur = 40 * (1 - k);
      fx.fillRect(cx - w / 2, 0, w, cy - b.height / 2 + 6);
      fx.shadowBlur = 0;
      let alive = 0;
      for (const p of parts) {
        p.vy -= .9 + p.s * .05; p.x += p.vx; p.y += p.vy; p.vx *= .96;
        if (p.y < -40) continue; alive++;
        fx.strokeStyle = 'rgba(125, 249, 255, .85)'; fx.lineWidth = p.s * .7;
        fx.beginPath(); fx.moveTo(p.x, p.y); fx.lineTo(p.x - p.vx * 2, p.y - p.vy * 1.8); fx.stroke();
      }
      if (k >= 1 && !alive) phase = 'idle';
    }

    if (phase === 'back') {
      let done = true;
      for (const p of parts) {
        const k = ease(Math.min(1, Math.max(0, (t - p.d * .5) / 520)));
        if (k < 1) done = false;
        const x = p.hx + (p.ox - p.hx) * k, y = p.hy + (p.oy - p.hy) * k + Math.sin(k * Math.PI) * 40;
        fx.fillStyle = `rgba(255, 93, 115, ${1 - k * .5})`; fx.fillRect(x, y, p.s, p.s);
      }
      if (done) { phase = 'idle'; msg.classList.remove('vanish'); fileEl.classList.remove('vanish'); }
    }
    fx.globalCompositeOperation = 'source-over';
  }

  (function loop(now) {
    if (signal.aborted) return;
    drawStars(now); drawFx(now);
    requestAnimationFrame(loop);
  })(performance.now());

  function shockwave() {
    for (let i = 0; i < 3; i++) {
      const w = document.createElement('span'); w.className = 'wave'; tx.append(w);
      w.animate([{ transform: 'scale(1)', opacity: .8 }, { transform: 'scale(5)', opacity: 0 }], { duration: 1100, delay: i * 140, easing: 'cubic-bezier(.1, .7, .3, 1)', fill: 'backwards' }).finished.then(() => w.remove(), () => w.remove());
    }
  }
  function doWarp() {
    const start = performance.now();
    (function s(now) { const k = (now - start) / 1300; warp = k < 1 ? Math.sin(Math.PI * Math.min(1, k * 1.6)) ** 2 * (1 - k) : 0; if (k < 1 && !signal.aborted) requestAnimationFrame(s); })(start);
  }

  /* ---------- transmit ---------- */
  async function transmit() {
    const d = Beam.detect(msg.value, file);
    if (d.kind === 'empty' || busy) return;
    busy = true;
    const src = file ? fileEl : msg;
    parts = RM ? [] : sampleText(src, file ? fileEl.textContent.replace('×', '').trim() : msg.value);
    if (parts.length) { src.classList.add('vanish'); phase = 'in'; phaseStart = performance.now(); }
    status('TRANSMITTING', 'armed busy'); tx.classList.add('hold');
    Beam.sfx(parts.length ? 'charge' : 'send');
    const req = Beam.send({ text: msg.value, file });
    try {
      const [{ ms }] = await Promise.all([req, wait(parts.length ? 780 : 0)]);
      if (signal.aborted) return;
      tx.classList.remove('hold', 'fire'); void tx.offsetWidth; tx.classList.add('fire');
      for (const p of parts) { p.vx = (Math.random() - .5) * 6; p.vy = -Math.random() * 8 - 4; }
      phase = 'up'; phaseStart = performance.now();
      if (!RM) { shockwave(); doWarp(); }
      Beam.sfx('zap'); Beam.sfx('deliver', null, 380);
      navigator.vibrate?.(30);
      msg.value = ''; msg.classList.remove('vanish'); fitHeight(); setFile(null, true);
      lastStatus = `DELIVERED · ${ms} MS`; status(lastStatus, 'armed');
      await wait(2200); lastStatus = ''; if (!busy && !signal.aborted) idleStatus();
    } catch (e) {
      if (signal.aborted) return;
      tx.classList.remove('hold');
      Beam.sfx('error');
      await wait(parts.length ? 780 : 0);
      for (const p of parts) { p.hx = p.x; p.hy = p.y; }
      phase = parts.length ? 'back' : 'idle'; phaseStart = performance.now();
      if (!parts.length) { msg.classList.remove('vanish'); fileEl.classList.remove('vanish'); }
      lastStatus = 'FAILED — ' + e.message.toUpperCase(); status(lastStatus, 'err');
    } finally { busy = false; }
  }

  /* ---------- inputs ---------- */
  function fitHeight() { msg.style.height = 'auto'; msg.style.height = msg.scrollHeight + 'px'; }
  function setFile(f, quiet) {
    file = f || null;
    fileEl.classList.toggle('on', !!file); fileEl.classList.remove('vanish');
    if (file) { $('fname').textContent = file.name; $('fsize').textContent = Beam.fmtSize(file.size); }
    msg.placeholder = file ? 'Add a message (optional)' : 'Say something to your phone';
    if (!quiet) { idleStatus(); msg.focus(); }
  }
  msg.addEventListener('input', () => { fitHeight(); idleStatus(); });
  tx.onclick = transmit;
  $('attach').onclick = async () => { const f = await Beam.pickFile(); if (f) setFile(f); };
  $('unfile').onclick = () => setFile(null);
  $('topic').onclick = Beam.openSettings;
  Beam.onConfig((c) => { $('topic').textContent = `${Beam.serverHost()}/${c.topic}`; }, signal);
  if (!/Mac|iPhone|iPad/.test(navigator.platform)) $('mod').textContent = 'CTRL';
  Beam.wire({ input: msg, onFile: setFile, onSend: transmit, onDrag: (v) => document.body.classList.toggle('drag', v), signal });

  msg.value = draft.text || '';
  setFile(draft.file);
  fitHeight();
  document.fonts.ready.then(() => { if (!signal.aborted) fitHeight(); });
  return () => ({ text: msg.value, file });
}
