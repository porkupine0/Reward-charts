// Home: one button per person, each with a one-line "right now".
import { watch, statusPill } from './store.js?v=1795058046';
import { KIDS, applyConfig, timerResult } from './routines.js?v=1795058046';
import * as L from './lists.js?v=1795058046';
import { nowLine } from './nowview.js?v=1795058046';
import { owedItems } from './owed.js?v=1795058046';
import { isParent, isParentPhone, legacyUnlocked, setParent } from './parent.js?v=1795058046';
import { addDays } from './store.js?v=1795058046';

const $ = (id) => document.getElementById(id);
const IDS = ['routines', 'eli-run', 'eli-drive', 'isaiah', 'eli', 'trombone', 'zay', 'eli-trials', 'config'];
const D = Object.fromEntries(IDS.map((id) => [id, {}]));
const ctx = { get routines() { return D.routines; }, get run() { return D['eli-run']; }, get isaiah() { return D.isaiah; }, get drive() { return D['eli-drive']; } };

function render() {
  const now = new Date();
  Object.keys(KIDS).forEach((id) => { $('n-' + id).textContent = nowLine(L.nowStatus(ctx, id, now)); });
  const owed = owedItems(D, ctx, () => 1, () => '').length;
  const yd = addDays(now, -1);
  const late = Object.keys(KIDS).filter((id) => { const c = L.dayChecks(ctx, id, yd), r = timerResult(id, yd, c.bedTimer, c); return r && r.status === 'late'; }).length;
  $('n-parents').textContent = (owed ? owed + ' to pay or give' : 'Nothing owed') + (late ? ' · ' + late + ' late last night' : '') + ' · where everyone is now';
  $('parentline').innerHTML = isParent()
    ? (isParentPhone() ? '<b>Parent phone.</b> Parent boxes are unlocked here.'
      : legacyUnlocked() ? '<b>Unlocked here until Monday, Nov 23.</b> Then it asks for the parent PIN once (tick “This is a parent’s phone” on your own phone). Forgotten the PIN? Change it on the Parents page before then.'
      : '<b>Unlocked for a few minutes.</b> Parent boxes lock again by themselves.') + ' <button class="linkbtn" id="lockbtn">Lock this phone</button>'
    : 'Parent boxes (Reward given, Paid, Parent OK) ask for the parent PIN on this phone.';
  const lb = $('lockbtn'); if (lb) lb.onclick = () => { setParent(false); render(); };
}

render();
setInterval(render, 60000);
IDS.forEach((id, i) => watch(id, (d) => { D[id] = d; if (id === 'config') applyConfig(d); render(); }, i === 0 ? statusPill($('sync')) : null));
