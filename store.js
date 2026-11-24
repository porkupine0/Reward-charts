// Sync layer: Firebase Realtime Database, with a copy of every chart kept on this phone.
// - Pages open instantly from the phone's copy, even with no signal.
// - Every tap is saved on the phone first and stays queued until Firebase confirms it,
//   so nothing is lost if the app is closed while offline.
// - If Firebase can't be reached, it keeps retrying and a banner says changes aren't synced yet.
import { firebaseConfig } from './config.js?v=1795503275';
import { fromStored, enqueue, confirm, acked, has, decide, getAt } from './queue.js?v=1795503275';

const FB = 'https://www.gstatic.com/firebasejs/10.12.2/';
const LS = (() => { try { const k = 'rc:t'; localStorage.setItem(k, '1'); localStorage.removeItem(k); return localStorage; } catch (e) { return null; } })();
const lsGet = (k, d) => { try { const v = LS && LS.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const lsSet = (k, v) => { try { if (!LS) return false; LS.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

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
// The save queue is kept on the phone (rc:queue) and read fresh each time, so two pages (or a page
// restored with Back) never write over each other's taps. Memory is only the fallback when phone
// storage can't be written. Older versions used rc:pending: it's moved over once, then removed.
let mem = [], storageOk = true;
const failed = new Set();  // paths Firebase refused; they stay queued and are retried
let skipped = 0;           // changes not sent because another phone changed the same thing first
function q() {
  if (!LS || !storageOk) return mem;
  const stored = lsGet('rc:queue', null);
  if (stored) return fromStored(stored);
  const old = lsGet('rc:pending', null);
  if (!old) return [];
  const moved = fromStored(old);
  if (lsSet('rc:queue', moved)) { try { LS.removeItem('rc:pending'); } catch (e) {} }
  return moved;
}
function setQ(next) {
  mem = next;
  if (LS && storageOk) storageOk = lsSet('rc:queue', next);
}
function withPending(chartId, data) {
  const out = clone(data) || {};
  q().forEach((e) => {
    const [c, ...rest] = e.path.split('/');
    if (c === chartId) setIn(out, rest, e.v);
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
    const first = !live[chartId];
    cache[chartId] = snap.val() || {};
    live[chartId] = true;
    lsSet('rc:cache:' + chartId, cache[chartId]);
    emit(chartId);
    if (first) flush(); // queued changes for this chart can go once its fresh data is here (once, so two tabs don't race)
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
  // remember what the server had here, so a stale offline change can't overwrite another phone's newer one
  // (no base when this page has no copy of the chart: it's sent as before)
  setQ(enqueue(q(), full, v, chartId in cache ? (getAt(cache[chartId], path) ?? null) : undefined));
  emit(chartId);
  if (!storageOk) notify();
  await flush();
}
async function send(e) {
  let conn;
  try { conn = await getDb(); } catch (err) { return; }
  if (!conn) return;
  const { api, db } = conn;
  try {
    await api.set(api.ref(db, 'charts/' + e.path), e.v);
    failed.delete(e.path);
    setQ(acked(q(), e.path, e.v));
  } catch (err) {
    failed.add(e.path); // stays queued; retried later
    setTimeout(flush, 30000);
  }
  notify();
}
let flushing = false, again = false;
async function flush() {
  if (flushing) { again = true; return; }
  flushing = true;
  try {
    do {
      again = false;
      for (const e of q().slice()) {
        if (!has(q(), e)) continue; // dropped or replaced since this pass started
        const c = e.path.split('/')[0];
        if (!live[c]) { if (status === 'live') attach(c); continue; } // wait for this chart's fresh data first
        const what = decide(e, getAt(cache[c] || {}, e.path.slice(c.length + 1)) ?? null);
        if (what === 'done') { setQ(confirm(q(), e.path, e.v)); failed.delete(e.path); continue; }
        if (what === 'conflict') { setQ(confirm(q(), e.path, e.v)); skipped++; emit(c); continue; }
        await send(e);
      }
    } while (again);
  } finally { flushing = false; notify(); }
}
// Refresh the pill and banner after a save, a failure or a skipped change.
function notify() { statusFns.forEach((fn) => fn(status)); banner(); }
export function syncProblems() { return { failed: failed.size, skipped, storage: !storageOk, queued: q().length }; }
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { retryMs = 3000; connectAll(); });
  window.addEventListener('focus', () => { if (status !== 'live') connectAll(); });
}

// ---- "not synced" banner ----
let bannerTimer = null;
let bannerBad = false;
function banner() {
  if (typeof document === 'undefined') return;
  const bad = status === 'offline' || status === 'nolink';
  // While offline, wait 2.5 s before showing (brief blips stay quiet); don't restart that wait on every retry.
  if (bad && bannerBad && bannerTimer) return;
  bannerBad = bad;
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => {
    bannerTimer = null;
    const nowBad = status === 'offline' || status === 'nolink', queued = q().length, msgs = [];
    if (nowBad) msgs.push('Not connected. ' + (queued ? queued + ' change' + (queued > 1 ? 's are' : ' is') + ' saved on this phone and will sync when you’re back online.' : 'Changes are saved on this phone and will sync when you’re back online.'));
    if (failed.size) msgs.push(failed.size + ' change' + (failed.size > 1 ? 's' : '') + ' couldn’t be saved yet. This phone will keep trying.');
    if (skipped) msgs.push((skipped > 1 ? skipped + ' changes from this phone weren’t' : 'A change from this phone wasn’t') + ' sent because someone changed the same thing on another phone first.');
    if (!storageOk) msgs.push('This phone’s storage is full: changes are still sent, but close the app only once it says Synced.');
    let el = document.getElementById('netbanner');
    if (!msgs.length) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('div');
      el.id = 'netbanner';
      el.className = 'netbanner';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msgs.join(' ');
    if (skipped && !nowBad && !failed.size) setTimeout(() => { skipped = 0; banner(); }, 10000); // a notice, not a state
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
    const pr = syncProblems();
    if (st === 'live' && pr.failed) { el.dataset.state = 'nolink'; el.textContent = 'Not saved, retrying'; return; }
    if (st === 'live' && pr.queued) { el.textContent = 'Saving…'; return; }
    el.textContent = st === 'live' ? 'Synced' : st === 'offline' ? 'Offline, will sync' : st === 'nolink' ? 'Can’t connect, retrying' : 'Connecting…';
  };
}

// Service worker: pages and the database code still open with no signal.
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
