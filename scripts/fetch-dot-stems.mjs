// Saves the QUESTION TEXT ONLY of Iowa DOT's online practice knowledge test to docs/iowa/dot-practice-stems.txt,
// as a coverage benchmark for the course reviews (the parent allowed this, Nov 21, 2026). The answer key is
// dropped at parse time: it is never printed, logged or written.
// Run: NODE_USE_ENV_PROXY=1 node scripts/fetch-dot-stems.mjs (routes node through the HTTPS proxy, if any)
import { writeFileSync } from 'node:fs';
const URL_Q = 'https://ia.iowadot.gov/mvd/driverslicense/quizFiles2023/dlQuestions.js';
const res = await fetch(URL_Q, { headers: { 'User-Agent': 'study-app-coverage-check' } });
if (!res.ok) { console.error('fetch failed: HTTP ' + res.status); process.exit(1); }
const src = await res.text();
// quizArray holds one string per question: 'number~code~question~choice~choice~...'. Keep field 3 (the
// question) only; the code field and the choices are dropped here.
const stems = new Set();
const arr = src.slice(src.indexOf('quizArray'), src.indexOf('];', src.indexOf('quizArray')));
for (const m of arr.matchAll(/'((?:\\.|[^'\\])*)'/g)) {
  const t = (m[1].split('~')[2] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (t) stems.add(t);
}
const list = [...stems];
writeFileSync(new URL('../docs/iowa/dot-practice-stems.txt', import.meta.url),
  'Source: ' + URL_Q + '\nSaved: ' + new Date().toISOString().slice(0, 10) + ' (question text only; no answers. 68 questions, 66 distinct stems: "This sign means:" and one work-zone stem each appear twice, with different pictures)\n\n' + list.map((s, i) => (i + 1) + '. ' + s).join('\n') + '\n');
console.log(list.length + ' distinct question stems saved (68 questions; two stems repeat with different pictures: "This sign means:" and a work-zone question)');
