// Eli's Driving page: today's lesson (video, Watched, 5 questions), past lessons' answers, and the
// parent preview (approve or skip each lesson before Eli sees it).
import { watch, save, isLive, ymd, parseYmd, mondayOf, esc, statusPill } from './store.js?v=1795094485';
import { applyConfig } from './routines.js?v=1795094485';
import { askParent } from './parent.js?v=1795094485';
import * as L from './lists.js?v=1795094485';
import { lessonFor, quizFor, isApproved, isSkipped, testScore, openSittings } from './driving.js?v=1795094485';
import { signSvg } from './signs.js?v=1795094485';
import * as COURSE from './driving-course.js?v=1795094485';
import { FORMS, SITTINGS, PASS } from './driving-tests.js?v=1795094485';

const $ = (id) => document.getElementById(id);
const ID = 'eli-drive';
const ctx = { routines: {}, run: {}, isaiah: {}, drive: {} };
const params = new URLSearchParams(location.search);
const pastDay = params.get('date') && parseYmd(params.get('date')) ? params.get('date') : null;
let previewOpen = false;
let testOpen = null; // the sitting he's taking (questions shown)

// The lesson's key points (above the video): each from the manual (page shown) or marked as a family rule.
const keyCard = (l) => (l.key || []).length ? '<div class="dkey"><h3>Key points</h3><ul>' + l.key.map((x) => '<li>' + esc(x.t) + ' <small>(' + (x.family ? 'Family rule' : esc(x.ref).replace(/^Iowa Driver.s Manual /, 'Manual ')) + ')</small></li>').join('') + '</ul></div>' : '';
const video = (v) => '<div class="dv">' +
  (v.yt ? '<div class="dv-frame"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(v.yt) + '" title="' + esc(v.title) + '" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>' : '') +
  '<p class="dv-meta"><b>' + esc(v.title) + '</b> · ' + esc(v.channel || '') + (v.len ? ' · about ' + esc(v.len) : '') + '</p>' +
  (v.iowa ? '<p class="dv-iowa"><b>In Iowa:</b> ' + esc(v.iowa) + '</p>' : '') +
  (v.yt ? '<a class="cklink dv-open" href="https://www.youtube.com/watch?v=' + esc(v.yt) + '" target="_blank" rel="noopener">Open on YouTube &rarr;</a>' : '') + '</div>';

// One question. Unanswered: the choices. Answered: the choices stay where they were (nothing moves under his
// finger), his pick marked; then, unless `hide` (a unit test still in progress), the right answer, why, and
// the manual page below them.
// The question (and its sign, if it has one): shared by lessons, unit tests and knowledge tests.
const qHead = (q, num) => '<p class="dq-q">' + (num ? num + '. ' : '') + esc(q.q) + '</p>' + (q.sign ? '<div class="dq-sign">' + signSvg(q.sign) + '</div>' : '');
function questionHtml(q, a, lessonId, hide) {
  const head = qHead(q);
  if (!a) return '<div class="dq">' + head + '<div class="dq-choices">' + q.choices.map((c, i) =>
    '<button class="dq-choice" type="button" data-pick="' + esc(q.id) + '|' + esc(lessonId) + '|' + i + '">' + esc(c) + '</button>').join('') + '</div></div>';
  const show = !hide && a.pick !== undefined;
  const choices = '<div class="dq-choices">' + q.choices.map((c, i) => '<button class="dq-choice' + (i === a.pick ? ' picked' : '') + (show && i === q.answer ? ' right' : '') +
    '" type="button" disabled aria-pressed="' + (i === a.pick) + '"' + (i === a.pick ? ' aria-label="Your answer: ' + esc(c) + '"' : '') + '>' + esc(c) + '</button>').join('') + '</div>';
  if (hide) return '<div class="dq answered">' + head + choices + '</div>';
  return '<div class="dq answered ' + (a.ok ? 'ok' : 'miss') + '">' + head + choices +
    '<p class="dq-result">' + (a.ok ? '✓ Right: ' : '✗ You picked “' + esc(q.choices[a.pick] || '') + '”. Right answer: ') + '<b>' + esc(q.choices[q.answer]) + '</b></p>' +
    '<p class="dq-why">' + esc(q.why) + ' <small>(' + esc(q.ref) + ')</small></p></div>';
}
const answerOf = (qid, lessonId) => (((ctx.drive.answers || {})[qid] || {})[lessonId]) || null;

function render() {
  const course = L.course(), d = ctx.drive || {};
  if (!live()) { $('today').innerHTML = '<p class="muted">Loading…</p>'; return; }
  if (pastDay) return renderPast(course, d);
  const now = new Date(), key = ymd(now), dow = (now.getDay() + 6) % 7;
  const st = lessonFor(course, d, key);
  if (!course.length) { $('today').innerHTML = '<h2>No lessons yet</h2><p class="note">The first week of lessons is on its way.</p>'; return; }
  if (st.status === 'finished') { $('today').innerHTML = course.length < (COURSE.PLANNED || 0) ? '<h2>More lessons coming</h2><p class="note">You’ve done every lesson so far. The next ones are being written; nothing is due until they’re approved.</p>' : '<h2>Course finished!</h2><p class="note">Every lesson done. Nice work.</p>'; return; }
  if (st.status === 'waiting') { $('today').innerHTML = '<h2>Next lesson: ' + esc(st.lesson.title) + '</h2><p class="note">Waiting for Mom or Dad to preview and approve it.</p>'; return; }
  if (st.status !== 'done' && dow > 4) { $('today').innerHTML = '<h2>See you Monday</h2><p class="note">Driving lessons are Monday to Friday.</p>'; return; }
  const lock = st.status === 'done' ? false : L.computerLock(ctx, 'eli', now);
  if (lock) { $('today').innerHTML = '<h2>' + esc(st.lesson.title) + '</h2><p class="lockmsg">' + (lock === 'owed' ? 'Finish the chore you missed earlier this week first (it’s at the top of your checklist).' : 'Do today’s chores first, then come back.') + '</p><a class="cklink" href="checklist.html?kid=eli">Open my checklist &rarr;</a>'; return; }
  // the baseline comes first: a lesson he hasn't begun waits until it's finished (so the baseline measures
  // what he knew before the course). A lesson already begun (watched or answered) carries on.
  const begun = (l) => !!(d.watched || {})[l.id] || Object.values(d.answers || {}).some((a) => a[l.id]);
  if (st.status === 'ready' && !begun(st.lesson) && baselineOpen(d, key)) { $('today').innerHTML = '<h2>' + esc(st.lesson.title) + '</h2><p class="note">First, take the baseline knowledge test above. Today’s lesson opens as soon as it’s done.</p>'; return; }
  // a skipped video: the lesson runs without it (straight to the questions)
  const lesson = st.lesson, noVideo = isSkipped((d.approved || {})[lesson.id]), watched = !!(d.watched || {})[lesson.id];
  // the quiz is built without today's answers, so it stays the same while he takes it
  const quiz = st.status === 'done' ? storedQuiz(course, lesson.id) : quizFor(course, st.index, d);
  // a unit test: no right/wrong until every question is answered, then the score and every answer
  const answered = quiz.filter((q) => answerOf(q.id, lesson.id)), allIn = quiz.length > 0 && answered.length === quiz.length;
  let h = '<p class="eyebrow">' + (lesson.review ? 'Unit test' : 'Today’s lesson') + '</p><h2>' + esc(lesson.title) + '</h2>';
  if (lesson.review) h += allIn ? '<p class="dt-score"><b>' + answered.filter((q) => answerOf(q.id, lesson.id).ok).length + ' of ' + quiz.length + '</b> right. Your answers and the right ones are below.</p>'
    : '<p class="note">No video today: ' + quiz.length + ' questions from this unit’s lessons. You’ll see your score and the answers at the end.</p><p class="dt-count">' + answered.length + ' of ' + quiz.length + ' answered</p>';
  // the key points show until the questions do (then they'd give the answers away)
  else if (watched) h += (noVideo ? '' : (lesson.videos || []).map(video).join('')) + '<p class="dv-done">✓ ' + (noVideo ? 'Key points read' : 'Watched') + '</p>';
  else if (noVideo) h += '<p class="note">No video for this one (Mom or Dad skipped it): read the key points, then the questions.</p>' + keyCard(lesson) + '<button class="tt-save" type="button" data-watched="' + esc(lesson.id) + '">I’ve read these</button>';
  else h += keyCard(lesson) + (lesson.videos || []).map(video).join('') + '<button class="tt-save" type="button" data-watched="' + esc(lesson.id) + '">I watched it</button>';
  if (watched || lesson.review) h += '<div class="dquiz"><h3>' + quiz.length + ' questions</h3>' + quiz.map((q) => questionHtml(q, answerOf(q.id, lesson.id), lesson.id, lesson.review && !allIn)).join('') + '</div>';
  if (st.status === 'done') h += '<p class="dv-done big">' + (lesson.review ? 'Unit test done ✓' : 'Lesson done for today ✓') + '</p>';
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

// The baseline (first sitting) is open and not finished yet.
function baselineOpen(d, key) {
  const s = openSittings(SITTINGS, d, key).find((x) => x.id === 'base');
  return !!s && !testScore(FORMS[s.form] || [], d, s.id, PASS).done;
}

// ---- knowledge tests: practice for the written permit test (outside the streak and game time) ----
// While he takes one, an answered question shows only his pick (no right/wrong), so later sittings measure
// what he knows, not what he remembers from this one. At the end: his score and how he did per topic.
function scoreHtml(s, sc) {
  return '<p class="dt-score"><b>' + sc.right + ' of ' + sc.total + '</b> (' + sc.pct + '%) · ' + (sc.passed ? 'at or above' : 'below') + ' the practice test’s ' + Math.round(PASS * 100) + '% pass mark</p>' +
    '<table class="histtable dt-topics"><tbody>' + sc.byTopic.map((t) => '<tr' + (t.right < t.total ? ' class="dt-weak"' : '') + '><td>' + esc(t.topic) + '</td><td><b>' + t.right + '</b>/' + t.total + '</td></tr>').join('') + '</tbody></table>';
}
function renderTests() {
  const el = $('tests');
  if (!live() || pastDay) { el.innerHTML = ''; el.hidden = true; return; }
  const d = ctx.drive || {}, now = new Date(), done = (st) => testScore(FORMS[st.form] || [], d, st.id, PASS).done;
  const open = openSittings(SITTINGS, d, ymd(now)).sort((a, b) => done(a) - done(b)); // an unfinished sitting first
  if (!open.length) { el.innerHTML = ''; el.hidden = true; return; }
  el.hidden = false;
  // an unfinished test comes first (the baseline is meant to be taken before the first lesson)
  const first = open.some((s) => !testScore(FORMS[s.form] || [], d, s.id, PASS).done);
  if (first !== (el.nextElementSibling === $('today'))) $('today').parentNode.insertBefore(el, first ? $('today') : $('today').nextSibling);
  let h = '<p class="eyebrow">Permit test practice</p>';
  open.forEach((s) => {
    const form = FORMS[s.form] || [], sc = testScore(form, d, s.id, PASS);
    h += '<h2>' + esc(s.title) + '</h2>';
    if (sc.done) { h += scoreHtml(s, sc); return; }
    const lock = L.computerLock(ctx, 'eli', now);
    if (lock) { h += '<p class="lockmsg">' + (lock === 'owed' ? 'Finish the chore you missed earlier this week first.' : 'Do today’s chores first, then come back.') + '</p>'; return; }
    if (testOpen !== s.id && !sc.answered) {
      h += '<p class="note">' + form.length + ' questions like Iowa’s written permit test, about 15 minutes. No video and no hints: answer what you know, and guess if you’re not sure. You’ll see your score and your strong and weak topics at the end.</p>' +
        '<button class="tt-save" type="button" data-tstart="' + esc(s.id) + '">Start the test</button>';
      return;
    }
    h += '<p class="dt-count">' + sc.answered + ' of ' + sc.total + ' answered</p><div class="dquiz">' + form.map((q, i) => {
      const a = answerOf(q.id, s.id), head = qHead(q, i + 1);
      // answered: the choices stay where they were (so nothing slides under his finger), his pick marked
      if (a) return '<div class="dq answered">' + head + '<div class="dq-choices">' + q.choices.map((c, ci) => '<button class="dq-choice' + (ci === a.pick ? ' picked' : '') + '" type="button" disabled aria-pressed="' + (ci === a.pick) + '"' + (ci === a.pick ? ' aria-label="Your answer: ' + esc(c) + '"' : '') + '>' + esc(c) + '</button>').join('') + '</div></div>';
      return '<div class="dq">' + head + '<div class="dq-choices">' + q.choices.map((c, ci) => '<button class="dq-choice" type="button" data-tpick="' + esc(q.id) + '|' + esc(s.id) + '|' + ci + '">' + esc(c) + '</button>').join('') + '</div></div>';
    }).join('') + '</div>';
  });
  el.innerHTML = h;
}

// ---- the weekly hazard ride (a family activity, not scored: no streak, no game time). A parent ticks it.
// Stored as rides/<the week's Monday> = the day it happened.
function renderRide() {
  if (!live()) { $('ride').innerHTML = ''; return; }
  const wk = ymd(mondayOf(new Date())), on = ((ctx.drive || {}).rides || {})[wk];
  $('ride').innerHTML = '<div class="rhead"><h2>Hazard ride</h2><span class="rcount">' + (on ? 'Done this week ✓' : 'Not yet this week') + '</span></div>' +
    '<p class="note">Family activity, once a week: a 10-minute ride with Eli in the passenger seat. He calls out every hazard he spots, out loud: a car backing out, a kid near the curb, brake lights ahead, a light about to change, a car waiting to pull out. Mom or Dad ticks it here.</p>' +
    (on ? '<p class="dv-done">✓ Done ' + esc(on) + '</p><button class="linkbtn" type="button" data-ride="undo">Undo</button>' : '<button class="tbtn approve" type="button" data-ride="done">Ride done (parent)</button>');
}

// ---- parent preview: upcoming lessons with their videos and answers (after the PIN) ----
function renderPreview() {
  if (!previewOpen) { $('preview').innerHTML = ''; return; }
  const course = L.course(), d = ctx.drive || {}, ap = d.approved || {};
  const upcoming = course.filter((l) => !l.review && !(d.done || {})[l.id]).slice(0, 10);
  $('preview').innerHTML = upcoming.length ? upcoming.map((l) => '<div class="dprev"><h3>' + esc(l.title) + ' <span class="rcount">' + (isApproved(ap[l.id]) ? 'Approved ✓' : isSkipped(ap[l.id]) ? 'Video skipped' : 'Not reviewed') + '</span></h3>' +
    keyCard(l) + (l.videos || []).map(video).join('') +
    '<ol class="dprev-q">' + (l.questions || []).map((q) => '<li>' + (q.sign ? signSvg(q.sign) + ' ' : '') + esc(q.q) + ' <b>' + esc(q.choices[q.answer]) + '</b> <small>(' + esc(q.ref) + ')</small></li>').join('') + '</ol>' +
    '<span class="exbtns"><button class="tbtn approve" data-approve="' + esc(l.id) + '|yes">Approve</button><button class="linkbtn" data-approve="' + esc(l.id) + '|skip">Skip the video</button>' +
    (ap[l.id] !== undefined ? '<button class="linkbtn" data-approve="' + esc(l.id) + '|undo">Undo</button>' : '') + '</span></div>').join('') : '<p class="muted">No upcoming lessons.</p>';
}

document.addEventListener('click', async (e) => {
  const w = e.target.closest('[data-watched]');
  if (w) { save(ID, 'watched/' + w.dataset.watched, ymd(new Date())); return; }
  const rb = e.target.closest('[data-ride]');
  if (rb) {
    if (!(await askParent())) return;
    save(ID, 'rides/' + ymd(mondayOf(new Date())), rb.dataset.ride === 'done' ? ymd(new Date()) : null);
    return;
  }
  const tp = e.target.closest('[data-tpick]');
  if (tp) {
    const [qid, sid, pick] = tp.dataset.tpick.split('|'), s = SITTINGS.find((x) => x.id === sid), q = s && (FORMS[s.form] || []).find((x) => x.id === qid);
    if (!q || answerOf(qid, sid)) return; // the first answer counts
    const n = Object.values(ctx.drive.answers || {}).filter((a) => a[sid]).length + 1;
    save(ID, 'answers/' + qid + '/' + sid, { ok: Number(pick) === q.answer, pick: Number(pick), on: ymd(new Date()), n });
    return;
  }
  const ts = e.target.closest('[data-tstart]');
  if (ts) { testOpen = ts.dataset.tstart; renderTests(); return; }
  const pk = e.target.closest('[data-pick]');
  if (pk) {
    const [qid, lessonId, pick] = pk.dataset.pick.split('|'), q = L.course().flatMap((l) => l.questions || []).find((x) => x.id === qid);
    if (!q || answerOf(qid, lessonId)) return; // the first answer counts
    const n = Object.values(ctx.drive.answers || {}).filter((a) => a[lessonId]).length + 1;
    // don't wait for the server: this page's copy already has the answer
    save(ID, 'answers/' + qid + '/' + lessonId, { ok: Number(pick) === q.answer, pick: Number(pick), on: ymd(new Date()), n });
    finishIfDone(lessonId);
    return;
  }
  const ap = e.target.closest('[data-approve]');
  if (ap) {
    const [lid, a] = ap.dataset.approve.split('|');
    // approval is stored as the day it was given (a lesson approved today is optional today, due from tomorrow)
    // approvals and skips are stored with the day they were given (past days are rebuilt from them);
    // approving an already-approved lesson keeps its first date
    if (!(await askParent())) return;
    const cur = ((ctx.drive || {}).approved || {})[lid], today = ymd(new Date());
    // switching between Approve and Skip keeps the FIRST date (it decides which past days the lesson was due)
    const first = typeof cur === 'string' ? (isSkipped(cur) ? cur.slice(5) : cur) : '';
    const when = /^\d{4}-\d{2}-\d{2}$/.test(first) ? first : today;
    if ((a === 'yes' && isApproved(cur)) || (a === 'skip' && isSkipped(cur))) return;
    save(ID, 'approved/' + lid, a === 'yes' ? when : a === 'skip' ? 'skip:' + when : null);
  }
});
$('previewbtn').onclick = async () => { if (await askParent()) { previewOpen = true; renderPreview(); } };

// Finished = watched (or a review) + all 5 answered; no pass mark.
function finishIfDone(lessonId) {
  const course = L.course(), d = ctx.drive || {}, key = ymd(new Date()), st = lessonFor(course, d, key);
  if (!st.lesson || st.lesson.id !== lessonId || st.status !== 'ready') return;
  const quiz = quizFor(course, st.index, d);
  const watched = st.lesson.review || isSkipped((d.approved || {})[lessonId]) || (d.watched || {})[lessonId];
  if (watched && quiz.length && quiz.every((q) => answerOf(q.id, lessonId))) save(ID, 'done/' + lessonId, key);
}

// The lock needs the chores (routines), the chore list (config) and the course progress.
const live = () => isLive('routines') && isLive(ID) && isLive('config');
// A lesson with every answer in but no "done" (the page closed right after the last tap): finish it,
// dated with its last answer's day.
function finishLeftovers() {
  if (!live()) return;
  const d = ctx.drive || {}, course = L.course();
  course.forEach((l) => {
    if ((d.done || {})[l.id] || !(l.review || isSkipped((d.approved || {})[l.id]) || (d.watched || {})[l.id])) return;
    const mine = Object.values(d.answers || {}).map((a) => a[l.id]).filter(Boolean);
    // a lesson needs its 5 answers; a unit test needs all of its questions answered
    const need = l.review ? quizFor(course, course.indexOf(l), d).length : 5;
    if (need && mine.length >= need) save(ID, 'done/' + l.id, mine.map((a) => a.on).sort().pop());
  });
}
const draw = () => { finishLeftovers(); render(); renderTests(); renderRide(); renderPreview(); };
watch(ID, (v) => { ctx.drive = v || {}; draw(); }, statusPill($('sync')));
watch('routines', (v) => { ctx.routines = v || {}; draw(); });
watch('config', (v) => { applyConfig(v); draw(); });
