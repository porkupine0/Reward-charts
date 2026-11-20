# Driving: day one / day two trace review (read-only)

Code reviewed at version.json `1795183138`. md5: driving.js c396a1ee, drive-page.js 565b970f, lists.js 20d4e20a,
checklist.js 4bc53a17, parents.js 773adf4f, store.js 13c264fe, driving-tests.js e150cef7, driving-course.js f5405d39.
driving.js, drive-page.js and lists.js changed on disk while I was reviewing (13:57 and 13:58 UTC). That was a stamp.py
re-version plus `LIVE_BEFORE_RULE = []` in driving.js:129. I re-read the changed parts: dueOn, lessonFor, quizFor,
testScore and openSittings are unchanged. Tests were re-run after the change.
The files changed again at 14:05 UTC (version 1795183530; driving-course.js and driving-tests.js also touched). Same
sizes for the logic files, the same w1d1/w1d2 questions and answer positions, and the same SITTINGS. After that change I
re-ran the simulation and `node --test` (73/73 pass) and got identical results, so the line numbers below still hold.

Evidence run:
- `node --test tests/*.test.mjs`: 73/73 pass.
- `node tests/browser/run.mjs drive drive-test drive-slow drive-excuse drive-unit drive-progress drive-pages`: all pass.
  This run wrote its generated scripts to tests/browser/.out, as run.mjs always does.
- A scratch simulation (`scratchpad/sim/sim.mjs`) imports the real lists.js, driving.js, streaks.js and the real course
  and test forms, using the real drive data (`approved: {w1d1:'2026-11-18', w1d2:'2026-11-18'}`).
  Assumption: every other item on Eli's list is done each day and `activity` is excused, so only the driving row
  decides. His real routines data was not available.

**Bottom line: I found no high-severity bug.** Answers are not lost, nothing finishes early or never, there is no
double counting, and game time is never affected. The findings below are ranked. Only #1 affects his streak today, and
it is the designed behaviour.

---

## 1. Nov 19 and Nov 20 count as missed driving days, so they are not full days (by design, but it costs his streak). Medium (design)
- **Code:** driving.js:55 (`a < dayKey` → 'required'); lists.js:80-83 (the row, `opt: due.due === 'optional'`);
  lists.js:136 (isOn = a `done` date equal to that day); streaks.js:7-10 (dayFull counts every required row).
- **Steps:** approved w1d1 = 2026-11-18, nothing done.
  - Nov 18: optional.
  - Nov 19, Nov 20 (and Mon Nov 23 if he still hasn't started): **required**, not done.
- **Sim output:**
  ```
  2026-11-18 dueOn w1d1:optional | row optional | FULL
  2026-11-19 dueOn w1d1:required | row required | left drive
  2026-11-20 dueOn w1d1:required | row required | left drive
  2026-11-21 dueOn null | row none | FULL
  ```
- **Effect:** Nov 19 stays not full permanently, even after he finishes w1d1. It was due and nothing was done that
  day, so his day streak breaks at Nov 19.
  - Today (Nov 20) becomes full once he does w1d1. Sim: `11-20 full after day one? true streak 1`.
  - Game time is unaffected (`noGame`). Sim: `game true` on every day, even with the row left.
- **This matches the plan.** Lessons were planned to run from Nov 19, per docs/plan-progress.md:63, "66 weekdays from
  Nov 19". But "Eli has not started" means Nov 19 already counts against him.
- **A parent can excuse it afterwards. Verified.**
  - How: checklist.html?kid=eli&date=2026-11-19, then "Not able to do it?", then Approve with the PIN. The button
    shows even when the row is locked: checklist.js:37. Once approved, isOn returns true for EXCUSED (lists.js:134).
  - Sim: `11-19 excused full? true streak 5`.
  - A request alone (`~skip`, not yet approved) does not count. Sim: `pending-only full? false`.
  - Browser case drive-excuse covers this: "a parent alone can excuse a lesson from the checklist", "excused: the
    lesson no longer stands between him and a full day".
  - On the past day the row shows "Locked · see Finish first" when an earlier chore is owed (sim: `lock: owed`). The
    excuse button is still offered, so this does not block it.

## 2. On day one the row says "A short video and 5 questions", but he must first do the 25-question baseline. Low (UX/design)
- **Code:** lists.js:82 (the `sub` text); drive-page.js:62 (the baseline gate).
- **What happens:** on Nov 20, with chores done, the checklist row reads "A short video and 5 questions". Opening it
  shows "First, take the baseline knowledge test above".
  - To fill the row and keep the day full, he must finish all 25 baseline questions and then the lesson.
  - kid.js:50 also says "Today's lesson is ready" with no mention of the baseline.
  - Nothing is lost: the lesson opens as soon as the 25th answer is saved (browser drive-test: "baseline done: lesson 1
    opens"). But a day-one "it's only 5 questions" expectation is wrong. If he runs out of time after the baseline,
    that day is not full. That is a consequence of #1 combined with the gate.

## 3. A pending "Not able to do it?" stays open after the lesson is finished. Low
- **Code:** checklist.js:57 (the pending branch is checked before `!on`); parents.js:87 and lists.js:340 (list every
  `~skip` without checking whether the item is done).
- **Steps:** Eli taps "Not able to do it?" on the driving row (days/<d>/eli/drive = '~skip'), then does the lesson
  that day anyway.
- **Result:** the row is on (isOn is true). But the checklist still shows "waiting for Mom or Dad" with Approve and Undo,
  and the Parents "waiting" list and the Tonight card still list "Driving lesson".
  - Sim: `11-20 done + ~skip: isOn true tonight excuses [{"key":"drive","label":"Driving lesson"}]`.
  - Harmless to the score, but it is a stale request for a parent. The same applies to other excusable items.

## 4. Parents page "Weakest" never names a topic that has only one question. Low (display)
- **Code:** parents.js:118, `filter((t) => t.total > 1 && t.right < t.total)`. Form A has one question each for
  "Right of way" and "Alcohol and phones" (driving-tests.js:15, BLUEPRINT).
- **Steps:** baseline finished with only those two wrong.
- **Result:**
  - Parents page: "Weakest: none".
  - Driving page: marks both rows weak (drive-page.js:103 marks any `right < total`).
  - Code path only; not run in a browser.

## 5. The Driving page never re-renders on its own when the day changes. Low (uncertain impact)
- **Code:** drive-page.js:229-232. It redraws only on data events. It has no timer and no visibilitychange or pageshow
  handler; compare kid.js:73 and home.js:31, which use `setInterval(render, 60000)`.
- **Steps:**
  1. Finish w1d1 Friday and leave the page open, or suspended as a PWA.
  2. Resume Monday.
- **Result:** it still shows "Lesson done for today ✓" until some watched chart changes.
  - In practice this almost always heals itself. He has to tick Monday's chores before the lesson unlocks, and that
    `routines` write triggers a redraw with the new date.
  - The stale DOM can't save anything wrong. Any tap re-renders, and the weekend check (drive-page.js:56) runs again.
  - Uncertain: depends on how the PWA resumes.

## 6. The Driving page opened with no connection stays on "Loading…". Low (by design)
- **Code:** drive-page.js:49 and :215 (`live()` needs Firebase to have sent routines, eli-drive and config).
- **Effect:** answers already queued offline are kept (store.js:133-142 saves to rc:queue first and shows them at once).
  But a page opened or reloaded with no connection can't continue the test or lesson until it connects.
  - No loss: the queue flushes once the chart is live (store.js:112, 168).
  - Browser drive-slow covers a reload inside a slow save: "the lesson ended up done".

---

## Traced and found correct (with evidence)
- **Day one (Fri Nov 20):**
  - Lock: Driving page and tests show "Do today's chores first" until chores are done (drive-test:13).
  - The baseline shows above the lesson (drive-test:11). The lesson waits (drive-test:17).
  - 25 answers are stored under `answers/<q>/base` with `n`, and the test is not counted as a lesson
    (drive-test:46-49).
  - Score and 8 topics show (drive-test:38). The lesson then opens (drive-test:41).
  - Quiz (sim): `[w1d1q1..q5]`. After 5 answers it is done for today, `done/w1d1 = 2026-11-20` (browser drive:62-63).
  - The checklist row is filled (drive:65). The test does not fill the row (drive-test:49).
- **Day two (Mon Nov 23):**
  - lessonFor gives w1d2 'ready', and dueOn gives w1d2 'required'.
  - Quiz (sim): `[w1d2q1, w1d2q2, w1d2q3, w1d1q2 (missed on day one), w1d1q6 (newest never asked)]`.
  - The quiz stays the same while he takes it, because history() leaves out w1d2's own answers (driving.js:64-66).
    Browser drive:60: "same questions after a reload". drive:89-90: "3 from F2, 2 from F1", "the missed F1 question
    comes back".
- **Reload mid-test:** "a reload keeps his place" (drive-test:34). With answered > 0 the questions show with no Start
  button (drive-page.js:122).
- **Reload mid-lesson:** `watched` and answers persist. finishLeftovers (drive-page.js:218-228) finishes a lesson whose
  5th answer was saved, dated with that answer's day (drive-slow).
- **A tap on a second choice:** save() emits synchronously (store.js:139) before any network call. So ctx.drive already
  holds the answer, the guard at drive-page.js:171 and :181 drops a second tap, and the re-render disables the choices
  (drive-test:32, drive:58).
- **Weekend:** the lesson says "See you Monday" (drive-page.js:56). There is no checklist row Sat/Sun (dueOn dow > 4;
  sim 11-21 `none`). The baseline can still be taken on a weekend once that day's chores are done (drive-test:60-66).
- **Offline or slow saves:**
  - The queue keeps each answer and the `done` write with base null, so they are sent on reconnect.
  - A conflict is only possible if another device wrote the same answer path.
  - Database rules allow answers, done, watched and rides (database.rules.json).
- **Parents page:**
  - Before he starts: "Baseline knowledge test: not started (best taken before his first lesson)" (drive-test:9).
  - After the baseline: score, pass mark, and weakest topics (drive-test:51; see #4).
  - Approval line: w1d1 and w1d2 are approved, so there is no prompt now. After w1d1 is done it reads "1 of the next 2
    lessons approved. Next to preview: Blind spots and mirrors" (parents.js:95-98).
  - It shows the hazard ride row. A `~skip` on the drive row appears under "waiting".
- **Game time:** the drive row is `noGame` and is filtered out in gameDay (lists.js:270). Sim: `game true` on Nov
  19 and 20 with the row undone.
- **Unit test:** after w1d1 alone, unitTestFor would already pick 4 questions. But lessonFor and dueOn don't reach
  w1d5 until w1d2-w1d4 are done, so it cannot come early.
- **Legacy `approved: true`** would make every earlier weekday required (driving.js:55; sim: due on 11-17). This does
  not apply: the real values are dated strings.
