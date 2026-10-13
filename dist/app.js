import { solution } from './physics.js';
const $ = id => document.getElementById(id);
const state = { a: 1, b: 5, t: 0, horizon: 20, playing: false };
const fmt = (n, digits = 2) => (Math.abs(n) < 0.5 * 10 ** -digits ? 0 : n).toLocaleString('de-CH', { minimumFractionDigits: digits, maximumFractionDigits: digits }).replace('.', ',');
const px = t => 51 + t / state.horizon * 729;
const py = x => 147 - x * 50;
const attr = (id, values) => Object.entries(values).forEach(([key, value]) => $(id).setAttribute(key, value));

function setPlaying(playing) {
  state.playing = playing;
  $('play-label').textContent = playing ? 'Pause' : state.t > 0 ? 'Fortsetzen' : 'Starten';
  $('play-icon').textContent = playing ? 'Ⅱ' : '▶';
  $('play').setAttribute('aria-pressed', String(playing));
}
function curvePath(end = state.horizon) {
  const times = [0, end, state.a, state.b].filter(t => t >= 0 && t <= end);
  const samples = Math.max(2, Math.min(24000, Math.ceil(end * 28)));
  for (let i = 1; i < samples; i++) times.push(end * i / samples);
  return times.sort((a, b) => a - b).map((t, i) => `${i ? 'L' : 'M'}${px(t).toFixed(2)},${py(solution(t, state.a, state.b).x).toFixed(2)}`).join(' ');
}
function drawPlot() {
  let grid = '';
  for (let x = -2; x <= 2; x++) {
    const y = py(x);
    grid += `<line x1="51" x2="780" y1="${y}" y2="${y}" stroke="${x === 0 ? '#bdc7c0' : '#edf0ec'}"/><text x="38" y="${y + 4}" text-anchor="end">${x}</text>`;
  }
  const rough = state.horizon / 8;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map(n => n * power).find(n => n >= rough);
  for (let t = 0; t <= state.horizon; t += step) {
    const x = px(t);
    grid += `<line x1="${x}" x2="${x}" y1="25" y2="269" stroke="#edf0ec"/><text x="${x}" y="291" text-anchor="middle">${t}</text>`;
  }
  $('grid').innerHTML = grid;
  attr('active-band', { x: px(state.a), width: Math.max(0, px(state.b) - px(state.a)) });
  $('switches').innerHTML = (state.a === state.b ? [['A = B', state.a]] : [['A', state.a], ['B', state.b]]).map(([label, t]) => `<line x1="${px(t)}" x2="${px(t)}" y1="25" y2="269" stroke="#c49b35" stroke-opacity=".65" stroke-dasharray="3 4"/><text x="${px(t)}" y="17" text-anchor="middle">${label}</text>`).join('');
  const path = curvePath();
  attr('curve', { d: path });
  attr('past-curve', { d: path });
  $('time').max = state.horizon;
  $('time-end').textContent = `${state.horizon} s`;
  let option = [...$('horizon').options].find(o => Number(o.value) === state.horizon);
  if (!option) { option = new Option(`${state.horizon} s`, state.horizon); $('horizon').add(option); }
  $('horizon').value = state.horizon;
  const amplitude = Math.abs(2 * Math.sin((state.b - state.a) / 2));
}
function render() {
  const { x, f } = solution(state.t, state.a, state.b);
  const position = 400 + 90 * x;
  attr('body', { transform: `translate(${position},0)` });
  const end = position - 40;
  let spring = 'M70 150 L90 150';
  for (let i = 0; i <= 24; i++) spring += ` L${90 + (end - 105) * i / 24} ${i === 0 || i === 24 ? 150 : 150 + (i % 2 ? -11 : 11)}`;
  attr('spring', { d: `${spring} L${end} 150` });
  attr('displacement', { d: `M400 210H${position}`, visibility: Math.abs(x) > .03 ? 'visible' : 'hidden' });
  $('flame').style.display = f ? '' : 'none';
  $('thrust').style.display = f ? '' : 'none';
  // The flame is a function of simulation time, so pausing freezes it too.
  attr('outer-flame', { d: `M-36 89Q-65 88 ${-85 - 8 * Math.sin(state.t * 35)} 101Q-64 114-36 112Z` });
  $('time').value = state.t;
  $('time').setAttribute('aria-valuetext', `${fmt(state.t)} Sekunden`);
  const phase = state.a === state.b ? 'Kein Schub' : state.t < state.a ? 'Vor dem Schub' : f ? 'Rakete aktiv' : 'Freie Schwingung';
  if ($('phase').textContent !== phase) $('phase').textContent = phase;
  $('phase').classList.toggle('active', !!f);
  attr('cursor', { x1: px(state.t), x2: px(state.t) });
  for (const id of ['plot-point', 'plot-halo']) attr(id, { cx: px(state.t), cy: py(x) });
  attr('past-rect', { width: Math.max(0, px(state.t) - 51) });
}
function setParameter(key, value) {
  if (!Number.isFinite(value)) return;
  state[key] = Math.round(Math.max(0, Math.min(30, value)) * 10) / 10;
  if (state.a > state.b) state[key === 'a' ? 'b' : 'a'] = state[key];
  for (const k of ['a', 'b']) {
    $(`${k}-number`).value = state[k];
    $(k).value = state[k];
  }
  if (state.b > state.horizon - 4) state.horizon = Math.ceil((state.b + 10) / 20) * 20;
  drawPlot(); render();
}
for (const key of ['a', 'b']) {
  $(key).addEventListener('input', event => setParameter(key, Number(event.target.value)));
  $(`${key}-number`).addEventListener('change', event => {
    if (event.target.value === '' || !Number.isFinite(event.target.valueAsNumber)) event.target.value = state[key];
    else setParameter(key, event.target.valueAsNumber);
  });
}
$('play').addEventListener('click', () => setPlaying(!state.playing));
$('reset').addEventListener('click', () => { state.t = 0; setPlaying(false); render(); });
$('time').addEventListener('input', event => { state.t = Number(event.target.value); setPlaying(false); render(); });
$('horizon').addEventListener('change', event => {
  state.horizon = Math.max(Number(event.target.value), Math.ceil((state.b + 4) / 20) * 20);
  state.t = Math.min(state.t, state.horizon);
  drawPlot(); render();
});
let dragging = false;
function seek(event) {
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform($('plot').getScreenCTM().inverse());
  state.t = Math.max(0, Math.min(state.horizon, (point.x - 51) / 729 * state.horizon));
  setPlaying(false); render();
}
$('plot').addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  dragging = true; $('plot').setPointerCapture(event.pointerId); seek(event);
});
$('plot').addEventListener('pointermove', event => { if (dragging) seek(event); });
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) $('plot').addEventListener(type, () => { dragging = false; });
let last = null;
function frame(now) {
  if (state.playing && last !== null && !document.hidden) {
    state.t += Math.min((now - last) / 1000, .1);
    if (state.t > state.horizon) { state.horizon += 20; drawPlot(); }
    render();
  }
  last = now;
  requestAnimationFrame(frame);
}
document.addEventListener('visibilitychange', () => { last = null; });
drawPlot(); render(); setPlaying(false); requestAnimationFrame(frame);
