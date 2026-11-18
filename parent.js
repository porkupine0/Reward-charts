// Parent-only boxes ("Reward given", "Paid", "Parent OK", Settings). After the PIN, a phone ticked
// "This is a parent's phone" stays unlocked; any other device (a kid's phone, the shared iPad)
// unlocks for 15 minutes. The PIN is stored as a hash, never as digits.
// A new PIN can only be created once the saved settings have loaded and there truly isn't one,
// so a slow connection can never replace the real PIN.
import { watch, save, isLive } from './store.js?v=1795040412';

let rec = {};
watch('settings', (d) => { rec = d || {}; });

export const UNLOCK_MIN = 15;
const KEY = 'rc:unlock'; // { always: true } or { until: <ms> }
// One-time switch (delete after Nov 2026): phones unlocked the old way ('rc:parent', forever) stay
// unlocked until Monday Nov 23, 2026, so nobody is locked out before they can check the PIN. From then
// that flag is removed and the phone asks once.
export const LEGACY_UNTIL = new Date(2026, 10, 23).getTime();
const LEGACY = 'rc:parent';
export function legacyUnlocked() {
  try {
    if (localStorage.getItem(LEGACY) !== '1') return false;
    if (Date.now() < LEGACY_UNTIL) return true;
    localStorage.removeItem(LEGACY);
  } catch (e) {}
  return false;
}
function unlock() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
export function isParent() {
  const u = unlock();
  return (!!u && (u.always === true || (typeof u.until === 'number' && Date.now() < u.until))) || legacyUnlocked();
}
// Unlocked for good on a parent's phone; otherwise for UNLOCK_MIN minutes.
export function isParentPhone() { const u = unlock(); return !!u && u.always === true; }
export function setParent(on, always) {
  try {
    if (on) localStorage.setItem(KEY, JSON.stringify(always ? { always: true } : { until: Date.now() + UNLOCK_MIN * 60000 }));
    else { localStorage.removeItem(KEY); localStorage.removeItem(LEGACY); }
  } catch (e) {}
}

async function hash(pin) {
  const bytes = new TextEncoder().encode('reward-charts:' + pin);
  if (!(crypto && crypto.subtle)) return 'plain:' + pin;
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// In-page PIN box (masked). Resolves to the typed PIN, or null if cancelled.
function pinDialog(title, hint, keepBox) {
  return new Promise((resolve) => {
    const d = document.createElement('dialog');
    d.className = 'pindlg';
    d.innerHTML = '<form><h2></h2><p class="note"></p>' +
      '<label class="field"><span class="flabel">Parent PIN</span><input type="password" inputmode="numeric" autocomplete="off" maxlength="12" id="pinbox"></label>' +
      (keepBox ? '<label class="pinkeep"><input type="checkbox" id="pinkeep"> This is a parent’s phone (stay unlocked)</label><p class="note pinkeep-note">Leave it off on the kids’ phones and the shared iPad: they unlock for ' + UNLOCK_MIN + ' minutes.</p>' : '') +
      '<p class="pinerr" role="alert"></p><div class="pinrow"><button type="button" class="linkbtn" data-pin="cancel">Cancel</button><button type="submit" class="tt-save" data-pin="ok">OK</button></div></form>';
    d.querySelector('h2').textContent = title;
    d.querySelector('.note').textContent = hint;
    document.body.appendChild(d);
    const input = d.querySelector('input'), err = d.querySelector('.pinerr');
    const done = (v) => { if (d.open) d.close(); d.remove(); resolve(v); };
    d.querySelector('[data-pin="cancel"]').onclick = () => done(null);
    d.addEventListener('cancel', (e) => { e.preventDefault(); done(null); });
    d.querySelector('form').onsubmit = (e) => {
      e.preventDefault();
      const v = input.value.trim();
      if (!/^\d{4,12}$/.test(v)) { err.textContent = 'Use 4 or more digits.'; return; }
      done(keepBox ? { pin: v, keep: !!d.querySelector('#pinkeep').checked } : v);
    };
    d.showModal();
    input.focus();
  });
}
function notice(msg) {
  const d = document.createElement('dialog');
  d.className = 'pindlg';
  d.innerHTML = '<form method="dialog"><p></p><div class="pinrow"><button class="tt-save">OK</button></div></form>';
  d.querySelector('p').textContent = msg;
  document.body.appendChild(d);
  d.addEventListener('close', () => d.remove());
  d.showModal();
}

// Resolves true when this phone may use parent boxes, asking for the PIN once if needed.
export async function askParent() {
  if (isParent()) return true;
  if (!isLive('settings')) { notice('Still connecting. Parent boxes unlock once this phone is online.'); return false; }
  const stored = rec.pinHash || (rec.pin ? 'legacy' : null);
  if (!stored) {
    const r = await pinDialog('Set a parent PIN', 'No parent PIN yet. Pick one the kids won’t guess.', true);
    if (r === null) return false;
    await save('settings', 'pinHash', await hash(r.pin));
    setParent(true, r.keep);
    return true;
  }
  for (let tries = 0; tries < 3; tries++) {
    const r = await pinDialog('Parents only', tries ? 'That PIN didn’t match. Try again.' : 'Enter the parent PIN to unlock parent boxes.', true);
    if (r === null) return false;
    const p = r.pin;
    const ok = stored === 'legacy' ? p === String(rec.pin) : (await hash(p)) === rec.pinHash;
    if (ok) {
      // Older PINs were saved as plain digits: replace with a hash.
      if (stored === 'legacy') { await save('settings', 'pinHash', await hash(p)); save('settings', 'pin', null); }
      setParent(true, r.keep);
      return true;
    }
  }
  return false;
}

// Parents can change the PIN from the Parents page.
export async function changePin() {
  if (!(await askParent())) return false;
  const p = await pinDialog('New parent PIN', 'Phones that are already unlocked stay unlocked. Any other phone will ask for the new PIN.');
  if (p === null) return false;
  await save('settings', 'pinHash', await hash(p));
  save('settings', 'pin', null);
  return true;
}
