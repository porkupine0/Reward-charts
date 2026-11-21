const root = process.argv[2];
const V = JSON.parse((await import('node:fs')).readFileSync(root + '/version.json')).v;
const D = await import(root + '/driving.js?v=' + V);
const { LESSONS } = await import(root + '/driving-course.js?v=' + V);
const p = { approved: {}, done: {}, answers: {} };
LESSONS.forEach((l) => (p.approved[l.id] = '2026-11-01'));
const days = []; let d = new Date(2026, 10, 23);
while (days.length < 20) { if (d.getDay() % 6) days.push(d.toISOString().slice(0, 10)); d = new Date(d.getTime() + 864e5); }
// Eli misses the 2nd question of each lesson's own quiz
const asked = {};
days.forEach((day, i) => {
  const st = D.lessonFor(LESSONS, p, day);
  if (st.status !== 'ready') return;
  const quiz = D.quizFor(LESSONS, st.index, p);
  let missedPrior = [];
  quiz.forEach((q, k) => {
    const prev = asked[q.id] || 0;
    const ok = process.argv[3] === "all" ? true : !(k === 1 && !st.lesson.review);
    if (st.lesson.review) { const h = (p.answers[q.id] || {}); if (Object.values(h).some((a) => !a.ok)) missedPrior.push(q.id); }
    (p.answers[q.id] = p.answers[q.id] || {})[st.lesson.id] = { ok, on: day };
    asked[q.id] = prev + 1;
    q._prev = prev;
  });
  p.done[st.lesson.id] = day;
  console.log(day, st.lesson.id, quiz.length, quiz.map((q) => q.id + (st.lesson.review ? (q._prev ? '' : '*') : '')).join(' '), st.lesson.review ? ' never-asked=' + quiz.filter((q) => !q._prev).length + ' prior-misses-included=' + missedPrior.length : '');
});
const all = LESSONS.flatMap((l) => l.questions);
console.log('questions', all.length, 'never asked after 4 units:', all.filter((q) => !asked[q.id]).map((q) => q.id).join(' '));
