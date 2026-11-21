// Form C-F groundwork: every sentence of the Iowa manual (and the saved DOT permit/license pages) that states
// a number, with a topic guess and the questions that already quote it. Writes docs/driving-fact-supply.json
// (input for docs/driving-form-reservations.md). Mechanical: read from the text, not from memory.
// Run: node scripts/fact-supply.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const V = JSON.parse(readFileSync(new URL('../version.json', import.meta.url))).v;
const D = await import('../driving.js?v=' + V), T = await import('../driving-tests.js?v=' + V), { LESSONS } = await import('../driving-course.js?v=' + V);
const read = (f) => readFileSync(new URL('../docs/iowa/' + f, import.meta.url), 'utf8');
const pages = {};
read('drivers-manual.txt').split(/\n===== PDF page (\d+) =====\n/).forEach((t, i, a) => { if (i % 2) pages['p.' + a[i]] = a[i + 1]; });
Object.entries(D.SOURCES).forEach(([k, s]) => { pages[k] = read(s.file).split('\n').slice(2).join('\n'); });
const norm = (x) => String(x || '').toLowerCase().replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/-\s*\n\s*/g, '').replace(/\s+/g, ' ').trim();
const UNIT = /\b\d[\d,.]*\s*(?:%|percent|feet|foot|ft|mph|miles?|seconds?|minutes?|hours?|days?|months?|years?|inches|yards?|blocks?|car lengths?|times|p\.m\.|a\.m\.|passengers?|points?|violations?)\b|\$\s?\d|\.0[2-9]\b|\b(?:one|two|three|four|five|six|eight|ten|twelve|fifteen|twenty|thirty|fifty|hundred)\s+(?:feet|seconds|miles|hours|days|months|years|times|car lengths|violations)\b/i;
const TOPICS = [
  ['School buses and emergency vehicles', /school bus|emergency vehicle|ambulance|fire truck|siren/i],
  ['Railroad crossings and work zones', /railroad|train|track|work zone|flagger|construction/i],
  ['Alcohol and phones', /alcohol|bac|drunk|impair|drug|phone|text|electronic|implied consent|\.0\d/i],
  ['Highways, weather and road types', /interstate|freeway|highway|ramp|merge|fog|rain|snow|ice|skid|weather|night|gravel|deer|animal|rural|flood/i],
  ['Speed, turns, passing and lights', /speed|mph|turn|signal|pass|headlight|beam|lights|following|stopping|park|hydrant|curb|lane/i],
  ['Signals and markings', /line|marking|arrow|lane|flashing|signal light/i],
  ['Right of way', /yield|right of way|right-of-way|pedestrian|intersection/i],
  ['Signs', /sign/i],
  ['Permit and license rules', /permit|license|licence|supervis|passenger|curfew|12:30|5 a\.m\.|instruction|intermediate|violation|suspend|revoke|points/i],
];
const quotes = [...Object.values(T.FORMS).flat(), ...LESSONS.flatMap((l) => [...(l.questions || []), ...(l.key || []).filter((x) => !x.family).map((x, i) => ({ ...x, id: l.id + ' key ' + (i + 1) }))])]
  .filter((x) => x.quote).map((x) => ({ id: x.id, src: (Object.entries(D.SOURCES).find(([, s]) => s.ref === x.ref) || [])[0] || 'p.' + x.ref.match(/p\.\s?(\d+)/)[1], q: norm(x.quote) }));
const facts = [];
Object.entries(pages).forEach(([src, text]) => {
  norm(text).split(/(?<=[.!?])\s+(?=[A-Z"(])|\s*•\s*/i).forEach((s) => { // (sentences, and each bullet of a list)
    if (s.length < 25 || s.length > 400 || !UNIT.test(s) || /^\d+\s*$|table of contents|page \d+ of/i.test(s)) return;
    const words = s.split(' ');
    const used = quotes.filter((q) => q.src === src && (s.includes(q.q) || q.q.includes(s) || q.q.split(' ').some((_, i, w) => i + 5 <= w.length && s.includes(w.slice(i, i + 5).join(' '))))).map((q) => q.id);
    facts.push({ src, topic: (TOPICS.find(([, re]) => re.test(s)) || ['Other'])[0], used, text: words.length > 60 ? words.slice(0, 60).join(' ') + ' …' : s });
  });
});
writeFileSync(new URL('../docs/driving-fact-supply.json', import.meta.url), JSON.stringify(facts, null, 1) + '\n');
const by = {};
facts.forEach((f) => { const b = by[f.topic] || (by[f.topic] = { all: 0, free: 0 }); b.all++; if (!f.used.length) b.free++; });
console.log(facts.length + ' number sentences; by topic (all / not yet quoted):');
Object.entries(by).sort((a, b) => b[1].all - a[1].all).forEach(([t, b]) => console.log('  ' + t + ': ' + b.all + ' / ' + b.free));
