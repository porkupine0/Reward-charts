// Eli's driving course: the rules, with no page and no content (content lives in driving-course.js later).
// A lesson is { id, title, review?, videos: [...], questions: [{ id, q, choices, answer, why, ref }] }.
// Progress (stored per lesson and question) is
//   { approved: { lessonId: true|'skip' }, done: { lessonId: 'YYYY-MM-DD' }, answers: { questionId: [{ on, ok }] } }.
// Everything here is deterministic: the same progress always gives the same lesson and the same quiz.

// The lesson for a day: the one finished that day, else the next one in order that a parent approved.
// Lessons a parent skipped are passed over. Returns { lesson, index, status } where status is
// 'done' (finished today), 'ready', 'waiting' (the next one isn't approved yet) or 'finished' (course over).
export function lessonFor(lessons, progress, dayKey) {
  const p = progress || {}, done = p.done || {}, approved = p.approved || {};
  const today = lessons.findIndex((l) => done[l.id] === dayKey);
  if (today >= 0) return { lesson: lessons[today], index: today, status: 'done' };
  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    if (done[l.id] || approved[l.id] === 'skip') continue;
    // one new lesson a day: if another lesson was already finished today, nothing new
    return approved[l.id] === true ? { lesson: l, index: i, status: 'ready' } : { lesson: l, index: i, status: 'waiting' };
  }
  return { lesson: null, index: lessons.length, status: 'finished' };
}

// How a question has gone so far: times answered, times missed, last answer.
function record(p, qid) {
  const a = ((p && p.answers) || {})[qid] || [];
  return { seen: a.length, missed: a.filter((x) => !x.ok).length, lastOk: a.length ? a[a.length - 1].ok : null, last: a.length ? a[a.length - 1].on : '' };
}

// Today's 5 questions: 3 from this lesson and 2 from earlier lessons (a review lesson: all 5 from earlier).
// Earlier questions: last answered wrong first, then missed most, then least recently seen, then course order.
export function quizFor(lessons, index, progress, size = 5) {
  const lesson = lessons[index];
  if (!lesson) return [];
  const fromToday = lesson.review ? [] : (lesson.questions || []).slice(0, 3);
  const earlier = [];
  lessons.slice(0, index).forEach((l, li) => (l.questions || []).forEach((q, qi) => earlier.push({ q, li, qi, r: record(progress, q.id) })));
  earlier.sort((a, b) =>
    (a.r.lastOk === false ? 0 : 1) - (b.r.lastOk === false ? 0 : 1) ||
    b.r.missed - a.r.missed ||
    (a.r.last < b.r.last ? -1 : a.r.last > b.r.last ? 1 : 0) ||
    a.li - b.li || a.qi - b.qi);
  const fromBefore = earlier.slice(0, size - fromToday.length).map((x) => x.q);
  // too few earlier questions (the first days): fill from this lesson
  const more = (lesson.questions || []).slice(fromToday.length).filter((q) => !fromBefore.includes(q));
  return [...fromToday, ...fromBefore, ...more].slice(0, size);
}

// Grade answers { questionId: choiceIndex }: { right, total, missed: [questionId] }.
export function grade(quiz, picks) {
  const missed = quiz.filter((q) => (picks || {})[q.id] !== q.answer).map((q) => q.id);
  return { right: quiz.length - missed.length, total: quiz.length, missed };
}
