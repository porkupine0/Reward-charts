// Settings page: edit chores, shower nights, lights out, reward lists and prize levels.
import { watch, save, statusPill, esc } from './store.js?v=1794490501';
import { SETTINGS, DEFAULTS, applySettings } from './settings.js?v=1794490501';
import { KIDS } from './routines.js?v=1794490501';
import { LEVELS } from './trials.js?v=1794490501';
import { askParent } from './parent.js?v=1794490501';

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
}
function renderKid() {
  const k = KIDS[kid];
  $('kidtabs').innerHTML = Object.entries(KIDS).map(([id, x]) => '<button role="tab" data-kid="' + id + '" aria-selected="' + (id === kid) + '" style="--accent:' + x.accent + '">' + esc(x.name) + '</button>').join('');
  $('kidpanel').style.setProperty('--accent', k.accent);
  $('kidpanel').innerHTML = '<h2>' + esc(k.name) + '</h2>' +
    '<label class="field"><span class="flabel">School-night lights out (Fri &amp; Sat are later automatically)</span><input type="time" id="lights" value="' + draft.lights[kid] + '"></label>' +
    '<fieldset class="sdays"><legend class="flabel">Shower nights</legend>' + DAYS.map((d, i) => '<label><input type="checkbox" id="sh' + i + '"' + (draft.showers[kid].includes(i) ? ' checked' : '') + '> ' + d.slice(0, 3) + '</label>').join('') + '</fieldset>' +
    '<div class="sgrid">' + DAYS.map((d, i) => '<label class="field"><span class="flabel">' + d + ' chores</span><textarea id="ch' + i + '" rows="2">' + esc((draft.chores[kid][i] || []).join('\n')) + '</textarea></label>').join('') + '</div>';
}
function renderAll() {
  ['eli', 'trombone'].forEach((id) => ['weekly', 'monthly'].forEach((w) => { $('r-' + id + '-' + w).value = draft.rewards[id][w].join('\n'); }));
  $('levels').innerHTML = LEVELS.map((l) => '<label class="field"><span class="flabel">' + l + '</span><textarea id="lv-' + l + '" rows="4">' + esc(draft.prizeLevels[l].join('\n')) + '</textarea></label>').join('');
  renderKid();
}
function readAll() {
  readKid();
  ['eli', 'trombone'].forEach((id) => ['weekly', 'monthly'].forEach((w) => { draft.rewards[id][w] = lines($('r-' + id + '-' + w).value); }));
  LEVELS.forEach((l) => { draft.prizeLevels[l] = lines($('lv-' + l).value); });
}

document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-kid]');
  if (t) { readKid(); kid = t.dataset.kid; renderKid(); }
});
document.addEventListener('input', () => { dirty = true; $('msg').textContent = 'Unsaved changes.'; });
$('save').onclick = async () => {
  readAll();
  if (!(await askParent())) return;
  // Firebase drops empty lists, so an empty chore day is saved as a blank line and cleaned up on load.
  const cfg = copy(draft);
  Object.values(cfg.chores).forEach((days) => days.forEach((d, i) => { if (!d.length) days[i] = ['']; }));
  Object.keys(cfg.showers).forEach((k) => { if (!cfg.showers[k].length) cfg.showers[k] = [-1]; });
  await save('config', 'chores', cfg.chores);
  await save('config', 'showers', cfg.showers);
  await save('config', 'lights', cfg.lights);
  await save('config', 'rewards', cfg.rewards);
  await save('config', 'prizeLevels', cfg.prizeLevels);
  dirty = false;
  $('msg').textContent = 'Saved. Every phone will use the new settings.';
};
$('reset').onclick = async () => {
  if (!confirm('Go back to the original chores, bedtimes and prize lists?')) return;
  if (!(await askParent())) return;
  ['chores', 'showers', 'lights', 'rewards', 'prizeLevels'].forEach((k) => save('config', k, null));
  draft = copy(DEFAULTS); dirty = false; renderAll();
  $('msg').textContent = 'Back to the original settings.';
};
window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

draft = copy(SETTINGS);
renderAll();
watch('config', (d) => { applySettings(d); if (!dirty) { draft = copy(SETTINGS); renderAll(); } }, statusPill($('sync')));
