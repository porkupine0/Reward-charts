# Triage: cold review of units 1-4 and Forms A-B (Nov 21, 2026)

Review: docs/reviews/2026-11-21-cold-review-units-1-4.md (a fresh agent; isolated copy of 2729b07 without the
plan or earlier reviews). It found no wrong answer key.

Scoring the brief (6 known issues seeded before the run, not in the brief): it found 3 (Form B repeats Form A at
p.43; offline "Loading…"; Parents "Weakest" hides one-question topics), two of them visible in the docs it had. It
missed: w1d2q1 = tA19; the Driving page not redrawing on a new day (still in its copy; fixed afterwards in a82b52a); the diverging-diamond day before ramps (noted in the syllabus it had). For Dec 7: have the
reviewer run the browser suite, and add a "repeated fact" lens.

| # | Finding | Decision | When / evidence |
|---|---|---|---|
| U1 | Video restarts on any save | ACCEPT: lesson video fixed; parent preview still rebuilds (OPEN, low) | bc8bacc; browser case drive-video failed before the fix |
| C1/P1 | Right answer usually the 2nd-longest (48% lessons, 48% A, 40% B) | ACCEPT | Confirmed on HEAD (lenstat). New rule: guessReport (rank <= 35% per unit/form, stock fillers, padded choices), hard for units 5+ and Forms C+, report for units 1-4 and B (docs/driving-guess-report.md). Rework units 1-4 wrong choices in the order Eli reaches them (w1d3-w1d4 first, before the parent approves them); lessons 1-2 only for stock fillers. Form A: frozen, record only (his baseline may read a little high) |
| C2 | Form B repeats Form A (tB01 same picture and fact as tA01; tB15; tB16) | ACCEPT tB01, tB15; tB16 recorded | Nov 25 forms night, before Form B opens. tB16 asks another number from the same sentence (allowed by the Nov 21 rule; the reviewer disagreed, recorded). Add a `fact` key per form question and a test for consecutive forms |
| C3 | Stems that give the answer away (tB03, tB04) | ACCEPT | Nov 25 |
| C4 | Repeats within a lesson (w4d4q2/q3/q7, w4d1q6/q7, w1d1q2/q7, crosswalk x4) | ACCEPT for unseen lessons (w4, w2d3, w3d1) by appending/replacing before approval; w1d1 record only | with the unit 1-4 rework |
| C5 | A wrong choice the manual partly supports | ACCEPT, check each | with the rework |
| C6 | Explanations not on the cited page | ACCEPT as a process check | recipe: the blind check also reads the `why` |
| C7 | Form A wording | RECORD ONLY (frozen) | |
| C8 | More number questions than the DOT test | UNVERIFIED | the DOT stems don't show which answers are numbers; keep 8-10, revisit at the Dec 3 review |
| C9 | Parents "Weakest" hides one-question topics | ACCEPT, fixed | a82b52a (drive-wake) |
| V1 | ~10% of questions on topics the DOT test never asks | RECORD | Dec 3 coverage review |
| V2 | The 3- to 4-second rule never asked | ACCEPT | with the selection fix (core flag) |
| V3 | Form B mostly measures untaught topics | RECORD (by design: a progress test) | |
| V4 | Questions are nearly all recall | RECORD | Dec 3 skill-level review |
| U2/P4 | Questions 8+ of a lesson are never asked (20 of 132, incl. flashing red/yellow w2d4q10-11) | ACCEPT | Confirmed Nov 22 by our own trace: with all answers right the extras DO drain (the reviewer's sim was misleading); with 1 in 4 wrong, the 20 q8+ questions never come up. By the code (driving.js quizFor: missed ones first in the earlier slots) and its unit tests, misses DO return in the daily quiz, so U2's "misses never return" part is mostly moot. Fix the selection (a `core` flag and/or unit tests reaching the never-asked tail) before the unit 1 test (about Nov 27), with a test that a quiz in progress doesn't change |
| U3 | One tap is final, even on tests | ACCEPT (the parent asked for it, Nov 21) | Unit tests and knowledge tests: tap a different choice to change an answer until Finish; Finish shows the score (knowledge test: watched/<sitting> = the day; unit test: done/<unit>). Daily lessons keep first-answer-counts (they show right/wrong at once). Browser cases drive-test, drive-unit, drive-progress |
| U4 | Offline open stays on "Loading…" | DECLINE (by design) | answers queue; code-review #6 |
| U5 | Parent preview can stay open on a shared iPad | RECORD | |
| U6 | Accessibility items | ACCEPT the specific ones | with the rework |
| U7 | Rules can't enforce "first answer counts" | RECORD | |
| P2 | Quote test proves the quote is on the page, not that it supports the answer | ACCEPT (process) | blind check stays the guard |
| P3 | "Append only" not enforced for lessons | ACCEPT, started | w1d1-w1d2 pinned Nov 21 (tests/driving.test.mjs PINNED_LESSONS); pin each later lesson once reworked and approved |
| P5 | Duplicate check matches exact stems only | ACCEPT | `fact` keys |
