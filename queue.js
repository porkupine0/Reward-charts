// The offline save queue's rules, with no Firebase or phone storage, so they can be tested on their own.
// A queue is an ordered list of { path, v, base } where path is 'chartId/a/b', v the value to write
// (null = remove) and base the value the server last had there when the change was made.
// Entries from older versions (an object of path -> value) have no base.

const same = (a, b) => JSON.stringify(a === undefined ? null : a) === JSON.stringify(b === undefined ? null : b);
const under = (p, parent) => p === parent || p.startsWith(parent + '/');

// Older versions kept { path: value }; keep reading it.
export function fromStored(stored) {
  if (Array.isArray(stored)) return stored.filter((e) => e && typeof e.path === 'string');
  if (stored && typeof stored === 'object') return Object.entries(stored).map(([path, v]) => ({ path, v }));
  return [];
}

// Add a change. Setting or clearing a path drops queued writes at or beneath it (they'd be
// overwritten anyway, and replaying them after would bring cleared data back). A path queued again
// moves to the end and keeps the base from its first change.
export function enqueue(q, path, v, base) {
  const prev = q.find((e) => e.path === path);
  const out = q.filter((e) => !under(e.path, path));
  const e = { path, v };
  if (prev) { if ('base' in prev) e.base = prev.base; } else if (base !== undefined) e.base = base;
  out.push(e);
  return out;
}

// Remove the entry for this path with this exact value (it's done, or it was dropped).
export function confirm(q, path, v) {
  const i = q.findIndex((e) => e.path === path && same(e.v, v));
  return i < 0 ? q : q.slice(0, i).concat(q.slice(i + 1));
}
// The server acknowledged writing v at path. That entry is done; and if the same path was changed
// again meanwhile (Yes, then quickly Not today), the server now holds v, so that's the new base.
export function acked(q, path, v) {
  return confirm(q, path, v).map((e) => (e.path === path ? Object.assign({}, e, { base: v }) : e));
}
// Still queued exactly like this? (A pass skips entries that were dropped or replaced meanwhile.)
export function has(q, e) { return q.some((x) => x.path === e.path && same(x.v, e.v)); }

// On reconnect, with fresh server data: send it, it's already there, or another phone changed it.
export function decide(e, serverValue) {
  if (same(serverValue, e.v)) return 'done';
  if (!('base' in e)) return 'send'; // older entry: send as before
  return same(serverValue, e.base) ? 'send' : 'conflict';
}

// Read a value at a slash path inside a data tree.
export function getAt(tree, path) {
  return path.split('/').reduce((o, k) => (o == null ? undefined : o[k]), tree);
}
