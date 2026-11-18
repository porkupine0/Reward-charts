# Reward Charts improvement plan: progress

Work runs in scheduled sessions, one item at a time. Each item is tested, then reviewed and approved before the next one starts.
Browser tests live in tests/browser/ (run `python3 -m http.server 8765` from the repo, then `node tests/browser/full.js`).

## Decisions
- Late chores ("Finish first") can earn back that day's game time. No change.
- Monday and Tuesday of the week of Nov 16 count. Charts stay tied from Nov 16, and parents fill in those days on the checklists.
- Isaiah's prizes stay as they are: game time only.

## Remaining order
14, 16, 12, 13 (16 before 12: editable settings would rewrite past weeks without it).

## Tier 1: bugs
- [x] 3. Light-mode highlight colours restored (they pointed at themselves).
- [x] 1. Optional swim days (Nov 27, Dec 24, Jan 1) and Thanksgiving Thursday can't fill Eli's box.
- [x] 2. Eli's Saturday run is missing from his weekend checklist.
- [x] 7. After Eli's plan ends (Jan 25): a required "Running" item and chart row with nothing behind them.
- [x] 8. Small fixes: Parents "This week" counts tomorrow, the trials text says Thursday, and the "next" highlight is in the wrong section.
- [x] 6. The chore lock is too broad: lock only homework and screen tasks, show one message, and allow chores to be excused.

## Tier 2: parent workload
- [x] 9. A "Tonight" card on the Parents page: evening checks, today's excuses, tonight's late bedtime, and "All good" per boy.
- [x] 10. Isaiah's weekend checks: shown in Tonight (one tap).
- [x] 11. Parent unlock: parent phones stay unlocked, other devices for a short time.
- [x] 12. Settings: evening checks, game-time minutes, bedtime grace.

## Tier 3: data safety
- [x] 13. Database safety rules and a daily backup. Built and tested, **not applied** (see docs/database-safety.md).
- [x] 14. Clearing old logs keeps training history and what charts and streaks need.
- [x] 15. Offline saves: replay order and showing failed saves.
- [x] 16. Settings changes don't rewrite past days.

## Open for the family
- Eli's February weeks are a draft (existing sessions, volume kept flat): his coach should look them over.
- His paces are still November's everywhere (trial start paces, the 14:08 split): update after the Jan 16 mile and Jan 23 5K.
- Does swim stay Mon/Thu/Fri in February?
- The "Eli's time trials" calendar file now includes Feb 13 and Feb 27: re-add it on any phone that added it before.
- Apply the database rules (optional; steps in docs/database-safety.md).
- Add the BACKUP_KEY secret to turn on the daily encrypted backup (optional; same guide).
- Browser tests (tests/browser/) run by hand; they're not in CI yet. Tier 4 (code upkeep and extras) not started.
- Eli's training plan now runs to Feb 28, 2027 (Feb weeks are a draft from reused sessions, for his coach to look over). After that his run/swim row turns off.


- Missed-chore lock now: homework and screen tasks lock (Rhett's computer tasks; Eli's assignments and homework). For Isaiah, and for Eli on weekends, it's the Finish-first box plus held game time. One missed chore holds the game time of every school day from then until it's done or excused. A missed Saturday chore has no consequence on Sunday for Eli or Isaiah.
- Isaiah's weekend evening checks will show in the Tonight card (one "All good" tap).

- Tonight's excuse requests show both in Tonight and in "Waiting for your OK" (harmless duplicate).

- One-time switch in parent.js (LEGACY_UNTIL): phones unlocked the old way stay unlocked until Mon Nov 23, 2026, then ask once. Delete that code after November.

- Storage: two years of checklist days is about 0.9 MB (roughly 1.8 MB in phone storage, which is usually limited to about 5 MB per site). Fine for now; watch it if more is added to daily logs.
- "Clear checklist days over 2 years old" will find nothing to clear until late 2028.

- Adding or removing an evening check isn't a setting (only the wording is): it changes chart rows and perfect weeks, so it's a code change.

## Log
- Nov 18: browser tests and this plan moved into the repo. Item 3 done.
- Nov 18: items 1, 2 and 7 done. Eli's run/swim boxes follow his plan, his Saturday run is on his checklist, and a new test checks every chart box against the checklist.
- Nov 18: item 8 done. The "next" ring follows the time of day, Parents "This week" counts Monday to today, trials say Saturday, and Eli's box labels follow his plan.
- Nov 18: item 6 done. The lock is narrowed, the held game time is shown, and chores can be excused from the Finish-first box.
- Nov 18: items 9 and 10 done. The Parents page has a Tonight card (All good per boy, never overrides Not today, back six nights).
- Nov 18: item 11 done. A parent's phone stays unlocked (tick box); other devices unlock for 15 minutes; old unlocks last until Nov 23.
- Nov 18: item 15 done. Clearing drops queued writes beneath it; a quick correction is sent; pages share one queue. When the app is reopened after being offline, a change another phone made meanwhile wins and a notice shows (a page left open through an outage isn't covered). The pill can say "Saving…" or "Not saved, retrying".
- Nov 18: item 14 done. Cleanup keeps 2 years of checklist days (the streak look-back), never clears Eli's Training log, and backup and cleanup wait for fresh data.
- Nov 18: item 16 done. A settings change (chores, shower nights, lights out) applies from the day it's saved, today included; earlier days keep what they had. Save waits for the latest settings.
- Nov 18: item 12 done. Settings has game-time minutes per school day and bedtime grace (both apply from the day they're saved) and the wording of each boy's evening checks.
- Nov 18: item 13 built (not applied). Database rules allow only the app's own save paths (the browser tests enforce them), plus an encrypted daily backup that does nothing until a key is set.
- Nov 18: the missed-chore lock counts from Monday Nov 16 (decided); training text fixed: Plyometrics and Core A on Wednesday, Strength B lifts only on Thursday.
- Nov 18: Eli's plan extended through Feb 28 (draft): recovery week, build week, then copies of the January weeks with a Feb 13 mile and Feb 27 final 5K.
