# Reward Charts improvement plan: progress

(Moved into the repo so it survives between sessions. Browser tests: tests/browser/.)

Started 2026-11-18. The work runs in scheduled sessions: the first is 2 hours after this was written, then every 5 hours. Each item is verified, the advisor approves it, and only then does work move on.

## Decisions from Erik
- Late chores ("Finish first") CAN earn back that day's game time. No change.
- Monday and Tuesday of the week of Nov 16 count. TIED_FROM stays at Nov 16, and parents fill in those days on the checklists.
- Isaiah's prizes stay as they are: game time only.

## Tier 1: bugs
- [ ] 1. Optional swim days (Nov 27, Dec 24, Jan 1) can't fill Eli's Swim box. Also Thanksgiving Thursday.
- [ ] 2. Eli's Saturday run is missing from his weekend checklist.
- [ ] 3. Light-mode `--tint` and `--tint-good` point at themselves (style.css:10-11).
- [ ] 6. The chore lock is too broad: lock only homework and screen tasks, show one message, and allow chores to be excused.
- [ ] 7. After Eli's plan ends (Jan 25), there's an endless required "Running" item, and the chart row stays.
- [ ] 8. Parents "This week" counts tomorrow; trials text still says Thursday; the "next" highlight is in the wrong section.

## Tier 2: parent workload
- [ ] 9. A "Tonight" card on the Parents page: evening checks, today's excuses, tonight's late bedtime, and "All good" per boy.
- [ ] 10. Isaiah's weekend evening checks. Keep or drop? Prizes stay as is, so they earn nothing. Ask the advisor.
- [ ] 11. The PIN stays unlocked forever on any phone. Add a "parent phone" option, otherwise unlock for 15 minutes.
- [ ] 12. Settings: evening checks, game-time minutes, bedtime grace, Isaiah section.

## Tier 3: data protection
- [ ] 13. Firebase rules file in the repo (no whole-chart deletes) plus a daily backup GitHub Action.
- [ ] 14. Prune must keep eli-run logs and the data that charts and streaks need.
- [ ] 15. Offline queue: clearing a parent path should drop queued child writes; show failed saves; protect against stale replays.
- [ ] 16. Settings changes should not rewrite past days (snapshot by date).

## Log
