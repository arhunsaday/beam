import { Beam } from '../core.js';

export const theme = '#f5f5f3';

export const css = `
  :root {
    --bg: #f5f5f3; --card: #ffffff; --ink: #121212; --soft: #5c5c58; --muted: #9a9a95;
    --line: #e8e8e4; --hover: #f0f0ed; --accent: #4f6bff; --ok: #17a34a; --err: #dc3b3b;
    --beam-bg: var(--card); --beam-ink: var(--ink); --beam-muted: var(--muted); --beam-line: var(--line); --beam-accent: var(--accent);
    --beam-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", system-ui, sans-serif; --beam-radius: 16px;
    color-scheme: light;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #0c0c0d; --card: #151517; --ink: #ececea; --soft: #a3a3a0; --muted: #6b6b6e;
      --line: #252528; --hover: #1d1d20; --accent: #8096ff; --ok: #3ccf74; --err: #ff6b6b;
      color-scheme: dark;
    }
  }
  * { box-sizing: border-box; margin: 0; }
  html, body { min-height: 100%; }
  body {
    background: var(--bg); color: var(--ink);
    font: 15px/1.5 -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", system-ui, sans-serif;
    -webkit-font-smoothing: antialiased; min-height: 100vh;
    display: grid; place-items: center; padding: 32px 16px;
  }
  main { width: 100%; max-width: 540px; }
  .mono { font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace; }

  header { display: flex; align-items: center; justify-content: space-between; padding: 0 6px 14px; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 600; letter-spacing: -.01em; }
  .dot { width: 9px; height: 9px; border-radius: 50%; background: var(--accent);
         box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent); }
  .topic-btn { display: flex; align-items: center; gap: 6px; border: 0; background: none; color: var(--muted);
               font-size: 12.5px; padding: 5px 9px; border-radius: 8px; cursor: pointer; max-width: 70%; }
  .topic-btn span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .topic-btn:hover { background: var(--hover); color: var(--ink); }

  .card { background: var(--card); border: 1px solid var(--line); border-radius: 20px; padding: 4px;
          box-shadow: 0 1px 2px rgb(0 0 0 / .03), 0 12px 40px -12px rgb(0 0 0 / .08);
          transition: border-color .15s, box-shadow .15s; }
  .card.drag { border-color: var(--accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 14%, transparent); }

  textarea { display: block; width: 100%; min-height: 168px; resize: none; border: 0; outline: 0;
             background: transparent; color: inherit; font: inherit; font-size: 17px; line-height: 1.5;
             padding: 18px 18px 6px; }
  textarea::placeholder { color: var(--muted); }

  .file { display: none; align-items: center; gap: 12px; margin: 4px 12px 0; padding: 10px 12px;
          border: 1px solid var(--line); border-radius: 12px; }
  .file.on { display: flex; }
  .file .ico { width: 34px; height: 34px; border-radius: 9px; background: var(--hover); display: grid; place-items: center;
               overflow: hidden; flex: none; color: var(--soft); }
  .file .ico img { width: 100%; height: 100%; object-fit: cover; }
  .file .meta { min-width: 0; flex: 1; }
  .file .name { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .file .size { font-size: 12px; color: var(--muted); }

  .bar { display: flex; align-items: center; gap: 4px; padding: 8px 8px 8px 10px; }
  .chip { flex: 1; min-width: 0; display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: var(--muted);
          white-space: nowrap; overflow: hidden; padding-left: 4px; }
  .chip b { font-weight: 500; color: var(--soft); }
  .chip span { overflow: hidden; text-overflow: ellipsis; }
  .icon { width: 36px; height: 36px; border: 0; border-radius: 10px; background: none; color: var(--muted);
          display: grid; place-items: center; cursor: pointer; flex: none; }
  .icon:hover { background: var(--hover); color: var(--ink); }
  .send { display: flex; align-items: center; gap: 10px; border: 0; border-radius: 13px; cursor: pointer;
          background: var(--ink); color: var(--card); font: inherit; font-weight: 560; padding: 9px 12px 9px 16px;
          transition: opacity .15s, transform .1s; }
  .send:active { transform: scale(.97); }
  .send:disabled { opacity: .28; cursor: default; transform: none; }
  .send kbd { font: 11px ui-monospace, Menlo, monospace; opacity: .5; padding: 1px 5px; border-radius: 5px;
              border: 1px solid color-mix(in srgb, var(--card) 35%, transparent); }
  @media (pointer: coarse) { .send kbd { display: none; } }
  .send.busy { opacity: .6; pointer-events: none; }

  .hint { text-align: center; color: var(--muted); font-size: 12.5px; margin-top: 16px; }

  .toast { position: fixed; left: 50%; bottom: 28px; transform: translate(-50%, 16px); opacity: 0;
           display: flex; align-items: center; gap: 8px; background: var(--ink); color: var(--card);
           font-size: 14px; padding: 9px 14px; border-radius: 999px; pointer-events: none;
           transition: opacity .2s, transform .25s cubic-bezier(.2,.9,.3,1.2); }
  .toast.on { opacity: 1; transform: translate(-50%, 0); }
  .toast i { width: 7px; height: 7px; border-radius: 50%; background: var(--ok); }
  .toast.err i { background: var(--err); }
`;

export const html = `
<main>
  <header>
    <div class="brand"><div class="dot"></div>Beam</div>
    <button class="topic-btn mono" id="topicBtn" title="Settings">
      <span id="topicLabel"></span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>
    </button>
  </header>

  <div class="card" id="card">
    <textarea id="msg" placeholder="Paste a link, type a note, or drop a file…"></textarea>
    <div class="file" id="file">
      <div class="ico" id="fileIco"></div>
      <div class="meta"><div class="name" id="fileName"></div><div class="size" id="fileSize"></div></div>
      <button class="icon" id="fileClear" title="Remove file">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="bar">
      <div class="chip" id="chip"></div>
      <button class="icon" id="attach" title="Attach file">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m21.4 11.1-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8l8.5-8.5a3.7 3.7 0 0 1 5.2 5.2l-8.5 8.5a1.8 1.8 0 0 1-2.6-2.6l7.8-7.8"/></svg>
      </button>
      <button class="send" id="send" disabled>Send <kbd id="kbd">⌘↵</kbd></button>
    </div>
  </div>

  <p class="hint">Links open on tap · Files up to 15 MB · Paste images directly</p>
</main>
<div class="toast" id="toast"><i></i><span id="toastText"></span></div>
`;

const ICONS = {
  link: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>',
  text: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  file: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>',
};
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function mount({ signal, draft }) {
  const $ = (id) => document.getElementById(id);
  const msg = $('msg'), sendBtn = $('send'), card = $('card');
  let file = null, busy = false, toastTimer;

  function render() {
    const d = Beam.detect(msg.value, file), t = msg.value.trim();
    let html = '';
    if (d.kind === 'link') html = `${ICONS.link}<b>Link</b><span>${esc(d.host)}</span>`;
    if (d.kind === 'text') html = `${ICONS.text}<b>Note</b><span>${t.length} chars</span>`;
    if (d.kind === 'file') html = `${ICONS.file}<b>File</b><span>${t ? 'with message' : 'tap to download'}</span>`;
    $('chip').innerHTML = html;
    sendBtn.disabled = d.kind === 'empty';
    msg.placeholder = file ? 'Add a message (optional)…' : 'Paste a link, type a note, or drop a file…';
  }
  function setFile(f) {
    file = f || null;
    $('file').classList.toggle('on', !!file);
    if (file) {
      $('fileName').textContent = file.name; $('fileSize').textContent = Beam.fmtSize(file.size);
      $('fileIco').innerHTML = file.type.startsWith('image/')
        ? `<img src="${URL.createObjectURL(file)}" alt="">` : ICONS.file.replace('width="14" height="14"', 'width="18" height="18"');
    }
    render(); msg.focus();
  }
  function toast(text, err = false) {
    $('toastText').textContent = text; $('toast').classList.toggle('err', err); $('toast').classList.add('on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast')?.classList.remove('on'), 2400);
  }
  async function send() {
    const d = Beam.detect(msg.value, file);
    if (d.kind === 'empty' || busy) return;
    busy = true; sendBtn.classList.add('busy'); sendBtn.firstChild.textContent = 'Sending ';
    Beam.sfx('send');
    try {
      await Beam.send({ text: msg.value, file });
      Beam.sfx('deliver');
      msg.value = ''; setFile(null);
      toast(d.kind === 'link' ? 'Link sent' : d.kind === 'file' ? 'File sent' : 'Note sent');
    } catch (e) {
      Beam.sfx('error');
      toast(e.message, true);
    } finally {
      busy = false; sendBtn.classList.remove('busy'); sendBtn.firstChild.textContent = 'Send '; render();
    }
  }

  msg.addEventListener('input', render);
  sendBtn.onclick = send;
  $('attach').onclick = async () => { const f = await Beam.pickFile(); if (f) setFile(f); };
  $('fileClear').onclick = () => setFile(null);
  $('topicBtn').onclick = Beam.openSettings;
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) { msg.value = ''; setFile(null); } }, { signal });
  Beam.onConfig((c) => { $('topicLabel').textContent = `${Beam.serverHost()}/${c.topic}`; }, signal);
  Beam.wire({ input: msg, onFile: setFile, onSend: send, onDrag: (on) => card.classList.toggle('drag', on), signal });
  if (!/Mac|iPhone|iPad/.test(navigator.platform)) $('kbd').textContent = 'Ctrl ↵';

  msg.value = draft.text || '';
  setFile(draft.file);
  return () => ({ text: msg.value, file });
}
