// Each kid's page: what's left right now, then their checklist, chart, training and month.
// Brother tabs at the top so the shared iPad can switch quickly.
import { watch, ymd, mondayOf, addDays, esc, statusPill } from './store.js?v=1795213538';
import { KIDS, timerResult, applyConfig } from './routines.js?v=1795213538';
import { CHARTS, weekProgress } from './charts.js?v=1795213538';
import { planFor } from './plan.js?v=1795213538';
import * as L from './lists.js?v=1795213538';
import { score, fmt, nextMilestone } from './trials.js?v=1795213538';
import { dayStreak } from './streaks.js?v=1795213538';
import { lessonFor } from './driving.js?v=1795213538';
import { nowHtml } from './nowview.js?v=1795213538';

const $ = (id) => document.getElementById(id);
const ctx = { routines: {}, run: {}, isaiah: {}, drive: {} };
const charts = { eli: {}, trombone: {}, zay: {} };
let trials = {};
const remembered = () => { try { return localStorage.getItem('rc:lastKid'); } catch (e) { return null; } };
let kid = new URLSearchParams(location.search).get('kid') || remembered() || 'eli';
if (!KIDS[kid]) kid = 'eli';

const card = (href, icon, title, sub, prog) => '<a class="homecard" href="' + href + '"><img src="icons/' + icon + '.png" alt="">' +
  '<div><strong>' + esc(title) + '</strong><small>' + esc(sub) + '</small></div>' + (prog ? '<span class="hc-prog">' + esc(prog) + '</span>' : '') + '</a>';

function render() {
  const k = KIDS[kid], now = new Date(), mon = mondayOf(now);
  try { localStorage.setItem('rc:lastKid', kid); } catch (e) {}
  history.replaceState(null, '', '?kid=' + kid);
  document.body.style.setProperty('--accent', k.accent);
  document.title = k.name + ' · Reward Charts';
  $('kidtabs').innerHTML = Object.entries(KIDS).map(([id, x]) => '<a href="kid.html?kid=' + id + '" class="tablink" data-kid="' + id + '"' + (id === kid ? ' aria-current="page"' : '') + ' style="--accent:' + x.accent + '">' + esc(x.name) + '</a>').join('');
  const streak = dayStreak(ctx, kid, now);
  $('eyebrow').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) + (streak >= 2 ? ' · ' + streak + '-day streak' : '');
  $('name').textContent = k.name;

  // Right now
  $('now').href = 'checklist.html?kid=' + kid;
  $('now').innerHTML = nowHtml(L.nowStatus(ctx, kid, now), 6) + '<span class="now-go">Open my checklist &rarr;</span>';

  // Everything else
  const links = [];
  const yd = addDays(now, -1), c = L.dayChecks(ctx, kid, yd), r = timerResult(kid, yd, c.bedTimer, c);
  if (kid === 'eli') {
    const p = weekProgress(CHARTS.eli, L.effectiveWeek(CHARTS.eli, mon, (charts.eli.weeks || {})[ymd(mon)], ctx));
    const g = L.gameWeek(ctx, 'eli', mon);
    links.push(card('eli.html', 'eli', 'Reward chart', 'Weekend game time · Run or swim · Chores · School', 'Game time: ' + g.minutes + ' of ' + g.max + ' min' + (L.GAME.days.includes(L.dowOf(now)) && !L.gameDay(ctx, 'eli', now).earned ? ' · today not yet' : '')));
    const pl = planFor(now), sc = score(trials), nx = nextMilestone('mile', sc), n5 = nextMilestone('5k', sc);
    links.push(card('run.html', 'run', 'Training', 'Today’s run · Time trials · History', pl ? 'Today: ' + pl.title + (L.eliRunDone(ctx.run, now) ? ' · done!' : '') : 'Plan finished'));
    // Driving: ready, done, waiting for approval, or locked until chores
    const course = L.course(), st = lessonFor(course, ctx.drive, ymd(now)), lock = L.computerLock(ctx, 'eli', now);
    const baseFirst = st.status === 'ready' && L.baselineBy(ctx.drive || {}, ymd(now)) === 'open';
    const dtext = !course.length ? 'No lessons yet' : baseFirst ? 'Baseline test first, then today’s lesson' : st.status === 'done' ? 'Today’s lesson done ✓' : st.status === 'finished' ? 'Course finished' : st.status === 'waiting' ? 'Next lesson waiting for Mom or Dad' : L.dowOf(now) > 4 ? 'Next lesson Monday' : lock ? 'Today’s lesson: chores first' : 'Today’s lesson is ready';
    if (course.length) links.push(card('drive.html', 'run', 'Driving', 'A lesson a weekday; unit test every 5th', dtext));
    links.push(card('trials.html', 'trials', 'Time trials', 'Milestones · Prizes', (nx ? 'Next mile: under ' + fmt(nx[0]) : 'Mile done') + ' · ' + (n5 ? '5K: under ' + fmt(n5[0]) : '5K done')));
  }
  if (kid === 'rhett') {
    const p = weekProgress(CHARTS.trombone, L.effectiveWeek(CHARTS.trombone, mon, (charts.trombone.weeks || {})[ymd(mon)], ctx));
    const g = L.gameWeek(ctx, 'rhett', mon);
    links.push(card('trombone.html', 'trombone', 'Reward chart', 'Weekend game time · Move · Chores · Typing · Trombone', (p.perfect ? 'Perfect week!' : p.done + '/' + p.need + ' this week') + ' · game time ' + g.minutes + ' min'));
  }
  if (kid === 'isaiah') {
    const g = L.gameWeek(ctx, 'isaiah', mon);
    links.push(card('zay.html', 'isaiah', 'Reward chart', 'Weekend game time · Soccer · Chores · Evening checks', 'Game time: ' + g.minutes + ' of ' + g.max + ' min' + (L.GAME.days.includes(L.dowOf(now)) && !L.gameDay(ctx, 'isaiah', now).earned ? ' · today not yet' : '')));
    const iz = ctx.isaiah, start = (iz.start && new Date(iz.start + 'T00:00')) || mon;
    let full = 0; for (let i = 0; i < 28; i++) if (L.touchedOn(iz, ymd(addDays(start, i)))) full++;
    links.push(card('isaiah.html', 'isaiah', 'Ball Master', '600 touches · Juggling levels', full + '/28 days · ' + Object.keys(iz.juggle || {}).length + '/10 levels'));
  }
  const rw = L.readingWeek(ctx, kid, mon, now);
  links.push(card('history.html?kid=' + kid, 'history', 'My month', 'Every day at a glance · reading', 'Reading this week: ' + rw.read + ' of ' + rw.nights + ' nights' + (rw.excused ? ' (' + rw.excused + ' excused)' : '')));
  links.push(card('stats.html', 'stats', 'Bedtime', 'Timer results · On-time nights', r ? 'Last night: ' + (r.onTime ? 'on time' : 'late by ' + r.lateBy + ' min') : ''));
  $('links').innerHTML = links.join('');
}

render();
setInterval(render, 60000); // the time of day moves on
watch('routines', (d) => { ctx.routines = d; render(); }, statusPill($('sync')));
watch('eli-run', (d) => { ctx.run = d; render(); });
watch('isaiah', (d) => { ctx.isaiah = d; render(); });
watch('eli-drive', (d) => { ctx.drive = d || {}; render(); });
watch('eli', (d) => { charts.eli = d; render(); });
watch('trombone', (d) => { charts.trombone = d; render(); });
watch('zay', (d) => { charts.zay = d; render(); });
watch('eli-trials', (d) => { trials = d; render(); });
watch('config', (d) => { applyConfig(d); render(); });
