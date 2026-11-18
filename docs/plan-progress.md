# Reward Charts improvement plan: progress

Work runs in scheduled sessions, one item at a time. Each item is tested, then reviewed and approved before the next one starts.
Browser tests live in tests/browser/ (run `python3 -m http.server 8765` from the repo, then `node tests/browser/full.js`).

## Decisions
- Late chores ("Finish first") can earn back that day's game time. No change.
- Monday and Tuesday of the week of Nov 16 count. Charts stay tied from Nov 16, and parents fill in those days on the checklists.
- Isaiah's prizes stay as they are: game time only.

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
- [ ] 12. Settings: evening checks, game-time minutes, bedtime grace.

## Tier 3: data safety
- [ ] 13. Database safety rules and a daily backup.
- [ ] 14. Clearing old logs keeps training history and what charts and streaks need.
- [ ] 15. Offline saves: replay order and showing failed saves.
- [ ] 16. Settings changes don't rewrite past days.

## Open for the family
- Eli's training plan ends Jan 24, 2027. After that his run/swim row is off and there's no Running item, so a new plan is needed.
- Should the missed-chore lock also count Monday and Tuesday of the week of Nov 16? (It currently starts Nov 18.)

- Training text still names old days (needs a coach's call, not changed): Plyometrics says Tuesday (now Wednesday), Core A says "Mon, Wed (+ optional Fri)" (Monday is swim now), and the Strength B note mentions jumps on "interval Thursdays" (Thursday is lifts only now).

- Missed-chore lock now: homework and screen tasks lock (Rhett's computer tasks; Eli's assignments and homework). For Isaiah, and for Eli on weekends, it's the Finish-first box plus held game time. One missed chore holds the game time of every school day from then until it's done or excused. A missed Saturday chore has no consequence on Sunday for Eli or Isaiah.
- Isaiah's weekend evening checks will show in the Tonight card (one "All good" tap).

- Tonight's excuse requests show both in Tonight and in "Waiting for your OK" (harmless duplicate).

- One-time switch in parent.js (LEGACY_UNTIL): phones unlocked the old way stay unlocked until Mon Nov 23, 2026, then ask once. Delete that code after November.

## Log
- Nov 18: browser tests and this plan moved into the repo. Item 3 done.
- Nov 18: items 1, 2 and 7 done. Eli's run/swim boxes follow his plan, his Saturday run is on his checklist, and a new test checks every chart box against the checklist.
- Nov 18: item 8 done. The "next" ring follows the time of day, Parents "This week" counts Monday to today, trials say Saturday, and Eli's box labels follow his plan.
- Nov 18: item 6 done. The lock is narrowed, the held game time is shown, and chores can be excused from the Finish-first box.
- Nov 18: items 9 and 10 done. The Parents page has a Tonight card (All good per boy, never overrides Not today, back six nights).
- Nov 18: item 11 done. A parent's phone stays unlocked (tick box); other devices unlock for 15 minutes; old unlocks last until Nov 23.
