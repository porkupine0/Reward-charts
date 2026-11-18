// Settings page: edit chores, shower nights, lights out, reward lists and prize levels.
import { watch, save, statusPill, esc, isLive } from './store.js?v=1795004044';
import { SETTINGS, DEFAULTS, LIMITS, applySettings, snapshotToSave } from './settings.js?v=1795004044';
import { KIDS } from './routines.js?v=1795004044';
import { LEVELS } from './trials.js?v=1795004044';
import { askParent } from './parent.js?v=1795004044';

const $ = (id) => document.getElementById(id);
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
let kid = 'eli', dirty = false, draft = null;
const lines = (v) => v.split('\n').map((s) => s.trim()).filter(Boolean);
const copy = (x) => JSON.parse(JSON.stringify(x));

// The draft holds edits until Save; switching kid tabs keeps them.
function readKid() {
  if (!draft) return;
  draft.lights[kid] = $('lights').value || draft.lights[kid];
  draft.showers[kid] = [0, 1, 2, 3, 4, 5, 6].filter((d) => $('sh' + d).checked);
  draft.chores[kid] = [0, 1, 2, 3, 4, 5, 6].map((d) => lines($('ch' + d).value));
  Object.keys(draft.checks[kid]).forEach((key) => {
    const label = $('ck-' + key + '-label').value.trim(), sub = $('ck-' + key + '-sub').value.trim();
    if (label) draft.checks[kid][key] = { label: label.slice(0, 60), sub: sub.slice(0, 100) };
  });
}
function renderKid() {
  const k = KIDS[kid];
  $('kidtabs').innerHTML = Object.entries(KIDS).map(([id, x]) => '<button role="tab" data-kid="' + id + '" aria-selected="' + (id === kid) + '" style="--accent:' + x.accent + '">' + esc(x.name) + '</button>').join('');
  $('kidpanel').style.setProperty('--accent', k.accent);
  $('kidpanel').innerHTML = '<h2>' + esc(k.name) + '</h2>' +
    '<label class="field"><span class="flabel">School-night lights out (Fri &amp; Sat are later automatically)</span><input type="time" id="lights" value="' + draft.lights[kid] + '"></label>' +
    '<fieldset class="sdays"><legend class="flabel">Shower nights</legend>' + DAYS.map((d, i) => '<label><input type="checkbox" id="sh' + i + '"' + (draft.showers[kid].includes(i) ? ' checked' : '') + '> ' + d.slice(0, 3) + '</label>').join('') + '</fieldset>' +
    '<div class="sgrid">' + DAYS.map((d, i) => '<label class="field"><span class="flabel">' + d + ' chores</span><textarea id="ch' + i + '" rows="2">' + esc((draft.chores[kid][i] || []).join('\n')) + '</textarea></label>').join('') + '</div>' +
    '<fieldset class="schecks"><legend class="flabel">Evening checks (Mom or Dad) · the wording shows on the checklist, Tonight and the chart</legend>' +
    Object.entries(draft.checks[kid]).map(([key, w]) => '<div class="scheck"><label class="field"><span class="flabel">Check</span><input id="ck-' + key + '-label" maxlength="60" value="' + esc(w.label) + '"></label>' +
      '<label class="field"><span class="flabel">Detail (optional)</span><input id="ck-' + key + '-sub" maxlength="100" value="' + esc(w.sub) + '"></label></div>').join('') + '</fieldset>';
}
function renderAll() {
  $('gameMin').value = draft.game; $('grace').value = draft.grace;
  ['eli', 'trombone'].forEach((id) => ['weekly', 'monthly'].forEach((w) => { $('r-' + id + '-' + w).value = draft.rewards[id][w].join('\n'); }));
  $('levels').innerHTML = LEVELS.map((l) => '<label class="field"><span class="flabel">' + l + '</span><textarea id="lv-' + l + '" rows="4">' + esc(draft.prizeLevels[l].join('\n')) + '</textarea></label>').join('');
  renderKid();
}
const bounded = (v, [lo, hi], d) => { const n = Number(v); return v !== '' && Number.isInteger(n) && n >= lo && n <= hi ? n : d; };
function readAll() {
  readKid();
  draft.game = bounded($('gameMin').value, LIMITS.game, draft.game);
  draft.grace = bounded($('grace').value, LIMITS.grace, draft.grace);
  ['eli', 'trombone'].forEach((id) => ['weekly', 'monthly'].forEach((w) => { draft.rewards[id][w] = lines($('r-' + id + '-' + w).value); }));
  LEVELS.forEach((l) => { draft.prizeLevels[l] = lines($('lv-' + l).value); });
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-kid]');
  if (t) { readKid(); kid = t.dataset.kid; renderKid(); }
});
document.addEventListener('input', () => { dirty = true; $('msg').textContent = 'Unsaved changes.'; });
const notLive = () => { $('msg').textContent = 'Still connecting. Save once this phone has the latest settings, so earlier days keep the right ones.'; };
$('save').onclick = async () => {
  if (!isLive('config')) return notLive();
  // numbers out of range: say so instead of quietly keeping the old value
  const bad = [['gameMin', LIMITS.game, 'Game time per school day'], ['grace', LIMITS.grace, 'Grace after lights out']]
    .filter(([id, lim]) => bounded($(id).value, lim, null) === null).map(([, [lo, hi], name]) => name + ' must be a whole number from ' + lo + ' to ' + hi + ' minutes.');
  if (bad.length) { $('msg').textContent = bad.join(' ') + ' Nothing was saved.'; return; }
  readAll();
  if (!(await askParent())) return;
  // Firebase drops empty lists, so an empty chore day is saved as a blank line and cleaned up on load.
  const cfg = copy(draft);
  Object.values(cfg.chores).forEach((days) => days.forEach((d, i) => { if (!d.length) days[i] = ['']; }));
  Object.keys(cfg.showers).forEach((k) => { if (!cfg.showers[k].length) cfg.showers[k] = [-1]; });
  await keepPastDays();
  await save('config', 'chores', cfg.chores);
  await save('config', 'showers', cfg.showers);
  await save('config', 'lights', cfg.lights);
  await save('config', 'game', cfg.game);
  await save('config', 'grace', cfg.grace);
  await save('config', 'checks', cfg.checks);
  await save('config', 'rewards', cfg.rewards);
  await save('config', 'prizeLevels', cfg.prizeLevels);
  dirty = false;
  $('msg').textContent = 'Saved. Every phone uses the new settings from today; earlier days keep what they had.';
};
$('reset').onclick = async () => {
  if (!isLive('config')) return notLive();
  if (!confirm('Go back to the original chores, bedtimes and prize lists?')) return;
  if (!(await askParent())) return;
  await keepPastDays();
  ['chores', 'showers', 'lights', 'game', 'grace', 'checks', 'rewards', 'prizeLevels'].forEach((k) => save('config', k, null));
  draft = copy(DEFAULTS); dirty = false; renderAll();
  $('msg').textContent = 'Back to the original settings.';
};
// Changes apply from today: first, record what earlier days used (once per day).
let cfgRaw = {};
async function keepPastDays() {
  const snap = snapshotToSave(cfgRaw, new Date());
  if (snap) await save('config', 'history/' + snap.key, snap.value);
}
window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

draft = copy(SETTINGS);
renderAll();
watch('config', (d) => { cfgRaw = d || {}; applySettings(d); if (!dirty) { draft = copy(SETTINGS); renderAll(); } }, statusPill($('sync')));
