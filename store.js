// Sync layer: Firebase Realtime Database, with a copy of every chart kept on this phone.
// - Pages open instantly from the phone's copy, even with no signal.
// - Every tap is saved on the phone first and stays queued until Firebase confirms it,
//   so nothing is lost if the app is closed while offline.
// - If Firebase can't be reached, it keeps retrying and a banner says changes aren't synced yet.
import { firebaseConfig } from './config.js?v=1794428564';

const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
const LS = (() => { try { const k = 'rc:t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; } catch (e) { return null; } })();
const lsGet = (k, d) => { try { const v = LS && LS.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { LS && LS.setItem(k, JSON.stringify(v)); } catch (e) {} };

// ---- connection with retry ----
let dbPromise = null, retryMs = 3000;
function getDb() {
  if (!firebaseConfig || typeof window === 'undefined') return Promise.resolve(null); // tests run outside a browser
  if (!dbPromise) {
    dbPromise = (async () => {
      const app = await import(FB + 'firebase-app.js');
      const db = await import(FB + 'firebase-database.js');
      const inst = app.getApps && app.getApps().length ? app.getApp() : app.initializeApp(firebaseConfig);
      return { api: db, db: db.getDatabase(inst) };
    })().catch((e) => {
      dbPromise = null;
      setStatus('nolink');
      setTimeout(connectAll, retryMs);
      retryMs = Math.min(retryMs * 2, 60000);
      throw e;
    });
  }
  return dbPromise;
}

// ---- status (one for the whole page) ----
let status = 'connecting';
const statusFns = [];
function setStatus(s) {
  if (s === status) return;
  status = s;
  statusFns.forEach((fn) => fn(s));
  banner();
}
export function onStatus(fn) { statusFns.push(fn); fn(status); }

// ---- the phone's copy ----
const cache = {};          // chartId -> data
const live = {};           // chartId -> true once Firebase has sent it
const subs = {};           // chartId -> [fn]
const clone = (x) => (x == null ? x : JSON.parse(JSON.stringify(x)));
function setIn(obj, parts, value) {
  const key = parts[0];
  if (parts.length === 1) {
    if (value === null || value === undefined) delete obj[key];
    else obj[key] = clone(value);
    return obj;
  }
  if (typeof obj[key] !== 'object' || obj[key] === null) obj[key] = {};
  setIn(obj[key], parts.slice(1), value);
  if (Object.keys(obj[key]).length === 0) delete obj[key];
  return obj;
}
function pending() { return lsGet('rc:pending', {}); }
function withPending(chartId, data) {
  const out = clone(data) || {};
  Object.entries(pending()).forEach(([full, v]) => {
    const [c, ...rest] = full.split('/');
    if (c === chartId) setIn(out, rest, v);
  });
  return out;
}
function emit(chartId) {
  const d = withPending(chartId, cache[chartId] || {});
  (subs[chartId] || []).forEach((fn) => fn(clone(d)));
}
export function isLive(chartId) { return !!live[chartId]; }

// ---- subscribe ----
const attached = {};
async function attach(chartId) {
  if (attached[chartId]) return;
  let conn;
  try { conn = await getDb(); } catch (e) { return; }
  if (!conn || attached[chartId]) return;
  attached[chartId] = true;
  const { api, db } = conn;
  api.onValue(api.ref(db, 'charts/' + chartId), (snap) => {
    cache[chartId] = snap.val() || {};
    live[chartId] = true;
    lsSet('rc:cache:' + chartId, cache[chartId]);
    emit(chartId);
  });
  if (!attached['.info']) {
    attached['.info'] = true;
    api.onValue(api.ref(db, '.info/connected'), (s) => {
      if (s.val()) { setStatus('live'); flush(); } else setStatus('offline');
    });
  }
}
function connectAll() { Object.keys(subs).forEach(attach); flush(); }

// Subscribe to a chart's whole data tree. onStatusFn (optional) gets 'live' | 'offline' | 'nolink' | 'connecting'.
export function watch(chartId, onData, onStatusFn) {
  (subs[chartId] = subs[chartId] || []).push(onData);
  if (!(chartId in cache)) cache[chartId] = lsGet('rc:cache:' + chartId, {});
  onData(withPending(chartId, cache[chartId]));
  if (onStatusFn) onStatus(onStatusFn);
  attach(chartId);
}

// Write one value at a slash path inside a chart. false/null removes it.
export async function save(chartId, path, value) {
  const v = value === false || value === undefined ? null : value;
  const full = chartId + '/' + path;
  const p = pending(); p[full] = v; lsSet('rc:pending', p);
  emit(chartId);
  await send(full, v);
}
async function send(full, v) {
  let conn;
  try { conn = await getDb(); } catch (e) { return; }
  if (!conn) return;
  const { api, db } = conn;
  try {
    await api.set(api.ref(db, 'charts/' + full), v);
    const p = pending();
    if (full in p && JSON.stringify(p[full]) === JSON.stringify(v)) { delete p[full]; lsSet('rc:pending', p); }
    banner();
  } catch (e) { /* stays queued; retried on reconnect */ }
}
let flushing = false;
async function flush() {
  if (flushing) return;
  flushing = true;
  try { for (const [full, v] of Object.entries(pending())) await send(full, v); } finally { flushing = false; }
}
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { retryMs = 3000; connectAll(); });
  window.addEventListener('focus', () => { if (status !== 'live') connectAll(); });
}

// ---- "not synced" banner ----
let bannerTimer = null;
function banner() {
  if (typeof document === 'undefined') return;
  const queued = Object.keys(pending()).length;
  const bad = status === 'offline' || status === 'nolink';
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => {
    let el = document.getElementById('netbanner');
    if (!bad) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('div');
      el.id = 'netbanner';
      el.className = 'netbanner';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = 'Not connected. ' + (queued ? queued + ' change' + (queued > 1 ? 's are' : ' is') + ' saved on this phone and will sync when you’re back online.' : 'Changes are saved on this phone and will sync when you’re back online.');
  }, bad ? 2500 : 0);
}

// ---- date helpers (local time) ----
export function ymd(d) {
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
export function parseYmd(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return isNaN(d) ? null : d;
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
// A date from the address bar (?date= / ?week=), or today if missing or not a real date.
export function dateParam(name) {
  const v = new URLSearchParams(location.search).get(name);
  return (v && parseYmd(v)) || new Date();
}

export function statusPill(el) {
  return (st) => {
    el.dataset.state = st;
    el.textContent = st === 'live' ? 'Synced' : st === 'offline' ? 'Offline, will sync' : st === 'nolink' ? 'Can’t connect, retrying' : 'Connecting…';
  };
}

// Service worker: pages and the database code still open with no signal.
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
