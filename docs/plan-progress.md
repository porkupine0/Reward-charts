# Reward Charts improvement plan: progress

Work runs in scheduled sessions, one item at a time. Each item is tested, then reviewed and approved before the next one starts.
Browser tests live in tests/browser/: `node tests/browser/run.mjs` runs them all (GitHub runs them on every push too).

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

## Tier 4: upkeep and extras
- [x] 17. Browser tests in CI (separate job; one fixed "now"; checked with the clock four months ahead).
- [x] 19 + 20. Readability (contrast measured on every page, light and dark), 44px tap areas, chart labels that fit, game card "not earned" with reasons, "Other…" minutes.
- [ ] 18. Each chart row says where its data comes from.

## Driving course build (asked Nov 18; Iowa; parent previews videos; lessons outside game time)
Each step needs advisor approval before the next. Check-ins at 10:31 am and 3:31 pm Central resume from here.
- [x] 0. Iowa driver's manual: fetch and read it; every age, rule and quiz answer comes from its text.
- [x] 1. Eli's computer work (typing, and the driving lesson) locked until today's chores are done.
- [x] 2. Leftover game time: a parent check on the Parents page each week ("Add N min to this week?").
- [x] 3. Course logic (no page yet): lessons in order, one new a day, quiz = 3 today + 2 earlier (missed first), every 5th lesson a review.
- [x] 4a. Wiring, no page: one lock helper (today's chores done and none owed), Open link hidden on locked rows, checklist row (today if a lesson is ready; past dates a lesson was finished; Mon–Fri; outside all scoring), database rules.
- [x] 4b. Driving page and parent preview (course file ships empty; browser tests use a fixture course): checklist row Mon–Fri outside all scoring, locks like computer work, video + Watched, parent Approve/Skip per lesson.
- [x] 4c. Streak: approval date stored; a lesson approved before a weekday is due that day (required for streak/full day, not game time).
- [x] 5. Week 1 content: verified videos, questions from the Iowa manual with page references.
- [x] 6. Baseline knowledge test (Form A, 25 questions, weighted like Iowa DOT's practice test; score and topics on the Driving and Parents pages; outside streak and game time).
- [x] 7. 13-week plan with 67 videos picked (docs/driving-syllabus.md).
- [x] 7b. Recut the plan to 55 lesson days (merge units 10 and 11; one final week).
- [x] 8. Unit test: every 5th lesson; 4 questions from each finished lesson of its unit (never-asked, then missed, then least recent); answers hidden until all are in, then score + answers; finishes only when all are answered; score on the Parents page. w1d5 is now the Unit 1 test (2 questions appended to each unit 1 lesson). The daily quiz keeps its choices in place too.
- [x] 8b. "Not able to do it?" on the driving row (even while it is chore-locked); a parent approves on the Parents page (or on Eli's checklist: tap it, then Approve with the PIN, no need for Eli to ask first). The excused day counts; the same lesson is due the next school day. Unit tests whose lessons were all skipped are passed over. Checklist row says "Driving: unit test" on the unit test day; "More lessons coming" when he catches up with what is written.
- [ ] 9b. Weekly hazard ride (approved Nov 18): once a week, a 10-minute ride with Eli as passenger calling out hazards; a parent ticks it on the Driving page (outside game time). Put it on the plan's quietest lesson day each week.
- [x] 9. Skip skips only the video (the lesson runs with its quiz). Key points card above each video: each point quotes the manual (checked by the quote test) or is marked fam() = family rule; checkCourse requires 2+ per lesson. Unit 1 has 3 per lesson.
- [x] 10. (DONE Nov 18: signs.js draws 9 blank shapes, checked against the manual pictures pp. 6-7, 11; a question gets sign: { shape, color }; both checkers validate it; one qHead renderer for lessons, unit tests, knowledge tests and the preview; labels describe the drawing only) Sign shapes drawn in the quiz (needed for unit 2 and Form B).
- [ ] 11. **Deadline: on main by Saturday Nov 21** (so a parent can preview and approve it before Wed Nov 25, the earliest he could need it; sign shapes, step 10, come first). Week 2 content (unit 2: signs and signals), questions ~6 per lesson. Re-run scripts/check-videos.mjs first.
- [ ] 12. Progress tests: a new form each sitting (B after unit 2, C after 4, D after 6, E after 8, F = final). Hand-written, one ahead of each sitting, same blueprint and same count of number questions as Form A, no lesson question's wording. Form B due when unit 2's test is done (about the first week of December).

Driving storage (chart `eli-drive`): `approved/<lesson>` = true | 'skip', `done/<lesson>` = date, `watched/<lesson>` = date, `answers/<question>/<lesson>` = { ok, on } (first answer counts). Leftover game time: routines `carry/<kid>/<from monday>` = { minutes, add }.
Decided Nov 18 (afternoon): lessons 1 and 2 approved, Eli hasn't started; a DIFFERENT knowledge test every sitting (baseline, progress tests, final: Forms A-F, all new questions, rules may come back in new situations); permit test in about 3 months (mid-February 2027), so the course is cut to 55 lesson days (66 weekdays from Nov 19 to Feb 18). w1d5 becomes unit 1's test (nothing finished yet). A lesson he hasn't begun waits on the Driving page until the baseline is done.
Decided Nov 18: only Eli's typing and driving wait for today's chores (assignments and homework don't; homework still locks when an earlier day's chore is owed). The driving lesson counts toward his daily streak, not game time.

## Open for the family
- Leftover game time: should it expire at the end of the weekend or carry over? (It stays on that week's chart now.)
- Chart boxes can't reach 44px at seven columns on a phone.
- Eli's February weeks are a draft (existing sessions, volume kept flat): his coach should look them over.
- His paces are still November's everywhere (trial start paces, the 14:08 split): update after the Jan 16 mile and Jan 23 5K.
- Does swim stay Mon/Thu/Fri in February?
- The "Eli's time trials" calendar file now includes Feb 13 and Feb 27: re-add it on any phone that added it before.
- Apply the database rules (optional; steps in docs/database-safety.md).
- Add the BACKUP_KEY secret to turn on the daily encrypted backup (optional; same guide).
- Eli's training plan now runs to Feb 28, 2027 (Feb weeks are a draft from reused sessions, for his coach to look over). After that his run/swim row turns off.


- Missed-chore lock now: homework and screen tasks lock (Rhett's computer tasks; Eli's assignments and homework). For Isaiah, and for Eli on weekends, it's the Finish-first box plus held game time. One missed chore holds the game time of every school day from then until it's done or excused. A missed Saturday chore costs no game time on Sunday for Eli or Isaiah; Eli's computer work (including the knowledge test) still waits for it, like any missed chore.
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
- Nov 18: item 17 done. GitHub runs the browser tests on every push as their own job (a deliberately broken check turned it red; reverted).
- Nov 18: items 19 and 20 done. Every page passes contrast in light and dark; small links are 44px tall (Isaiah's checklist grew 90px); the game card says "not earned" with the reason.
- Nov 18: driving steps 0 and 1 done. Iowa manual saved (docs/iowa/); Eli's typing waits for today's chores.
- Nov 18: driving steps 2 and 3 done. Leftover game time asks once per boy (No lets it go); course rules tested with fixtures.
- Nov 18: driving step 4a done. Checklist row wired (empty course, so nothing shows yet); computer work, including the driving row, goes through one lock.
- Nov 18: driving step 4b done. The Driving page, parent preview (Approve/Skip after the PIN), hub card (hidden while the course is empty) and the Parents "N of the next 2 lessons approved" line. A lesson is finished once he has watched and answered five; no pass mark.
- Nov 18: driving step 4c done. The lesson counts toward Eli's full day and streak (not game time) on days it was due; approvals and skips carry their date so past days don't change; Parents, Home and History all agree.
- Nov 18: driving step 5 done. Week 1 (scanning, following distance, blind spots and mirrors, intersections, review): 20 questions, each quoting its Iowa manual page (tested); 5 videos confirmed by title and channel. Next: week 2, signs and markings (manual pp. 6-17), as its own step.
- Nov 18: driving steps 6 and 7. Baseline knowledge test live (take it before lesson 1); 13-week plan with 67 videos (13 Iowa DOT or Iowa). Next: steps 8-10 (code) before week 2, since the course file is append-only.
- Nov 18: a lesson he hasn't begun waits until the baseline is done (lesson 2's first question is close to a baseline question).
- Nov 18: family answers: weekly hazard ride yes; a weekly check-in writes the next unit and lists the videos to preview (Saturdays); permit knowledge test probably at home (parent-proctored: apply 7-14 days ahead, computer not phone/tablet, link expires 72 h, then a DMV appointment for the permit).
- Nov 18: step 8 done (unit tests).
- Nov 18: step 8b done (lesson excuses for holidays).
- Nov 18: a skip now skips only the video.
- Nov 18: step 9 done (Key points cards). Next: step 10 sign shapes, then unit 2 by Sat Nov 21.
- Nov 18: Approve/Skip switches keep the first date; the key points hide once the questions show (a skipped video: read the key points, tap I've read these, then the questions). NEXT: step 10 sign shapes (optional sign: {shape, color} on a question; blank shapes; verify against manual pp. 6-7 pictures; one shared question renderer; label describes the drawing, not its meaning; leave Form A alone), then unit 2 by Sat Nov 21.
- Nov 18: step 10 done (sign shapes). Next: unit 2 content by Sat Nov 21.
- Nov 18: unit 2 lesson 1 (w2d1, sign colors and shapes, 8 questions with sign shapes) written. Next: w2d2 (stop vs yield, regulatory signs, p. 8 from the page picture), w2d3, w2d4, then the unit 2 test entry (w2d5, review: true).
- Nov 18: w2d2 (stop, yield, regulatory signs incl. Do Not Enter, Wrong Way, Keep Right; 9 questions) written. Next: w2d3 (warning, guide, service, route, slow-moving signs: pp. 9-11 from the page pictures; include Merging Traffic), w2d4, then w2d5 unit test entry.
- Nov 18: w2d3 (warning, guide, slow-moving signs, pedestrian conveyances; 9 questions) written. Next: w2d4 (signals, flashing arrows, pedestrian beacons: p. 11 picture + p. 18), then w2d5 = Unit 2 test (review: true).
