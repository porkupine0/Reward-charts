// Parent-only boxes ("Reward given", "Paid", "Parent OK", Settings). Each parent enters the PIN
// once per phone and that phone remembers it. The PIN is stored as a hash, never as digits.
// A new PIN can only be created once the saved settings have loaded and there truly isn't one,
// so a slow connection can never replace the real PIN.
import { watch, save, isLive } from './store.js?v=1794428564';

let rec = {};
watch('settings', (d) => { rec = d || {}; });

export function isParent() {
  try { return localStorage.getItem('rc:parent') === '1'; } catch (e) { return false; }
}
export function setParent(on) {
  try { on ? localStorage.setItem('rc:parent', '1') : localStorage.removeItem('rc:parent'); } catch (e) {}
}

async function hash(pin) {
  const bytes = new TextEncoder().encode('reward-charts:' + pin);
  if (!(crypto && crypto.subtle)) return 'plain:' + pin;
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// In-page PIN box (masked). Resolves to the typed PIN, or null if cancelled.
function pinDialog(title, hint) {
  return new Promise((resolve) => {
    const d = document.createElement('dialog');
    d.className = 'pindlg';
    d.innerHTML = '<form><h2></h2><p class="note"></p>' +
      '<label class="field"><span class="flabel">Parent PIN</span><input type="password" inputmode="numeric" autocomplete="off" maxlength="12" id="pinbox"></label>' +
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
      done(v);
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
    const p = await pinDialog('Set a parent PIN', 'No parent PIN yet. Pick one the kids won’t guess. Each parent enters it once per phone.');
    if (p === null) return false;
    await save('settings', 'pinHash', await hash(p));
    setParent(true);
    return true;
  }
  for (let tries = 0; tries < 3; tries++) {
    const p = await pinDialog('Parents only', tries ? 'That PIN didn’t match. Try again.' : 'Enter the parent PIN to unlock parent boxes on this phone.');
    if (p === null) return false;
    const ok = stored === 'legacy' ? p === String(rec.pin) : (await hash(p)) === rec.pinHash;
    if (ok) {
      // Older PINs were saved as plain digits: replace with a hash.
      if (stored === 'legacy') { await save('settings', 'pinHash', await hash(p)); save('settings', 'pin', null); }
      setParent(true);
      return true;
    }
  }
  return false;
}

// Parents can change the PIN from the Parents page.
export async function changePin() {
  if (!(await askParent())) return false;
  const p = await pinDialog('New parent PIN', 'Every parent will need to enter the new PIN once on their phone.');
  if (p === null) return false;
  await save('settings', 'pinHash', await hash(p));
  save('settings', 'pin', null);
  return true;
}
