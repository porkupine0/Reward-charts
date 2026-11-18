// Eli's Driving page: today's lesson (video, Watched, 5 questions), past lessons' answers, and the
// parent preview (approve or skip each lesson before Eli sees it).
import { watch, save, isLive, ymd, parseYmd, esc, statusPill } from './store.js?v=1795009740';
import { applyConfig } from './routines.js?v=1795009740';
import { askParent } from './parent.js?v=1795009740';
import * as L from './lists.js?v=1795009740';
import { lessonFor, quizFor } from './driving.js?v=1795009740';

const $ = (id) => document.getElementById(id);
const ID = 'eli-drive';
const ctx = { routines: {}, run: {}, isaiah: {}, drive: {} };
const params = new URLSearchParams(location.search);
const pastDay = params.get('date') && parseYmd(params.get('date')) ? params.get('date') : null;
let previewOpen = false;

const video = (v) => '<div class="dv">' +
  (v.yt ? '<div class="dv-frame"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(v.yt) + '" title="' + esc(v.title) + '" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>' : '') +
  '<p class="dv-meta"><b>' + esc(v.title) + '</b> · ' + esc(v.channel || '') + (v.len ? ' · ' + esc(v.len) : '') + '</p>' +
  (v.iowa ? '<p class="dv-iowa"><b>In Iowa:</b> ' + esc(v.iowa) + '</p>' : '') +
  (v.yt ? '<a class="cklink dv-open" href="https://www.youtube.com/watch?v=' + esc(v.yt) + '" target="_blank" rel="noopener">Open on YouTube &rarr;</a>' : '') + '</div>';

// One question: the choices, or (once answered) his pick, the right answer, why, and the manual page.
function questionHtml(q, a, lessonId) {
  const head = '<p class="dq-q">' + esc(q.q) + '</p>';
  if (!a) return '<div class="dq">' + head + '<div class="dq-choices">' + q.choices.map((c, i) =>
    '<button class="dq-choice" type="button" data-pick="' + esc(q.id) + '|' + esc(lessonId) + '|' + i + '">' + esc(c) + '</button>').join('') + '</div></div>';
  return '<div class="dq answered ' + (a.ok ? 'ok' : 'miss') + '">' + head +
    '<p class="dq-result">' + (a.ok ? '✓ Right: ' : '✗ You picked “' + esc(q.choices[a.pick] || '') + '”. Right answer: ') + '<b>' + esc(q.choices[q.answer]) + '</b></p>' +
    '<p class="dq-why">' + esc(q.why) + ' <small>(' + esc(q.ref) + ')</small></p></div>';
}
const answerOf = (qid, lessonId) => (((ctx.drive.answers || {})[qid] || {})[lessonId]) || null;

function render() {
  const course = L.course(), d = ctx.drive || {};
  if (!(isLive('routines') && isLive(ID))) { $('today').innerHTML = '<p class="muted">Loading…</p>'; return; }
  if (pastDay) return renderPast(course, d);
  const now = new Date(), key = ymd(now), dow = (now.getDay() + 6) % 7;
  const st = lessonFor(course, d, key);
  if (!course.length) { $('today').innerHTML = '<h2>No lessons yet</h2><p class="note">The first week of lessons is on its way.</p>'; return; }
  if (st.status === 'finished') { $('today').innerHTML = '<h2>Course finished!</h2><p class="note">Every lesson done. Nice work.</p>'; return; }
  if (st.status === 'waiting') { $('today').innerHTML = '<h2>Next lesson: ' + esc(st.lesson.title) + '</h2><p class="note">Waiting for Mom or Dad to preview and approve it.</p>'; return; }
  if (st.status !== 'done' && dow > 4) { $('today').innerHTML = '<h2>See you Monday</h2><p class="note">Driving lessons are Monday to Friday.</p>'; return; }
  const lock = st.status === 'done' ? false : L.computerLock(ctx, 'eli', now);
  if (lock) { $('today').innerHTML = '<h2>' + esc(st.lesson.title) + '</h2><p class="lockmsg">' + (lock === 'owed' ? 'Finish the chore you missed earlier this week first (it’s at the top of your checklist).' : 'Do today’s chores first, then come back.') + '</p><a class="cklink" href="checklist.html?kid=eli">Open my checklist &rarr;</a>'; return; }
  const lesson = st.lesson, watched = !!(d.watched || {})[lesson.id];
  // the quiz is built without today's answers, so it stays the same while he takes it
  const quiz = st.status === 'done' ? storedQuiz(course, lesson.id) : quizFor(course, st.index, d);
  let h = '<p class="eyebrow">' + (lesson.review ? 'Review day' : 'Today’s lesson') + '</p><h2>' + esc(lesson.title) + '</h2>';
  if (lesson.review) h += '<p class="note">No video today: 5 questions from earlier lessons.</p>';
  else h += (lesson.videos || []).map(video).join('') + (watched ? '<p class="dv-done">✓ Watched</p>' : '<button class="tt-save" type="button" data-watched="' + esc(lesson.id) + '">I watched it</button>');
  if (watched || lesson.review) h += '<div class="dquiz"><h3>5 questions</h3>' + quiz.map((q) => questionHtml(q, answerOf(q.id, lesson.id), lesson.id)).join('') + '</div>';
  if (st.status === 'done') h += '<p class="dv-done big">Lesson done for today ✓</p>';
  $('today').innerHTML = h;
}
// A finished lesson: the questions he answered in it, from what was stored (not a rebuilt quiz)
function storedQuiz(course, lessonId) {
  const all = course.flatMap((l) => l.questions || []), ans = ctx.drive.answers || {};
  return all.filter((q) => ans[q.id] && ans[q.id][lessonId]).sort((a, b) => (ans[a.id][lessonId].n || 0) - (ans[b.id][lessonId].n || 0));
}
function renderPast(course, d) {
  const lesson = course.find((l) => (d.done || {})[l.id] === pastDay);
  if (!lesson) { $('today').innerHTML = '<h2>No lesson finished on ' + esc(pastDay) + '</h2>'; return; }
  $('today').innerHTML = '<p class="eyebrow">Finished ' + esc(pastDay) + '</p><h2>' + esc(lesson.title) + '</h2>' + (lesson.videos || []).map(video).join('') +
    '<div class="dquiz">' + storedQuiz(course, lesson.id).map((q) => questionHtml(q, answerOf(q.id, lesson.id), lesson.id)).join('') + '</div>';
}

// ---- parent preview: upcoming lessons with their videos and answers (after the PIN) ----
function renderPreview() {
  if (!previewOpen) { $('preview').innerHTML = ''; return; }
  const course = L.course(), d = ctx.drive || {}, ap = d.approved || {};
  const upcoming = course.filter((l) => !l.review && !(d.done || {})[l.id]).slice(0, 10);
  $('preview').innerHTML = upcoming.length ? upcoming.map((l) => '<div class="dprev"><h3>' + esc(l.title) + ' <span class="rcount">' + (ap[l.id] === true ? 'Approved ✓' : ap[l.id] === 'skip' ? 'Skipped' : 'Not reviewed') + '</span></h3>' +
    (l.videos || []).map(video).join('') +
    '<ol class="dprev-q">' + (l.questions || []).map((q) => '<li>' + esc(q.q) + ' <b>' + esc(q.choices[q.answer]) + '</b> <small>(' + esc(q.ref) + ')</small></li>').join('') + '</ol>' +
    '<span class="exbtns"><button class="tbtn approve" data-approve="' + esc(l.id) + '|yes">Approve</button><button class="linkbtn" data-approve="' + esc(l.id) + '|skip">Skip</button>' +
    (ap[l.id] !== undefined ? '<button class="linkbtn" data-approve="' + esc(l.id) + '|undo">Undo</button>' : '') + '</span></div>').join('') : '<p class="muted">No upcoming lessons.</p>';
}

document.addEventListener('click', async (e) => {
  const w = e.target.closest('[data-watched]');
  if (w) { save(ID, 'watched/' + w.dataset.watched, ymd(new Date())); return; }
  const pk = e.target.closest('[data-pick]');
  if (pk) {
    const [qid, lessonId, pick] = pk.dataset.pick.split('|'), q = L.course().flatMap((l) => l.questions || []).find((x) => x.id === qid);
    if (!q || answerOf(qid, lessonId)) return; // the first answer counts
    const n = Object.values(ctx.drive.answers || {}).filter((a) => a[lessonId]).length + 1;
    await save(ID, 'answers/' + qid + '/' + lessonId, { ok: Number(pick) === q.answer, pick: Number(pick), on: ymd(new Date()), n });
    finishIfDone(lessonId);
    return;
  }
  const ap = e.target.closest('[data-approve]');
  if (ap) {
    const [lid, a] = ap.dataset.approve.split('|');
    if (await askParent()) save(ID, 'approved/' + lid, a === 'yes' ? true : a === 'skip' ? 'skip' : null);
  }
});
$('previewbtn').onclick = async () => { if (await askParent()) { previewOpen = true; renderPreview(); } };

// Finished = watched (or a review) + all 5 answered; no pass mark.
function finishIfDone(lessonId) {
  const course = L.course(), d = ctx.drive || {}, key = ymd(new Date()), st = lessonFor(course, d, key);
  if (!st.lesson || st.lesson.id !== lessonId || st.status !== 'ready') return;
  const quiz = quizFor(course, st.index, d);
  const watched = st.lesson.review || (d.watched || {})[lessonId];
  if (watched && quiz.length && quiz.every((q) => answerOf(q.id, lessonId))) save(ID, 'done/' + lessonId, key);
}

const draw = () => { render(); renderPreview(); };
watch(ID, (v) => { ctx.drive = v || {}; draw(); }, statusPill($('sync')));
watch('routines', (v) => { ctx.routines = v || {}; draw(); });
watch('config', (v) => { applyConfig(v); draw(); });
