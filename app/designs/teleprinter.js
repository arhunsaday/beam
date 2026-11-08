import { Beam } from '../core.js';

export const theme = '#e8e2d6';

export const css = `
  :root {
    --desk: #e8e2d6; --ink: #24211c; --muted: #8c8579; --paper: #fbf9f3; --body: #f4f0e6; --body2: #ddd6c7; --edge: #c9c0ae;
    --red: #e5482d; --green: #41c26b; --lcd: #b9d37a; --lcdbg: #27301d;
    --beam-bg: var(--paper); --beam-ink: var(--ink); --beam-muted: var(--muted); --beam-line: #ddd5c4; --beam-accent: var(--red); --beam-field: #f2eee4;
    --beam-font: "IBM Plex Mono", monospace; --beam-mono: "IBM Plex Mono", monospace; --beam-radius: 6px;
    color-scheme: light;
  }
  @media (prefers-color-scheme: dark) {
    :root { --desk: #181715; --muted: #8b857a; --body: #2a2825; --body2: #1f1d1b; --edge: #3a3733; }
  }
  * { box-sizing: border-box; margin: 0; }
  body { min-height: 100vh; background: var(--desk); color: var(--ink); font: 14px/1.5 "IBM Plex Mono", monospace; -webkit-font-smoothing: antialiased;
         display: flex; justify-content: center; padding: 56px 16px 80px; overflow-x: hidden; }
  body::before { content: ""; position: fixed; inset: 0; pointer-events: none; opacity: .5; mix-blend-mode: multiply;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .45 0 0 0 0 .4 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
  .desk { width: 100%; max-width: 480px; }

  .machine { position: relative; z-index: 3; border-radius: 22px 22px 14px 14px; padding: 18px 20px 26px;
             background: linear-gradient(var(--body), var(--body2)); color: var(--ink);
             box-shadow: inset 0 1.5px 0 rgb(255 255 255 / .55), inset 0 -3px 0 rgb(0 0 0 / .08), 0 1px 0 var(--edge), 0 22px 40px -18px rgb(60 40 20 / .45), 0 4px 10px -4px rgb(60 40 20 / .25); }
  @media (prefers-color-scheme: dark) { .machine { color: #e9e4d9; box-shadow: inset 0 1px 0 rgb(255 255 255 / .08), 0 22px 40px -18px #000; } }
  .machine.work { animation: hum .09s linear infinite; }
  @keyframes hum { 50% { transform: translate(.4px, -.3px); } }
  .row { display: flex; align-items: center; gap: 14px; }
  .label { flex: 1; min-width: 0; }
  .label b { display: block; font-weight: 600; letter-spacing: .18em; font-size: 15px; }
  .label small { display: block; font-size: 10px; letter-spacing: .14em; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .lcd { width: 150px; height: 44px; border-radius: 6px; background: var(--lcdbg); color: var(--lcd); padding: 0 10px;
         display: flex; align-items: center; justify-content: space-between; font: 24px/1 VT323, monospace; letter-spacing: .04em;
         text-shadow: 0 0 6px rgb(185 211 122 / .55); box-shadow: inset 0 2px 6px rgb(0 0 0 / .6), 0 1px 0 rgb(255 255 255 / .4); overflow: hidden; white-space: nowrap; }
  .lcd.err { color: #ff8a6e; text-shadow: 0 0 6px rgb(255 138 110 / .6); }
  .led { width: 9px; height: 9px; border-radius: 50%; background: #5d5850; box-shadow: inset 0 1px 1px rgb(0 0 0 / .4); flex: none; }
  .led.on { background: var(--green); box-shadow: 0 0 8px var(--green), 0 0 2px #fff inset; }
  .led.blink { background: #ffb02e; box-shadow: 0 0 8px #ffb02e; animation: led .18s steps(2) infinite; }
  .led.err { background: var(--red); box-shadow: 0 0 8px var(--red); }
  @keyframes led { 50% { opacity: .25; } }
  .key { width: 62px; height: 44px; border: 0; border-radius: 10px; cursor: pointer; flex: none; font: 600 11px "IBM Plex Mono", monospace; letter-spacing: .12em; color: #fff;
         background: linear-gradient(#f05a3c, #d73d22); box-shadow: 0 4px 0 #a52c16, 0 6px 10px -2px rgb(120 30 10 / .5), inset 0 1px 0 rgb(255 255 255 / .35);
         transition: transform .06s, box-shadow .06s, filter .2s; }
  .key:active, .key.down { transform: translateY(3px); box-shadow: 0 1px 0 #a52c16, 0 2px 4px -1px rgb(120 30 10 / .5), inset 0 1px 0 rgb(255 255 255 / .35); }
  .key:disabled { filter: grayscale(.85) brightness(1.05); cursor: default; }
  .tools { display: flex; gap: 6px; margin-top: 14px; }
  .tool { all: unset; cursor: pointer; font-size: 10.5px; letter-spacing: .12em; color: var(--muted); padding: 3px 8px; border-radius: 5px; border: 1px solid var(--edge); }
  .tool:hover { color: var(--ink); background: rgb(0 0 0 / .04); }
  .slot { position: absolute; left: 22px; right: 22px; bottom: 9px; height: 7px; border-radius: 4px; background: #15130f;
          box-shadow: inset 0 2px 3px #000, 0 1px 0 rgb(255 255 255 / .45); }

  .feed { position: relative; z-index: 2; margin: -12px 34px 0; padding: 0 0 60px; clip-path: inset(0 -60px -120px -60px); }
  .paper-wrap { filter: drop-shadow(0 10px 14px rgb(60 40 20 / .18)) drop-shadow(0 1px 1px rgb(60 40 20 / .15)); }
  .paper { position: relative; background: var(--paper); color: #24211c; padding: 30px 22px 34px;
           background-image: linear-gradient(rgb(0 0 0 / .035), transparent 40px), repeating-linear-gradient(transparent 0 3px, rgb(0 0 0 / .008) 3px 4px);
           -webkit-mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%;
                   mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%; }
  .center { text-align: center; }
  .ph { font-weight: 600; letter-spacing: .3em; font-size: 13px; }
  .ph small { display: block; font-weight: 400; letter-spacing: .2em; font-size: 10.5px; color: #7d766a; margin-top: 2px; }
  .rule { border-top: 1.5px dashed #c9c1b1; margin: 14px 0; }
  dl { display: grid; grid-template-columns: 52px 1fr; gap: 3px 10px; font-size: 12px; }
  dt { color: #8a8375; } dd { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .to { all: unset; cursor: pointer; border-bottom: 1px dotted #b5ad9e; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; vertical-align: bottom; }
  .to:hover { color: var(--red); border-color: var(--red); }
  textarea { display: block; width: 100%; min-height: 96px; resize: none; border: 0; outline: 0; background: none; color: #1d1a16; caret-color: var(--red);
             font: 500 16px/1.55 "IBM Plex Mono", monospace; overflow: hidden; }
  textarea::placeholder { color: #b5ad9e; }
  .file { display: none; margin-top: 8px; padding: 8px 10px; border: 1.5px solid #d9d1c1; border-radius: 3px; font-size: 12.5px; gap: 8px; align-items: center; }
  .file.on { display: flex; } .file b { flex: 1; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .file button { all: unset; cursor: pointer; color: #8a8375; padding: 0 4px; } .file button:hover { color: var(--red); }
  .foot { display: flex; justify-content: space-between; font-size: 11.5px; color: #6f685c; letter-spacing: .06em; }
  .barcode { display: flex; height: 38px; margin: 12px auto 8px; width: max-content; }
  .barcode i { background: #24211c; height: 100%; }
  .thanks { font-size: 10.5px; letter-spacing: .22em; color: #8a8375; }
  .stamp { position: absolute; right: 18px; top: 92px; padding: 4px 12px; border: 3px solid var(--red); border-radius: 6px; color: var(--red);
           font: 600 20px/1.2 "IBM Plex Mono", monospace; letter-spacing: .12em; transform: rotate(-9deg); opacity: 0; pointer-events: none;
           mix-blend-mode: multiply; mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.2 1.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
  .stamp small { display: block; font-size: 8.5px; white-space: nowrap; letter-spacing: .1em; text-align: center; }
  .drag .paper { outline: 2px dashed var(--red); outline-offset: -10px; }
  .log { margin: 6px 34px 0; display: grid; gap: 6px; font-size: 11px; color: var(--muted); letter-spacing: .05em; }
  .log div { display: flex; justify-content: space-between; gap: 12px; border-bottom: 1px dotted var(--edge); padding-bottom: 5px; }
  .log span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  @media (max-width: 420px) { .lcd { width: 112px; font-size: 20px; } .feed, .log { margin-left: 16px; margin-right: 16px; } }
`;

export const html = `
<div class="desk">
  <div class="machine" id="machine">
    <div class="row">
      <div class="led on" id="led"></div>
      <div class="label"><b>BEAM</b><small>TX-01</small></div>
      <div class="lcd" id="lcd"><span id="lcdL">READY</span><span id="lcdR"></span></div>
      <button class="key" id="send" disabled>SEND</button>
    </div>
    <div class="tools"><button class="tool" id="attach">+ FILE</button><button class="tool" id="settings">SETUP</button><button class="tool" id="clear">CLEAR</button></div>
    <div class="slot"></div>
  </div>

  <div class="feed" id="feed">
    <div class="paper-wrap">
      <div class="paper" id="paper">
        <div class="ph center">✦ BEAM ✦<small>TRANSMISSION SLIP</small></div>
        <div class="rule"></div>
        <dl><dt>DATE</dt><dd id="date"></dd><dt>TO</dt><dd><button class="to" id="toLine" title="Change topic"></button></dd><dt>TYPE</dt><dd id="type">—</dd></dl>
        <div class="rule"></div>
        <textarea id="msg" placeholder="Type a note or paste a link…"></textarea>
        <div class="file" id="file"><span>📎</span><b id="fname"></b><span id="fsize"></span><button id="unfile" aria-label="Remove file">✕</button></div>
        <div class="rule"></div>
        <div class="foot"><span id="count">0 CH</span><span id="no">NO. 0001</span></div>
        <div class="barcode" id="barcode"></div>
        <div class="thanks center" id="thanks">PRESS ⌘↵ OR THE RED KEY</div>
        <div class="stamp" id="stamp">NOT SENT<small id="stampWhy"></small></div>
      </div>
    </div>
  </div>
  <div class="log" id="log"></div>
</div>
`;

const pad = (n) => String(n).padStart(4, '0');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function hash(s) { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.codePointAt(0), 16777619); return h >>> 0; }

export function mount({ signal, draft }) {
  const $ = (id) => document.getElementById(id);
  const msg = $('msg'), paper = $('paper'), sendBtn = $('send'), machine = $('machine');
  const sheet = paper.parentElement;
  let file = null, busy = false, no = +(Beam.store.get('slip', 1));
  const RM = Beam.reducedMotion;

  function barcode(seed) {
    let h = seed || 7, out = '';
    for (let i = 0; i < 46; i++) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; out += `<i style="width:${1 + (h % 3)}px;margin-right:${1 + ((h >> 4) % 3)}px"></i>`; }
    $('barcode').innerHTML = out;
  }
  const lcd = (l, r = '', err = false) => { $('lcdL').textContent = l; $('lcdR').textContent = r; $('lcd').classList.toggle('err', err); };
  const led = (state) => { $('led').className = 'led ' + state; };

  function render() {
    const d = Beam.detect(msg.value, file), t = msg.value.trim();
    $('type').textContent = d.kind === 'empty' ? '—' : d.kind === 'link' ? `LINK · ${d.host}` : d.kind === 'file' ? `FILE · ${d.size}` : 'NOTE';
    $('count').textContent = `${t.length} CH`;
    sendBtn.disabled = d.kind === 'empty';
    if (!busy) d.kind === 'empty' ? lcd('READY') : lcd(d.kind === 'link' ? 'LINK' : d.kind === 'file' ? 'FILE' : 'NOTE', d.kind === 'file' ? d.size.replace(' ', '') : `${t.length}CH`);
    barcode(hash(t + (file?.name || '')));
    msg.style.height = 'auto'; msg.style.height = msg.scrollHeight + 'px';
    if (t || file) $('stamp').style.opacity = 0;
  }
  function freshSlip() {
    const d = new Date();
    $('date').textContent = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() + '  ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    $('no').textContent = 'NO. ' + pad(no);
  }
  function setFile(f) {
    file = f || null;
    $('file').classList.toggle('on', !!file);
    if (file) { $('fname').textContent = file.name; $('fsize').textContent = Beam.fmtSize(file.size); }
    msg.placeholder = file ? 'Add a message (optional)…' : 'Type a note or paste a link…';
    render(); msg.focus();
  }

  /* ---------- paper feed ---------- */
  const feedIn = () => sheet.animate(
    [{ transform: 'translateY(0)' }, { transform: 'translate(-1px, -40%)' }, { transform: 'translate(1px, -75%)' }, { transform: 'translateY(calc(-100% - 20px))' }],
    { duration: RM ? 1 : 950, easing: 'steps(16, end)', fill: 'forwards' }).finished;
  const feedOut = (dur = 1200, steps = 22) => sheet.animate(
    [{ transform: 'translateY(calc(-100% - 20px))' }, { transform: 'translate(1px, -50%)' }, { transform: 'translateY(0)' }],
    { duration: RM ? 1 : dur, easing: `steps(${steps}, end)`, fill: 'forwards' }).finished;

  async function send() {
    const d = Beam.detect(msg.value, file);
    if (d.kind === 'empty' || busy) return;
    busy = true; sendBtn.disabled = true; sendBtn.classList.add('down'); setTimeout(() => sendBtn.classList.remove('down'), 140);
    $('stamp').style.opacity = 0;
    Beam.sfx('key'); Beam.sfx('feed', { steps: 16, dur: .95 }, 60);
    machine.classList.add('work'); led('blink');
    let dots = 0;
    const progress = setInterval(() => lcd('TX', '▮'.repeat(dots++ % 6).padEnd(5, '▯')), 110);
    signal.addEventListener('abort', () => clearInterval(progress));
    const req = Beam.send({ text: msg.value, file });
    const fedIn = feedIn();
    try {
      const [{ ms }] = await Promise.all([req, fedIn]);
      clearInterval(progress);
      if (signal.aborted) return;
      machine.classList.remove('work');
      led('on'); lcd('SENT ✓', `${ms}MS`);
      Beam.sfx('bell');
      navigator.vibrate?.(30);
      const row = document.createElement('div');
      row.innerHTML = `<span></span><span>NO.${pad(no)} · ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>`;
      row.firstChild.textContent = `${d.emoji} ${d.kind === 'link' ? d.host : d.kind === 'file' ? file.name : msg.value.trim().slice(0, 48)}`;
      $('log').prepend(row); row.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], 400);
      while ($('log').children.length > 5) $('log').lastChild.remove();
      no++; Beam.store.set('slip', no);
      msg.value = ''; setFile(null); freshSlip();
      await wait(250);
      if (signal.aborted) return;
      machine.classList.add('work');
      Beam.sfx('feed', { steps: 22, dur: 1.2 });
      await feedOut();
    } catch (e) {
      clearInterval(progress);
      if (signal.aborted) return;
      await fedIn.catch(() => {});
      led('err'); lcd('ERR', '', true);
      Beam.sfx('error'); Beam.sfx('feed', { steps: 8, dur: .42 });
      $('stampWhy').textContent = e.message.toUpperCase().slice(0, 26);
      await feedOut(420, 8);
      $('stamp').animate([{ opacity: 0, transform: 'rotate(-9deg) scale(2.4)' }, { opacity: .9, transform: 'rotate(-9deg) scale(.96)', offset: .7 }, { opacity: .85, transform: 'rotate(-9deg) scale(1)' }],
        { duration: RM ? 1 : 260, easing: 'cubic-bezier(.5, 0, .9, .5)', fill: 'forwards' });
      $('stamp').style.opacity = .85;
      Beam.sfx('stamp', null, 150);
      paper.animate({ transform: ['translateY(0)', 'translateY(3px)', 'translateY(0)'] }, { duration: 160, delay: 180 });
    } finally {
      busy = false;
      if (signal.aborted) return;
      machine.classList.remove('work'); render();
      if ($('lcd').classList.contains('err')) setTimeout(() => { if (!busy && !signal.aborted) { led('on'); render(); } }, 2600);
    }
  }

  sendBtn.onclick = send;
  msg.addEventListener('input', render);
  msg.addEventListener('keydown', (e) => { if (!e.metaKey && !e.ctrlKey && (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter')) Beam.sfx('type'); });
  $('attach').onclick = async () => { const f = await Beam.pickFile(); if (f) setFile(f); };
  $('unfile').onclick = () => setFile(null);
  $('clear').onclick = () => { msg.value = ''; setFile(null); };
  $('settings').onclick = $('toLine').onclick = Beam.openSettings;
  Beam.onConfig((c) => { $('toLine').textContent = `${Beam.serverHost()}/${c.topic}`; }, signal);
  if (!/Mac|iPhone|iPad/.test(navigator.platform)) $('thanks').textContent = 'PRESS CTRL↵ OR THE RED KEY';
  Beam.wire({ input: msg, onFile: setFile, onSend: send, onDrag: (v) => document.body.classList.toggle('drag', v), signal });

  freshSlip();
  msg.value = draft.text || '';
  setFile(draft.file);
  // Print the slip out of the machine as the design appears.
  sheet.style.transform = 'translateY(calc(-100% - 20px))';
  machine.classList.add('work');
  feedOut(1100, 20).then(() => { machine.classList.remove('work'); sheet.style.transform = ''; }, () => {});
  return () => ({ text: msg.value, file });
}
