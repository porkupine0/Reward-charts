// Home: one button per person, each with a one-line "right now".
import { watch, statusPill } from './store.js?v=1794490501';
import { KIDS, applyConfig, timerResult } from './routines.js?v=1794490501';
import * as L from './lists.js?v=1794490501';
import { nowLine } from './nowview.js?v=1794490501';
import { owedItems } from './owed.js?v=1794490501';
import { isParent, setParent } from './parent.js?v=1794490501';
import { addDays } from './store.js?v=1794490501';

const $ = (id) => document.getElementById(id);
const IDS = ['routines', 'eli-run', 'isaiah', 'eli', 'trombone', 'eli-trials', 'config'];
const D = Object.fromEntries(IDS.map((id) => [id, {}]));
const ctx = { get routines() { return D.routines; }, get run() { return D['eli-run']; }, get isaiah() { return D.isaiah; } };

function render() {
  const now = new Date();
  Object.keys(KIDS).forEach((id) => { $('n-' + id).textContent = nowLine(L.nowStatus(ctx, id, now)); });
  const owed = owedItems(D, ctx, () => 1, () => '').length;
  const yd = addDays(now, -1);
  const late = Object.keys(KIDS).filter((id) => { const c = L.dayChecks(ctx, id, yd), r = timerResult(id, yd, c.bedTimer, c); return r && r.status === 'late'; }).length;
  $('n-parents').textContent = (owed ? owed + ' to pay or give' : 'Nothing owed') + (late ? ' · ' + late + ' late last night' : '') + ' · where everyone is now';
  $('parentline').innerHTML = isParent()
    ? '<b>Parent phone.</b> Parent boxes are unlocked here. <button class="linkbtn" id="lockbtn">Lock this phone</button>'
    : 'Parent boxes (Reward given, Paid, Parent OK) ask for the parent PIN on this phone.';
  const lb = $('lockbtn'); if (lb) lb.onclick = () => { setParent(false); render(); };
}

render();
setInterval(render, 60000);
IDS.forEach((id, i) => watch(id, (d) => { D[id] = d; if (id === 'config') applyConfig(d); render(); }, i === 0 ? statusPill($('sync')) : null));
