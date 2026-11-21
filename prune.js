// "Clear old daily logs" (Parents page): which daily checklist logs are old enough to remove.
// Charts, streaks and game time are worked out from these logs, so they're kept as far back as anything
// looks: the perfect-week streak counts back up to 104 weeks (streaks.js). Eli's Training log is never
// cleared (his run history). Only checklist days (routines/days) older than that are listed.
import { ymd, addDays, mondayOf } from './store.js?v=1795245038';

export const KEEP_WEEKS = 105; // 104 weeks of streak, plus this week

export function pruneCutoff(today) { return ymd(addDays(mondayOf(today), -7 * KEEP_WEEKS)); }

// [chartId, path] pairs to remove, oldest first.
export function pruneList(D, today) {
  const cut = pruneCutoff(today);
  return Object.keys(((D.routines || {}).days) || {}).filter((k) => k < cut).sort().map((k) => ['routines', 'days/' + k]);
}
