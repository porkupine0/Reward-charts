# Reward Charts improvement plan: progress

Work runs in scheduled sessions, one item at a time. Each item is tested, then reviewed and approved before the next one starts.
Browser tests live in tests/browser/: `node tests/browser/run.mjs` runs them all (GitHub runs them on every push too).

## Decisions
- Nov 25 (parent): Claude sessions publish finished, tested changes straight to `main` (live on the boys' phones) without asking first. Tell the parent what changed afterward.
- Nov 24: grounding from electronics is set by parents on the Parents page (routines grounded/<kid>/<day>; today counts as day one). A grounded day earns no game time; while grounded, game time is on hold (kept, not usable). Use this for lost video-game time; don't add GAME_OFF weeks in code (Eli's Nov 23-29 week stays there and counts as grounded days).
- Nov 24: the school calendar (routines.js NO_SCHOOL, isSchoolDay) decides school days. A weekday off is like a Saturday for school things: no school items (backpack, assignments, homework), Saturday mornings (Eli's Ritalin, Isaiah's Saturday list), later bedtime the night before, no show-choir alarm, School row off. Game time is still earned. Add next year's dates there; don't hardcode days off anywhere else.
- Nov 19: the advisor sets the order of work (the parent said so). Don't ask the parent about order; the check-ins follow "Next steps" below.
- Late chores ("Finish first") can earn back that day's game time. No change.
- Monday and Tuesday of the week of Nov 16 count. Charts stay tied from Nov 16, and parents fill in those days on the checklists.
- Isaiah's prizes stay as they are: game time only.

## Remaining order
14, 16, 12, 13 (16 before 12: editable settings would rewrite past weeks without it).

## To do from reviews
- [ ] Nov 25 code review, driving (nightly sessions): (1) testScore/testDoneOn now need watched/<sitting>; a sitting fully answered before the Finish change (Nov 21, 17:03 UTC) would read as open. The baseline was taken after it, so probably fine; confirm the live data has watched/base, or count fully answered sittings from before that time as done. (2) unitTestFor can take more than BACKLOG (4) earlier-unit questions when a finished lesson has fewer than PER_LESSON questions; count the backlog questions separately.

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
- [x] 11b. Answer choices no longer give the answer away (Nov 19): unseen lessons reordered and wrong choices rewritten; live w1d1/w1d2 only reworded (positions unchanged). Right answer length rank across 67 questions: longest 11, 2nd 36, 3rd 18, shortest 2. checkCourse now enforces per lesson: positions spread, right answer rarely the longest, no single length rank over 60%. Added flashing red/yellow (w2d4q10-11), yellow diamond and round sign (w2d1q9-10); w2d3q2 reworded. Route signs (2.8) still have no question.
- [x] 9b. Weekly hazard ride (Nov 19): a card on the Driving page (family activity, what to call out); a parent ticks it with the PIN (any day; Undo); stored as eli-drive rides/<Monday> = the day (database rule added); not scored (no checklist row, streak or game time); the Parents page shows this week done / not yet.
- [x] 9. Skip skips only the video (the lesson runs with its quiz). Key points card above each video: each point quotes the manual (checked by the quote test) or is marked fam() = family rule; checkCourse requires 2+ per lesson. Unit 1 has 3 per lesson.
- [x] 10. (DONE Nov 18: signs.js draws 9 blank shapes, checked against the manual pictures pp. 6-7, 11; a question gets sign: { shape, color }; both checkers validate it; one qHead renderer for lessons, unit tests, knowledge tests and the preview; labels describe the drawing only) Sign shapes drawn in the quiz (needed for unit 2 and Form B).
- [x] 11. (DONE Nov 19: unit 2 = w2d1-w2d4 + w2d5 Unit 2 test; 35 questions, 12 with drawn sign shapes, plus Do Not Enter, Wrong Way and Keep Right described in words; parent to preview and approve) **Deadline: on main by Saturday Nov 21** (so a parent can preview and approve it before Wed Nov 25, the earliest he could need it; sign shapes, step 10, come first). Week 2 content (unit 2: signs and signals), questions ~6 per lesson. Re-run scripts/check-videos.mjs first.
- [ ] 12. Progress tests: (Form B DONE Nov 19: progress test 1, opens after w2d5; 25 new questions, 9 number questions, 4 drawn signs, facts read off the page pictures; checkTests now rejects a stem shared with a lesson or another form and checks the number-question count.) Still to write, one ahead of each sitting: C after unit 4, D after 6, E after 8, F = final. **Supply:** school buses + emergency vehicles + Move Over have about 17 distinct manual rules and need 4 per form x 6 forms = 24, so forms D-F must reuse rules in new situations (change the scenario or ask it the other way round). Permit rules (docs/iowa/gdl-*.txt) cannot be cited by the checker yet (manual pages only): extend the ref check before unit 10.

Driving storage (chart `eli-drive`): `approved/<lesson>` = true | 'skip', `done/<lesson>` = date, `watched/<lesson>` = date, `answers/<question>/<lesson>` = { ok, on } (first answer counts). Leftover game time: routines `carry/<kid>/<from monday>` = { minutes, add }.
Decided Nov 18 (afternoon): lessons 1 and 2 approved, Eli hasn't started; a DIFFERENT knowledge test every sitting (baseline, progress tests, final: Forms A-F, all new questions, rules may come back in new situations); permit test in about 3 months (mid-February 2027), so the course is cut to 55 lesson days (66 weekdays from Nov 19 to Feb 18). w1d5 becomes unit 1's test (nothing finished yet). A lesson he hasn't begun waits on the Driving page until the baseline is done.
Decided Nov 18: only Eli's typing and driving wait for today's chores (assignments and homework don't; homework still locks when an earlier day's chore is owed). The driving lesson counts toward his daily streak, not game time.

## Two-week completion plan (Nov 21 - Dec 14, 2026; the parent asked Nov 20; the advisor set the order)
A nightly check-in fires about 12:47 am Central into this session. Each night: read this file; FIRST finish any unfinished night; call the advisor before starting and for sign-off; work until tokens run out (the next night resumes). "The app" = all of Reward Charts; building = the driving course; reviews cover the whole app, deepest on what changed since the last full review.

| Night | Work | Done |
|---|---|---|
| Sat Nov 21 | Foundations: Form C groundwork (number facts first; supply vs demand per topic; reservation table for Forms C-F), shared-QUOTE report in checkTests (report, don't reject), let the checker cite docs/iowa/gdl-*.txt (Iowa DOT permit pages), commit a script that re-fetches Iowa DOT's 68 practice stems WITHOUT the answer codes | [x] (the DOT stems: done Nov 21 after the parent allowed it; docs/iowa/dot-practice-stems.txt) |
| Sun Nov 22 | FIRST (before any overrun from earlier nights; lessons 1-2 freeze Mon Nov 23): reword-only fixes in w1d1/w1d2 (wrong choices only; treat w1d1 as possibly seen, since it opens right after the baseline). Then: reword w1d1q5 wrong choices (Mile markers is backed by p. 11; Billboards was called silly); the remaining mild flags in lessons 1-2 (docs/reviews/2026-11-20-blind-check-1.md and -2.md); the code review low items (docs/reviews/2026-11-20-code-review-days-1-2.md). Early checks: (1) tag all 44 planned lesson days beginner / intermediate / advanced (write the definition into the syllabus; units 5-10 can still be reordered); (2) a cold independent reviewer on units 1-4 + Forms A-B under the same brief as the final review (tests the brief); fix the recipe | [x] done early, Nov 21 |
| Mon Nov 23 | FIRST: question selection so questions 8+ of a lesson get asked (a `core` flag, unit tests reaching the never-asked tail). If it touches quizFor (the daily quiz) it must land BEFORE his first lesson, otherwise before the unit 1 test (about Nov 27); either way with a test that a quiz in progress doesn't change. Then rework w1d3-w1d5 wrong choices (guess report; drop 'unit 1' from REPORT_ONLY), cold key check, pin, and tell the parent lessons 3-5 can be approved. Then unit 5 (speed, stopping, turning) | [ ] |
| Tue Nov 24 | Unit 6 (highways and passing) | [ ] |
| Wed Nov 25 | FIRST settle the number quota (C8): read the 66 DOT stems, count those whose answer must be a number, set the 8-10 rule from it. Then fix Form B before it opens (tB01, tB15, tB03, tB04, length ranks; a `fact` key per form question and a consecutive-forms test). Then Forms C and D | [ ] |
| Thu Nov 26 | Unit 7 (sharing the road) | [ ] |
| (deadlines) | Rework units 2, 3, 4 wrong choices and repeats (cold review triage; guess report) before he reaches them: unit 2 by Sun Nov 29, unit 3 by Sun Dec 6, unit 4 by Sun Dec 13 (unit 4 may slip past the Dec 5-6 frozen commit only if noted there). Drop each from REPORT_ONLY and pin its lessons when done | [ ] |
| Fri Nov 27 | Unit 8 (railroad, work zones, parking, backing) | [ ] |
| Sat Nov 28 | Unit 9 (night, weather, rural Iowa) | [ ] |
| Sun Nov 29 | Unit 10 (the driver and the car) | [ ] |
| Mon Nov 30 | Final week: checkCourse allows the two no-video days; Iowa DOT practice-test score entry (Parents page); end-of-course state; a test walking a simulated Eli through all 55 days | [ ] |
| Tue Dec 1 | Forms E and F | [ ] |
| Wed Dec 2 | Review: content, coverage, compliance | [ ] |
| Thu Dec 3 | Review: skill levels (beginner / intermediate / advanced) and gaps on the finished course. Per skill: quizzed / only mentioned / can't be taught by an app (report that group; don't build for it). Benchmarks: manual sections, the 68 DOT practice stems (docs/iowa/dot-practice-stems.txt; question text only), Iowa's driver-ed topic list (FETCH it, starting with iowadot.gov driver-education pages) | [ ] |
| Fri Dec 4 | Review: bugs, UI, missing features (trace docs/requirements.md), whole-app regression | [ ] |
| Sat Dec 5 - Sun Dec 6 | Fixes, full rerun, advisor sign-off; record the frozen commit here | [ ] |
| Mon Dec 7 | Independent review: a FRESH agent (not a fork), read-only; gets the frozen commit, docs/requirements.md, the manual, the list of frozen lessons; NOT this session's history or the advisor's sign-offs; writes docs/independent-review.md, ranked, with evidence per finding | [ ] |
| Tue Dec 8 | Triage each recommendation: accept / decline / ask the parent, with a reason | [ ] |
| Wed Dec 9 - Sat Dec 12 | Implement accepted recommendations | [ ] |
| Sun Dec 13 | A fresh reviewer rechecks the changed items | [ ] |
| Mon Dec 14 | Final sign-off and report to the parent; DISABLE the nightly check-in and set the Saturday check-in back to normal | [ ] |

**Work queue (Nov 24; replaces the night-by-night order above; the advisor set it by when Eli reaches each item)**
Measured pace: about 2-4 lessons reworked or built per night, each with a fresh blind check. Do the first item
not done; one item can span nights. The rows above stay as a record.

| # | Item | Eli reaches it | Status |
|---|---|---|---|
| 1 | Unit 2 lessons 3-4 rework + pin; real-course unit-test browser case | Dec 2 | done Nov 24 |
| 2 | Form B fixes (tB01, tB15, tB03, tB04, length ranks, fact keys, consecutive-forms test); C8 number quota first | about Dec 4 | [ ] |
| 3 | Unit 3 rework (4 lessons + pin) | Dec 7 | [ ] |
| 4 | Unit 4 rework (4 lessons + pin) | Dec 14 | [ ] |
| 5 | Form C | about Dec 18 | [ ] |
| 6 | Unit 5 build | Dec 21 | [ ] |
| 7 | Unit 6 build; Form D | Dec 28 / about Jan 1 | [ ] |
| 8 | Units 7-8 | Jan 4 / Jan 11 | [ ] |
| 9 | Units 9-10, final week; Forms E-F | Jan 18 - Feb | [ ] |
| R | Reviews: each unit gets its fresh blind check when built; the whole-course reviews (skill levels, gaps, bugs/UI, independent review, triage, fixes) run once units 5-10 are built. They don't shrink. | | [ ] |

Doesn't fit by Dec 14: items 1-4 do (about 6-7 nights); 5-9 and the whole-course reviews need about 25 more nights.
The parent extended the nightly run (Nov 24) through Fri Jan 15, 2027 (the nightly and Saturday scheduled tasks were updated; the Saturday one stays report-only until then), always at least a week ahead of Eli. What slips first at no cost to Eli: Forms E-F, then D, then units 9-10.

**Rules every night**
- Each build night ends with one cold sub-agent answering that night's new questions from the manual WITHOUT the keys; any disagreement is a defect until resolved.
- Review nights: at most three read-only sub-agents, one lens each; findings go to a file. Fix nothing without a failing test, a screenshot or a manual page.
- Frozen content: the parent said (Nov 20) Eli takes the baseline (Form A) on the evening of Fri Nov 20 and starts lessons early the week of Mon Nov 23. From Nov 21 on, Form A is FROZEN: never edit it, even wording. Lessons 1-2 (w1d1, w1d2) may still get the Sunday Nov 22 reword-only leftovers (wrong choices, no key or stem meaning changes), then freeze on Mon Nov 23. Ask the parent for his real first lesson date (and whether the baseline is done) and record it here; don't read the live database. Once he starts, he advances one lesson each weekday; on lessons he may have seen, only reword wrong choices or append questions.
- Overruns: a late build night takes the next night, absorbed by Dec 5-6. Forms E and F move past Dec 14 only if more than two nights are lost. The reviews never shrink.
- A row done early (the parent can ask for one in the day) is marked [x] with its date; the next nightly run starts at the first row not marked [x], so the schedule moves up a day.
- Mark the night's row [x] and add a Log line when done; push to main and the session branch; check both CI jobs.
- The parent's jobs (report them, don't wait on them): approve lessons; apply the database rules and add the BACKUP_KEY secret (docs/database-safety.md); share Eli's baseline score.

## How to write a driving unit (for the weekly check-ins)

**Added Nov 22:** at most 7 questions per lesson (3 go in its daily quiz, 4 in its unit test; a test enforces it for units 5+); a fact the permit test asks goes in the first 7. Unit tests also take up to 4 never-asked questions from earlier units (BACKLOG in driving.js) to drain units 2-4's extras.
**Added Nov 21 (cold review):** wrong choices are a neighbouring number or the rule for the other situation,
never filler ("Honk…", absurd, or padded to hide the answer's length). Run `node scripts/guess-report.mjs`: each
length rank at 35% or less per unit and form (a test enforces it for units 5+ and Forms C+). One question per fact
in a lesson; a fact the DOT test asks gets a `core` flag (once that lands). The blind check also reads each `why`.
1. Run node scripts/check-videos.mjs; take the unit's videos (titles, channels, lengths) from docs/driving-videos.json; swap in a spare if one is gone (find more with scripts/youtube-search.py).
2. Read the facts off the manual's PAGE PICTURES, not just the text: the saved text mixes the two columns on many pages. Download the PDF (link in docs/iowa/README.md) and render pages with: pdftoppm -f N -l N -r 60 -png manual.pdf p
3. Each lesson: 2-3 key points (one fact each, quoted from the manual: k(text, page, quote); family rules: fam(text)); an Iowa note on the video if it differs from Iowa; about 7-9 questions, each quoted from its page (Iowa permit rules: quote docs/iowa/gdl-*.txt). Sign questions: add sign: { shape, color } (signs.js; blank shapes only, never words).
4. Choices: 4 each; spread the right answer over all 4 positions, with a different position sequence for each lesson (the daily quiz shows a lesson's first 3); make wrong choices as long and plausible as the right one (checkCourse enforces: no bunched positions, right answer rarely the longest, no single length rank over 60%).
5. APPEND ONLY: new lessons at the end of driving-course.js; new questions at the END of a lesson (its first 3 are the day's quiz); never reorder choices of a lesson he may have seen (stored picks are positions). Every 5th lesson is the unit test: { id, title: 'Unit N test', review: true, videos: [], questions: [] }.
5b. If the checker says a lesson question repeats a test-form question, change the LESSON's stem, never the form's (forms are frozen once a sitting has used them). Before Form C: count the distinct manual rules per topic and add a shared-quote report to checkTests.
6. Test (node --test tests/*.test.mjs; node tests/browser/run.mjs), commit one lesson at a time, push to main and the session branch, update this file.

## Dates (if Eli starts Nov 19 and misses no day)
- Unit 1 test: about Wed Nov 25. Unit 2 test: about Wed Dec 2. Unit 3: about Dec 3-9. Unit 4: about Dec 10-16.
- Done Nov 19: Form B and the hazard-ride tick. Saturday Nov 21 check-in: start unit 3.
- Done Nov 19: units 3 and 4. Next dated item: Form C (opens after the Unit 4 test, about Dec 16). Before writing it: (1) count the distinct manual rules per topic; (2) add a shared-quote report to checkTests. Unit 5 (speed, stopping, turning) by about Dec 12.

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
- Nov 19: unit 2 complete (w2d4 signals and beacons, w2d5 Unit 2 test). Next: Form B (due when unit 2 test is done, ~first week of Dec), weekly hazard ride (9b), then unit 3 via the Saturday check-in.
- Nov 19: 11b done. Next: Form B (due ~first week of Dec), hazard ride tick (9b), unit 3 via Saturday check-in.
- Nov 19: 9b done (hazard ride). Next: Form B.
- Nov 19: Form B done (progress test 1). Next: unit 3 by Sat Nov 28 (Saturday check-in).
- Nov 19: unit 3 lessons 1-2 (w3d1 markings, yield lines, crosswalks; w3d2 center turn, reversible, HOV lanes, shoulders) written. Lesson 2 video is now Stan Cravens center-turn-lane (Iowa DOT 4-to-3 clip moved to spares). Next: w3d3 bike lanes (2.19, 5.11), w3d4 changing lanes (4.9 minus the shoulder check), w3d5 Unit 3 test, route-sign question on w2d3.
- Nov 19: unit 3 complete (w3d3 bike lanes and bicyclists, w3d4 changing lanes, w3d5 Unit 3 test; 31 questions). Route-sign question added to w2d3 (closes 2.8). Next: unit 4 via the Saturday check-in.
- Nov 19: unit 4 complete (w4d1 stops and uncontrolled intersections; w4d2 turns, pedestrians, motorcycles, driveways; w4d3 roundabouts; w4d4 reduced-conflict and diverging diamond; w4d5 Unit 4 test; 32 questions). DOT stems: uncontrolled intersection w4d1q3, right on red w4d1q6, left turn vs motorcycle w4d2q1.
- Nov 20: pre-start check of the baseline (Form A) and lessons 1-2 (the parent asked; he had not started): blind key check by a fresh sub-agent (all 39 answers matched the manual; fixed 1 defensible wrong choice, 2 unclear stems, 1 trivia question, 7 giveaway choice sets); 12 cited pages read from their pictures (1 stitched quote replaced); answer positions re-spread; Form A sign items now drawn; code read of days 1-2 by a fresh sub-agent (no lost answers; fixed: lessons were required on days before the baseline, so Nov 19-20 broke his streak; day-one wording; a stale excuse request); screens at 320/375 light and dark with contrast checks (new drive-screens case).
- Nov 20 (round 2): a second fresh blind check on all 27 changed items matched every key; wrong choices the manual partly supports replaced (w1d2q4, tA23, w1d1q5); Form A giveaway choices rewritten; tA05 no longer names flashing yellow; the In Iowa note hides once questions show; Eli hub card says baseline first. Advisor: GO for Eli to start once the parent confirms the baseline is not started, reloads Eli's device (question 1 shows a sign) and checks driving saves under the new database rules. FREEZE: the baseline and lessons 1-2 freeze on his first tap; record his start date here when the parent gives it.
- Nov 20 (evening): parent: baseline tonight, lessons start early next week. Form A frozen from Nov 21; w1d1-w1d2 reword-only until Mon Nov 23, then frozen. The checklist makes lesson 1 required from Mon Nov 23 (baseline done on an earlier day); a later start needs a "Not able to do it?" excuse that day.
- Nov 21 (nightly): Form A pinned by a sha256 test (equals bc148bc, the version live when he was due to take it; the parent hasn't confirmed he took it yet). Knowledge-test forms quote the manual only (checkTests); DOT pages are for lessons; the DOT branch of the quote test has not run on real data yet (add a passing and a failing case and a 320px screenshot of the label when unit 10 cites one). Shared-quote report (driving.js quoteReport; docs/driving-quote-report.md; report only): 12 rows, 0 form vs form. The checker accepts the saved Iowa DOT permit/license pages as sources (SOURCES, isSourced, refLabel; qd/kd helpers; the quote test reads docs/iowa/gdl-*.txt). Forms C-F groundwork: scripts/fact-supply.mjs (82 number sentences), docs/driving-form-reservations.md (demand, shortfall policy: a fact may repeat but never in consecutive forms; forms quote the manual only; 36 number facts reserved, quotes verified against the text, pages 20/21/24/25/37/41/42/60/61/63 checked on the page pictures; p.60 'five or six seconds' is WET roads, not fog). NOT DONE: the script to re-fetch Iowa DOT's 68 practice stems: the automatic permission check denied fetching the DOT quiz file (same as Nov 18); not worked around. The stems were never saved in the repo. The parent can allow the fetch (stems only, no answers); otherwise the Dec 3 review benchmarks against the manual sections and Iowa's driver-ed topic list only.
- Nov 21 (parent): backup passphrase changed. Parent allowed fetching the DOT practice stems (stems only); the automatic permission check denied the fetch again, so it waits on a permission rule from the parent (or the parent saving the questions). Not worked around.
- Nov 21 (later): the parent added the permission rule; scripts/fetch-dot-stems.mjs saved the DOT practice test's question text only (68 questions, 66 distinct stems) to docs/iowa/dot-practice-stems.txt. The answer field is dropped at parse time and was never printed or saved. Saturday's row is complete.
- Nov 21 (parent): the baseline is NOT taken yet, lesson 1 not seen; the three go-checks are done; the parent will check today that baseline question 1 shows a drawn sign, and will approve lessons 3-5 by about Wed Nov 25. Form A stays frozen (pinned; it's live and he may open it any time). Lessons 1-2: reword-only until his first lesson; ask the parent for the dates of the baseline and his first lesson each night until known. Until the baseline is done, lessons stay optional (his streak is safe).
- Nov 21 (Sunday's row, done early at the parent's request): lessons 1-2 last rewords (5 wrong choices; keys checked cold); skill levels tagged (14 B / 17 I / 9 A; check + test); Driving page redraws on a new day; Parents Weakest matches the Driving page; cold independent review of units 1-4 + Forms A-B (25 findings, no wrong key; triage in docs/reviews/2026-11-21-cold-review-triage.md); the lesson video no longer restarts on any save (bc8bacc); guessing-tell rule (guessReport) hard for new content; recipe updated. Units 1-4 rework (wrong choices, never-asked questions) scheduled Mon Nov 23 first, Form B fixes Nov 25. Asked the parent to hold approval of lessons 3-5 until told.
- Nov 21 (later): w1d1q1 B, w1d1q2 C, w1d1q5 D replaced (stock fillers "Only"/"Honk"); cold check: none supported, none a giveaway. Lessons 1-2 now pinned by a test (frozen). Filler check narrowed to a named list (FILLERS in driving.js). Screens checked after the video fix (320px, light and dark): layout unchanged.
- Nov 21 (parent): on unit tests and knowledge tests he can now change an answer (tap a different choice) until he taps Finish; Finish shows the score. Knowledge tests store Finish as watched/<sitting> (no rules change: watched/$lesson already allows it); unit tests as done/<unit> (filled only by Finish, so the checklist row fills when he finishes). A sitting answered in full under the old code shows Finish. Daily lessons unchanged (first answer counts; right/wrong shows at once). Form A: the parent was told it stays as it is (12 of 25 answers 2nd-longest), their call to change before he takes it.
- Nov 22 (parent): Eli's baseline (Form A) score: 80% (20 of 25), exactly the practice-test pass mark. Taken on the Nov 20 version of Form A (giveaway choices rewritten, signs drawn; the length pattern unchanged). Date taken and first lesson date not yet given.
- Nov 22 (parent): baseline taken Sun Nov 22; lesson 1 starts Mon Nov 23 (required that day: the baseline was finished on an earlier day). From Nov 23 on, w1d1-w1d2 are seen (already pinned); the nightly rework of w1d3-w1d5 must land before he reaches lesson 3 (about Wed Nov 25), then the parent approves.
- Nov 22 (parent): a finished knowledge test now has "See every answer" on the Driving page (his pick, the right answer, why, the manual page), for Eli and the parents; the Parents page links to it ("His answers"). Forms B-F use different questions, so it doesn't spoil later tests.
- Nov 22 (nightly): own trace (real functions, stored as the page stores): all answers right, the extras drain; with 1 in 4 wrong, 20 questions in units 2-4 (each lesson's q8+) never come up, because missed ones take the daily review slots. Fix confined to unitTestFor (first used at the unit 1 test, about Nov 27; lesson 1-2 quizzes unchanged): +4 never-asked from earlier units per unit test; with misses the backlog holds at 12 instead of growing to 20, and drains once new lessons stop adding extras (max 7 questions per lesson for units 5+, tested). Units 2-4 rework: move must-ask facts (w2d4q10-11 flashing red/yellow) into the first 7.
- Nov 22 (nightly, cont.): lessons 3-4 reworked (docs/reviews/2026-11-22-lessons-3-4.md), blind-checked (14/14 keys), pinned; unit 1 now under the hard guessing-tell rule. The parent can approve lessons 3-5. Screens for Finish and See every answer added (drive-screens). Mon Nov 23 row: selection fix and lessons 3-4 done; unit 5 NOT started (moves to the next night).
- Correction: the baseline was taken Sat Nov 21 in the evening, Iowa time (the parent said "today" in a message sent about 9pm Central; the Nov 22 entries above used the session's UTC date). The app stores the exact Finish day.
- Nov 22 (nightly, cont.): lessons 3-4 second pass (per-lesson length ranks 4/4/2/4; weak choices replaced; rechecked), re-pinned. Ready for the parent to approve lessons 3-5. guess-report prints ranks per lesson. Unit 5 not started: it stays first on the next night's row; if time allows, the unit 2 rework (deadline Nov 29) comes before it.
- Nov 23 (parent): Eli lost video games for the week of Nov 23-29: an extra chore every day (lists.js EXTRA_CHORES: Mon Bathrooms, Tue Kitchen, Wed Basement, Thu Stairs/landing/hallway, Fri Front closet + shoes, Sat Kitchen, Sun Trash) and no game time earned (GAME_OFF). Monday Nov 30 back to normal.
- Nov 23 (nightly): extra-chores week: Thu and Fri extras swapped (Isaiah does the stairs on Thursdays; a test now checks no extra matches anyone's chore that day); no game minutes 'held' by a missed chore that week; browser case extra-chores (steps save as xchore, screen work waits for it, a missed one carries beside the next day's, chart says no game time; 320px looked at). CI's syntax step now parses every script as a module (plain node --check missed kid.js's missing paren).
- Nov 23 (nightly, cont.): a fresh blind check of pinned lessons 3-4 matched all keys; fixed a wrong choice that was also an intersection, a yes/no stem, a duplicate pair; re-pinned. Unit 2 lessons 1-2 restructured (w2d1: 8 questions, w2d1q5 pink and w2d1q8 white dropped; w2d2: 7, w2d2q5 and w2d2q9 dropped as unit 5/6 topics; test-asked signs first), wrong choices from neighbouring signs, two fresh blind checks (18 then 11 questions, all keys matched); a sign the manual doesn't have (KEEP RIGHT) replaced by DIVIDED HIGHWAY; pinned. Left: w2d3-w2d4 (deadline Sun Nov 29), then drop 'unit 2' from REPORT_ONLY. Unit 5 not started.
- Nov 23 (parent): leftover game minutes from before can't be used during Eli's no-game-time week either (gameWeek left = 0 when off; carried-in minutes shown 'on hold').
- Nov 24 (nightly): unit 2 finished: w2d3-w2d4 restructured to 8 questions each (signals the DOT test asks first), fresh blind check (16/16 keys) and recheck of fixes, pinned; unit 2 now under the hard guessing-tell rule (ranks 10/9/9/3 of 31). Questions dropped from unit 2 (ids never reused; cover them in later units or the Dec reviews): w2d1q5 (pink incident signs), w2d1q8 (white regulatory), w2d2q5 (speed limit in bad weather, unit 5), w2d2q9 (minimum speed, unit 6), w2d3q6 (farm machinery sign), w2d3q7 (deer crossing sign, unit 9), w2d4q5 (red arrow), w2d4q8 (pedestrian hybrid beacon), w2d4q9 (white cane). Yield and slow-moving signs looked at (draw correctly). Real-course unit-test case (drive-unit-real). Daily backup failing since Nov 20 (401 reading the database): parent to check the live rules.
- Nov 24 (parent): nightly sessions extended through Fri Jan 15, 2027; both scheduled tasks updated to the work queue.
