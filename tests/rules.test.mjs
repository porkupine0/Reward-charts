// database.rules.json: every path the app saves to is writable; the top, each whole chart and each
// collection of logs can't be replaced or deleted in one request.
// A NEW save() path in the app needs a rule in database.rules.json AND a line in WRITES below.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const RULES = JSON.parse(readFileSync(new URL('../database.rules.json', import.meta.url))).rules;

// Realtime Database semantics: at each level a named child wins over a $wildcard; a ".write": true on
// the path or any parent of it allows the write (it can't be taken back further down).
export function canWrite(path) {
  let node = RULES;
  if (node['.write'] === true) return true;
  for (const key of path.split('/').filter(Boolean)) {
    const next = node[key] || node[Object.keys(node).find((k) => k.startsWith('$'))];
    if (!next) return false;
    node = next;
    if (node['.write'] === true) return true;
  }
  return false;
}

const WRITES = [
  // routines (checklists): every item, timers, parts, excuses, evening checks, candy, wake time, a whole day (clearing old logs)
  'charts/routines/days/2026-11-18/eli/teeth', 'charts/routines/days/2026-11-18/eli/bedTimer', 'charts/routines/days/2026-11-18/eli/bedTimer/end',
  'charts/routines/days/2026-11-18/isaiah/clothes_shirt', 'charts/routines/days/2026-11-18/rhett/noLies', 'charts/routines/days/2026-11-18/rhett/bedOk',
  'charts/routines/days/2026-11-18/eli/mCandyGiven', 'charts/routines/days/2026-11-18/eli/wokeAt', 'charts/routines/days/2024-01-01',
  'charts/routines/weekly/eli/aelp/2026-11-12', 'charts/routines/game/rhett/2026-11-16/1795000000000', 'charts/routines/carry/rhett/2026-11-16',
  // Eli's Training
  'charts/eli-run/days/2026-11-18/items/swim', 'charts/eli-run/days/2026-11-18/effort', 'charts/eli-run/days/2026-11-18/time',
  'charts/eli-run/days/2026-11-18/miles', 'charts/eli-run/days/2026-11-18/note',
  // Ball Master
  'charts/isaiah/start', 'charts/isaiah/touchDays/2026-11-18', 'charts/isaiah/touches', 'charts/isaiah/juggle/5',
  'charts/isaiah/weekPrize/2', 'charts/isaiah/weekPrize', 'charts/isaiah/champion', 'charts/isaiah/cashed', 'charts/isaiah/cashed/weekPrize_1',
  // weekly charts (Eli, Rhett, Isaiah)
  'charts/eli/weeks/2026-11-09/checks/chores/3', 'charts/trombone/weeks/2026-11-16/reward', 'charts/trombone/weeks/2026-11-16/given',
  'charts/zay/weeks/2026-11-16/given', 'charts/eli/months/2026-11/prize', 'charts/eli/months/2026-11/given',
  // time trials
  'charts/eli-trials/trials/p2026-11-21', 'charts/eli-trials/trials/m3k2x', 'charts/eli-trials/paid/mile-6:45', 'charts/eli-trials/pick/mile-6:45',
  // settings
  'charts/config/chores', 'charts/config/showers', 'charts/config/lights', 'charts/config/game', 'charts/config/grace', 'charts/config/checks',
  'charts/config/rewards', 'charts/config/prizeLevels', 'charts/config/history/2026-11-18', 'charts/settings/pinHash', 'charts/settings/pin'
];

const PROTECTED = [
  '', 'charts', 'charts/routines', 'charts/routines/days', 'charts/routines/weekly', 'charts/routines/game', 'charts/routines/game/eli', 'charts/routines/carry', 'charts/routines/carry/eli',
  'charts/eli-run', 'charts/eli-run/days', 'charts/eli-run/days/2026-11-18',
  'charts/isaiah', 'charts/isaiah/touchDays', 'charts/isaiah/juggle',
  'charts/eli', 'charts/trombone', 'charts/zay', 'charts/eli/weeks', 'charts/trombone/months', 'charts/zay/weeks/2026-11-16',
  'charts/eli-trials', 'charts/eli-trials/trials', 'charts/eli-trials/paid',
  'charts/config', 'charts/config/history', 'charts/settings', 'charts/somethingelse/x'
];

test('rules: every path the app saves to can be written', () => {
  assert.deepEqual(WRITES.filter((p) => !canWrite(p)), []);
});

test('rules: the top, whole charts and whole collections are refused', () => {
  assert.deepEqual(PROTECTED.filter((p) => canWrite(p)), []);
});

test('rules: reads stay open (the app has no sign-in)', () => {
  assert.equal(RULES['.read'], true);
});

test('rules: every save() in the app is covered by a WRITES example', () => {
  // A rough guard: each chart a page saves to appears in WRITES.
  const src = ['checklist.js', 'parents.js', 'run.js', 'settings-page.js', 'soccer.js', 'trials.js', 'weekly.js', 'parent.js']
    .map((f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8')).join('\n');
  const literal = [...src.matchAll(/save\('([a-z-]+)'/g)].map((m) => m[1]);
  const covered = new Set(WRITES.map((p) => p.split('/')[1]));
  assert.deepEqual([...new Set(literal)].filter((c) => !covered.has(c)), []);
});
