// Streaks and celebrations.
import { addDays, mondayOf, ymd } from './store.js?v=1794452868';
import * as L from './lists.js?v=1794452868';
import { weekProgress } from './charts.js?v=1794452868';

// A "full day": every required after-school/weekend and bedtime item done.
export function dayFull(ctx, kid, date) {
  const ls = L.lists(ctx, kid, date);
  const d = L.progress(ctx, kid, date, ls.day), b = L.progress(ctx, kid, date, ls.bed);
  return d.req.length + b.req.length > 0 && !d.left.length && !b.left.length;
}
// Full days in a row, counting back from today (today counts once it's full; an unfinished today doesn't break it).
export function dayStreak(ctx, kid, today) {
  let n = 0, d = dayFull(ctx, kid, today) ? today : addDays(today, -1);
  while (n < 365 && dayFull(ctx, kid, d)) { n++; d = addDays(d, -1); }
  return n;
}
// Perfect weeks in a row, counting back from this week (an unfinished week doesn't break it).
export function weekStreak(chart, data, ctx, today) {
  const perfect = (mon) => weekProgress(chart, L.effectiveWeek(chart, mon, ((data || {}).weeks || {})[ymd(mon)], ctx)).perfect;
  let n = 0, mon = mondayOf(today);
  if (!perfect(mon)) mon = addDays(mon, -7);
  while (n < 104 && perfect(mon)) { n++; mon = addDays(mon, -7); }
  return n;
}

// A short burst of confetti and a message. Skipped (message only) for reduced motion.
export function celebrate(msg) {
  const toast = document.createElement('div');
  toast.className = 'celebrate';
  toast.setAttribute('role', 'status');
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas');
  c.className = 'confetti';
  c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio;
  document.body.appendChild(c);
  const g = c.getContext('2d'), colors = ['#C2501C', '#1D6FB8', '#1d6b38', '#E8B21C', '#9CCBF5'];
  const bits = Array.from({ length: 90 }, () => ({
    x: c.width / 2, y: c.height * 0.35, vx: (Math.random() - 0.5) * 16 * devicePixelRatio, vy: (-Math.random() * 14 - 4) * devicePixelRatio,
    s: (5 + Math.random() * 5) * devicePixelRatio, r: Math.random() * 6, col: colors[Math.floor(Math.random() * colors.length)]
  }));
  const t0 = performance.now();
  (function frame(t) {
    g.clearRect(0, 0, c.width, c.height);
    bits.forEach((b) => { b.vy += 0.5 * devicePixelRatio; b.x += b.vx; b.y += b.vy; b.r += 0.2; g.save(); g.translate(b.x, b.y); g.rotate(b.r); g.fillStyle = b.col; g.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2); g.restore(); });
    if (t - t0 < 1800) requestAnimationFrame(frame); else c.remove();
  })(t0);
}

// Celebrate once when something flips from not-done to done after a tap on this phone.
const seen = {};
let lastTap = 0;
if (typeof document !== 'undefined') document.addEventListener('click', () => { lastTap = Date.now(); }, true);
export function cheerIf(key, done, msg) {
  const was = seen[key];
  seen[key] = done;
  if (done && was === false && Date.now() - lastTap < 4000) celebrate(msg);
}
