# Reward Charts: what the family asked for (requirements list)

Written Nov 20, 2026 from the parent's own messages in this project's build session, for the missing-features review (Dec 4) and the independent review (Dec 7). Status is as of Nov 20; **reviewers verify each line** against the app and its tests, and mark anything not true.

Status: **built** (shipped; test named where one exists) · **partial** · **planned** (in docs/plan-progress.md) · **decision** (a choice, not a feature).

## Eli: running rewards and training
| # | Request | Status | Proof |
|---|---|---|---|
| R1 | Reward chart for 1-mile and 5K time milestones, with prizes (video game time in 15-min steps, skip a chore, breakfast out, lunch with dad, checkout-line pick, Starbucks, arcade/OR $25, family meal $25, Saturday family activities, pizza night, ice cream, movie night with his pick of movie and dessert, etc.) | built | trials.js; tests/app.test.mjs |
| R2 | No costs shown on the sheet; earn-then-check-off-when-paid, like Isaiah's soccer chart | built | Parents "To pay or give" |
| R3 | Ladders: mile to 5:40/5:30; 5K ladder matched to research-based mile-to-5K equivalents, slightly harder (decided ~2-3%); added 7:10 and 7:20 miles; 5K 24:00 and 23:30 added, 20:45/20:15/19:15/19:00 removed; season goal 21:00; prizes spread evenly, grand prize on the bottom two | built | trials.js |
| R4 | A time trial each week (each distance every other week); no reward just for doing a trial; scores kept in history | built | trials.js SCHED |
| R5 | Treadmill speed for each target | built | Training page |
| R6 | History as a table on Eli's Training page (not the home page) | built | run.html |
| R7 | Training plan reviewed by an outside expert (age 14, freshman next year, driven; trials first in the workout; indoor and outdoor options for winter; optional Thursday strength) and updated | built | plan.js |
| R8 | Swim practice Mon/Thu/Fri; running Tue/Wed/Sat; run and swim combined on his reward sheet | built | plan.js, charts.js |
| R9 | Plan extended through February | built (Feb is a draft for his coach) | plan.js |
| R10 | Run/swim (Eli), soccer (Isaiah) and Rhett's activities can be "not able to", with parent approval | built | tests/browser/cases/eli-days |

## Checklists, game time and charts (all boys)
| # | Request | Status | Proof |
|---|---|---|---|
| C1 | Home page: tap your name; Parents tab with a quick glance at what's owed and where each kid is, aware of the time of day; tabs for the other brothers (shared iPad) | built | index.html, parents.js |
| C2 | Eli earns weekend video game time (up to 2.5 h) by completing each day's checklist in full | built | lists.js gameDay/gameWeek |
| C3 | End-of-day checks: Eli (kind to brothers, listening without arguing); Isaiah and Rhett (not yelling, listening the first time, no lies today) | built | routines.js, settings |
| C4 | "Not able to complete" for reading/homework and similar, parent-approved; still recorded as not done | built | owed-excuse, eli-days cases |
| C5 | Reading tracker per kid | built | Parents "Reading" |
| C6 | Remove Isaiah's "Wake up" | built | — |
| C7 | Track game-time use in pieces (split sessions) for all boys | built | gamecard cases |
| C8 | Every box on every visual chart tied to checklist metrics | built | tests: chart-vs-checklist |
| C9 | A chore missed earlier in the week locks the after-school list until done or excused (Mon/Tue of Nov 16 week count); late chores can still earn game time | built | owed-excuse case |
| C10 | Isaiah ("Zay") done by 8 on Thursdays (earlier shower); Eli's shower 30 min, same bedtimes | built | routines.js |
| C11 | Ability to add/adjust checklist items | built (wording and minutes in Settings; adding a check is a code change) | settings cases |
| C12 | Leftover game time: a parent check each week on carrying it over | built | carry case |
| C13 | Isaiah's prizes stay as they are | decision | — |
| C14 | Whole-app reviews and fixes (streamlining, bugs, UI; earlier "brain" review with a 0-10 score; Tier 1-4 plan) | built for Tiers 1-3 and Tier 4 #17, #19-20; #18 parked | plan-progress.md |
| C15 | Everything on GitHub and Firebase so everyone has access; links keep working (no clone) | built | main branch, GitHub Pages |

## Eli: computer work and driving course
| # | Request | Status | Proof |
|---|---|---|---|
| D1 | Typing 10 min, 6 days a week | built | lists.js |
| D2 | Typing and driving locked until today's chores are done ("period"); only those two lock | built | drive case, lockedBy |
| D3 | Driving lessons don't count toward game time; they count toward the daily streak | built | drive-pages case |
| D4 | One video a day, 5 days a week, with a 5-question quiz; research-based method (retrieval, spacing); Iowa rules | built | driving.js, tests/driving.test.mjs |
| D5 | Parent previews and approves videos before Eli sees them | built | drive case |
| D6 | He won't read the manual: key points and explanations carry the manual's facts | built | key points cards |
| D7 | 13-week course (cut to 55 lesson days for a mid-February permit test), sections with a comprehensive unit test | partial: units 1-4 built; 5-10 + final week planned | plan-progress.md |
| D8 | Questions from the video topic or likely on the written test; every answer quoted from the Iowa manual | built for units 1-4 | quote test |
| D9 | Baseline knowledge test now; a progress test every couple of weeks; a different test every time | partial: Forms A-B built; C-F planned | drive-test, drive-progress cases |
| D10 | Advisor approves videos, tests and plan; each step advisor-approved | ongoing | plan-progress.md log |
| D11 | Comprehensive coverage; gaps reported; written test passable with this app; intermediate skills (backing, reverse parking: family rule to back into every space) | partial: plan covers all manual sections; reverse parking day planned (unit 8) | driving-syllabus.md |
| D12 | "Not able to do it?" for lessons (holidays, sick days) | built | drive-excuse case |
| D13 | Weekly hazard ride with Eli as passenger | built | drive-ride case |
| D14 | Permit test at home (parent-proctored): timeline in the plan | built (docs) | driving-syllabus.md |
| D15 | Weekly check-in writes ahead and lists videos to preview | built (Saturday check-in) | scheduled task |

## Process requirements
| # | Request | Status |
|---|---|---|
| P1 | The advisor approves before each step and signs off when done; the advisor sets the order of work | ongoing |
| P2 | Nightly work from about 1 am until tokens run out, Nov 21 - Dec 14 (complete the course; test for comprehension, compliance, bugs, missing features, improvements, UI) | planned |
| P3 | Check beginner, intermediate and advanced skills and gaps; an independent reviewer of the whole program; a week to act on its recommendations | planned (Nov 22, Dec 3, Dec 7-13) |
| P4 | Push to main (the family's app) and the session branch | ongoing |
| P5 | Iowa DOT practice-test questions saved, question text only (no answers), as a coverage benchmark (Nov 21) | done: docs/iowa/dot-practice-stems.txt, scripts/fetch-dot-stems.mjs |
| P6 | Right answers not guessable from length; wrong choices plausible, not filler (Nov 21) | lessons 1-4 done (unit 1 ranks 6/7/7/8); rule enforced for units 5+ and Forms C+; units 2-4 and Form B scheduled (plan) |
| P7 | On tests he can change an answer until he taps Finish (accidental taps) (Nov 21) | done: knowledge tests and unit tests (drive-test, drive-unit) |
| P8 | Eli and the parents can see every baseline answer (his pick, the right one, why, the page) (Nov 22) | done: "See every answer" on the Driving page; "His answers" on the Parents page (drive-test) |
