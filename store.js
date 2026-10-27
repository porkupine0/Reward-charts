// Tiny sync layer: Firebase Realtime Database when configured, this-device storage otherwise.
import { firebaseConfig } from './config.js';

const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
let dbPromise = null;

function getDb() {
  if (!firebaseConfig) return null;
  if (!dbPromise) {
    dbPromise = (async () => {
      const app = await import(FB + 'firebase-app.js');
      const db = await import(FB + 'firebase-database.js');
      const inst = app.initializeApp(firebaseConfig);
      return { api: db, db: db.getDatabase(inst) };
    })();
  }
  return dbPromise;
}

// ---- local fallback ----
const listeners = {};
function localRead(id) {
  try { return JSON.parse(localStorage.getItem('rc:' + id) || '{}'); } catch (e) { return {}; }
}
function localWrite(id, data) {
  try { localStorage.setItem('rc:' + id, JSON.stringify(data)); } catch (e) {}
  (listeners[id] || []).forEach((fn) => fn(data));
}
function setIn(obj, parts, value) {
  const key = parts[0];
  if (parts.length === 1) {
    if (value === null || value === undefined || value === false) delete obj[key];
    else obj[key] = value;
    return obj;
  }
  if (typeof obj[key] !== 'object' || obj[key] === null) obj[key] = {};
  setIn(obj[key], parts.slice(1), value);
  if (Object.keys(obj[key]).length === 0) delete obj[key];
  return obj;
}

// Subscribe to a chart's whole data tree. onStatus gets 'live' | 'offline' | 'local'.
export async function watch(chartId, onData, onStatus) {
  const conn = await getDb();
  if (!conn) {
    onStatus && onStatus('local');
    (listeners[chartId] = listeners[chartId] || []).push(onData);
    onData(localRead(chartId));
    return;
  }
  const { api, db } = conn;
  api.onValue(api.ref(db, 'charts/' + chartId), (snap) => onData(snap.val() || {}));
  if (onStatus) api.onValue(api.ref(db, '.info/connected'), (s) => onStatus(s.val() ? 'live' : 'offline'));
}

// Write one value at a slash path inside a chart. false/null removes it.
export async function save(chartId, path, value) {
  const conn = await getDb();
  const v = value === false || value === undefined ? null : value;
  if (!conn) {
    localWrite(chartId, setIn(localRead(chartId), path.split('/'), v));
    return;
  }
  const { api, db } = conn;
  await api.set(api.ref(db, 'charts/' + chartId + '/' + path), v);
}

// ---- date helpers (local time) ----
export function ymd(d) {
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
export function parseYmd(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function mondayOf(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = (x.getDay() + 6) % 7; // Mon = 0
  x.setDate(x.getDate() - dow);
  return x;
}
export function addDays(d, n) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}
export function shortDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function statusPill(el) {
  return (st) => {
    el.dataset.state = st;
    el.textContent = st === 'live' ? 'Synced' : st === 'offline' ? 'Offline, will sync' : 'This device only';
  };
}
