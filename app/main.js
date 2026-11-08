/* Shell: mounts the chosen design into #app, swaps designs in place and remembers the choice. */
import { Beam } from './core.js';

const ICON = (d) => `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const DESIGNS = {
  classic: { name: 'Classic', load: () => import('./designs/classic.js'), icon: '<rect x="4" y="6" width="16" height="12" rx="3"/><path d="M8 10h8"/>' },
  lockscreen: { name: 'Lockscreen', load: () => import('./designs/lockscreen.js'), icon: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 6h2"/>' },
  signal: { name: 'Signal', load: () => import('./designs/signal.js'), icon: '<circle cx="12" cy="12" r="2.2"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4"/>' },
  teleprinter: { name: 'Teleprinter', load: () => import('./designs/teleprinter.js'), icon: '<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/><path d="M9 8h6M9 12h4"/>' },
};
const SPEAKER = '<path d="M11 5 6 9H3v6h3l5 4z"/>';
const SOUND_ON = ICON(SPEAKER + '<path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>');
const SOUND_OFF = ICON(SPEAKER + '<path d="m16 9 5 6M21 9l-5 6"/>');
const CLOCK = ICON('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>');

const app = document.getElementById('app');
const designCss = document.getElementById('design-css');
const themeMeta = document.querySelector('meta[name="theme-color"]');

let current = null, controller = null, getDraft = null, switching = false;

// A ?text= or ?url= (e.g. from a bookmarklet or share link) pre-fills the first design, then leaves the address bar clean.
const params = new URLSearchParams(location.search);
let pending = { text: params.get('text') || params.get('url') || '', file: null };
if (location.search) history.replaceState(null, '', location.pathname + location.hash);

async function show(id, { animate = true } = {}) {
  if (!DESIGNS[id]) id = 'classic';
  if (id === current || switching) return;
  switching = true;
  try {
    const mod = await DESIGNS[id].load();
    const draft = getDraft ? getDraft() : pending;
    const swap = () => {
      controller?.abort();
      controller = new AbortController();
      document.body.className = '';
      document.documentElement.style.background = '';
      designCss.textContent = mod.css;
      app.innerHTML = mod.html;
      document.documentElement.dataset.design = id;
      themeMeta.content = mod.theme;
      document.title = id === 'classic' ? 'Beam' : `Beam · ${DESIGNS[id].name}`;
      getDraft = mod.mount({ signal: controller.signal, draft });
      current = id;
      Beam.store.set('design', id);
      paintDock();
    };
    if (animate && document.startViewTransition && !Beam.reducedMotion) await document.startViewTransition(swap).updateCallbackDone;
    else swap();
  } finally { switching = false; }
}

/* ---------- dock: design switcher + sound toggle, bottom-right, quiet until hovered ---------- */
const dock = document.createElement('nav');
dock.className = 'beam-dock';
dock.setAttribute('aria-label', 'Design and sound');
dock.innerHTML = Object.entries(DESIGNS).map(([id, d]) =>
  `<button type="button" data-id="${id}" data-tip="${d.name}" aria-label="${d.name} design">${ICON(d.icon)}</button>`).join('')
  + `<i></i><button type="button" class="beam-history" data-tip="History" aria-label="Sent history">${CLOCK}</button><button type="button" class="beam-sound"></button>`;
document.body.append(dock);
const soundBtn = dock.querySelector('.beam-sound');

function paintDock() {
  for (const b of dock.querySelectorAll('[data-id]')) b.setAttribute('aria-pressed', b.dataset.id === current);
  const on = Beam.soundOn();
  soundBtn.innerHTML = on ? SOUND_ON : SOUND_OFF;
  soundBtn.dataset.tip = on ? 'Sound on' : 'Sound off';
  soundBtn.setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
  soundBtn.classList.toggle('off', !on);
}
dock.addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b === soundBtn) { Beam.setSound(!Beam.soundOn()); paintDock(); Beam.sfx('tap'); return; }
  if (b.classList.contains('beam-history')) { Beam.sfx('tap'); Beam.openHistory(); return; }
  if (b.dataset.id !== current) { Beam.sfx('swap'); show(b.dataset.id); }
});

/* ---------- boot ---------- */
show(Beam.store.get('design', 'classic'), { animate: false }).then(() => {
  document.documentElement.classList.add('ready');
  if (Beam.firstRun) setTimeout(Beam.openSettings, 700);
});
