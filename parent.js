// Parent-only boxes ("Reward given", "Paid", "Parent OK"). The first parent to use one sets a PIN;
// each parent's phone remembers it after one correct entry, so kids' phones stay locked.
import { watch, save } from './store.js?v=1794425755';

let pin = null;
watch('settings', (d) => { pin = d.pin || null; });

export function isParent() {
  try { return localStorage.getItem('rc:parent') === '1'; } catch (e) { return false; }
}
export function setParent(on) {
  try { on ? localStorage.setItem('rc:parent', '1') : localStorage.removeItem('rc:parent'); } catch (e) {}
}

// Returns true when this phone may use parent boxes, asking for the PIN once if needed.
export function askParent() {
  if (isParent()) return true;
  if (!pin) {
    const p = prompt('Parents only. Set a PIN (4 or more digits) to unlock this phone for parent boxes:');
    if (p === null) return false;
    if (!/^\d{4,}$/.test(p.trim())) { alert('Use 4 or more digits.'); return false; }
    save('settings', 'pin', p.trim());
    pin = p.trim();
    setParent(true);
    return true;
  }
  const p = prompt('Parents only. Enter the parent PIN:');
  if (p === null) return false;
  if (p.trim() === pin) { setParent(true); return true; }
  alert('That PIN didn’t match.');
  return false;
}
