const root = process.argv[2];
const V = JSON.parse((await import('node:fs')).readFileSync(root + '/version.json')).v;
const { LESSONS } = await import(root + '/driving-course.js?v=' + V);
const { FORMS } = await import(root + '/driving-tests.js?v=' + V);
function stat(name, qs) {
  let longestRight = 0, shortestRight = 0, n = 0, rank = [0,0,0,0], pos=[0,0,0,0];
  qs.forEach((q) => { const L = q.choices.map((c) => c.length); const a = L[q.answer]; n++;
    const r = L.filter((x) => x > a).length; rank[r]++; pos[q.answer]++;
    if (a === Math.max(...L)) longestRight++; if (a === Math.min(...L)) shortestRight++; });
  // strategy: never pick the longest, guess uniformly among the rest
  let exp = 0; qs.forEach((q) => { const L = q.choices.map((c) => c.length); const m = Math.max(...L); const rest = q.choices.map((_, i) => i).filter((i) => L[i] !== m); exp += rest.includes(q.answer) ? 1 / rest.length : 0; });
  console.log(name, 'n=' + n, 'answer longest:', longestRight, 'answer shortest:', shortestRight, 'length rank (longest..shortest):', rank.join('/'), 'positions:', pos.join('/'), 'expected score guessing w/o longest: ' + (100*exp/n).toFixed(0) + '%');
}
stat('lessons', LESSONS.flatMap((l) => l.questions || []));
stat('form A', FORMS.A); stat('form B', FORMS.B);
