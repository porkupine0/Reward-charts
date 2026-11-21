# Independent review: driving course units 1-4 and Forms A-B (Nov 21, 2026)

**Scope.** Lessons w1d1-w4d5 (driving-course.js), Forms A and B (driving-tests.js), and the code they use:
driving.js, drive-page.js, drive.html, signs.js, the driving parts of lists.js, checklist.js, kid.js and parents.js,
and the eli-drive rules in database.rules.json.

**What I did.**
- Read every lesson question and both forms against their cited manual pages: pp. 6-12, 15-21, 25, 34, 37, 41-48,
  50, 52-55, 57-58 and 61.
- Read pp. 14 and 51 only where the quote test already checks them.
- Ran `node --test tests/*.test.mjs`: 87 of 87 pass.
- Ran two scripts of my own (listed at the end).
- Did not run anything in a browser. UI findings come from reading the code.

## Verdict

The facts are sound: I found no wrong answer key. Every answer I checked against its page holds, the Iowa-specific
facts are right, and the scheduling and streak rules are careful and well tested. The problems are in how well the
questions measure and teach. Picking the second-longest choice scores about 48% on the lessons and on Form A,
against 25% for a blind guess, and many wrong choices are filler ("honk" appears 21 times and is never right). Form
B shows Form A's school-sign picture again and asks two of Form A's number facts again, though the project's own
rules forbid repeats in back-to-back forms. By design, unit tests choose never-asked questions before missed ones,
so in my simulation no missed question reached any unit test. Facts the DOT test asks that sit at the end of long
lesson lists, such as flashing red and flashing yellow, may never be asked. The Driving page also rebuilds the
video player whenever anyone saves anything on the shared checklists, so his video can restart mid-watch after
school. All of this can be fixed before Form B opens (after unit 2, about Dec 4), except the Form A items, which are
recorded only.

---

## 1. Content (ranked)

**C1. High: the answer can be guessed from choice length (Form A part: frozen, record only).**
- The right answer is the second-longest choice in:
  - 64 of 132 lesson questions (48%);
  - 12 of 25 on Form A (48%);
  - 10 of 25 on Form B (40%).
- The wrong choices also give themselves away:
  - "Honk…" is a choice 21 times and is never right, for example tB04 (driving-tests.js:81).
  - Some are padded, for example w1d4q3 "Only where two highways cross each other, out in the country rather than
    in town" (driving-course.js:110) and w4d4q2 "There are traffic lights and stop signs on every corner of it"
    (:440).
  - Some are absurd, for example w1d3q1 "The inside of the trunk" (:82) and w4d2q8 "Flat tires on the highway"
    (:398).
- Evidence: lenstat-cold.mjs printed the right answer's length rank, longest to shortest:

  | | Longest | 2nd | 3rd | Shortest |
  |---|---|---|---|---|
  | Lessons | 32 | 64 | 25 | 11 |
  | Form A | 4 | 12 | 4 | 5 |
  | Form B | 5 | 10 | 2 | 8 |

  The checker lets one length rank reach 60% (driving.js:170-172 and 238-240).
- Fix: in Form B and every lesson not yet approved, use wrong choices that are plausible beginner mistakes (a
  neighbouring number, the rule for the other situation), and spread the right answer evenly over length ranks.

**C2. Medium: Form B repeats Form A, against the rule for consecutive forms.**
- docs/driving-form-reservations.md says a fact never comes back "in consecutive forms (B then C, etc.)".
- tB01 (driving-tests.js:75) draws the same yellow-green pentagon as tA01 (:21). tA01 asks what the colour means
  and tB01 what the shape means, but both answers are "school", so it is the same picture with the same answer.
- tB15 (:103) and tA15 (:49) are neighbouring bullets of the same p.42 list of unposted speed limits (business 20,
  residential 25).
- tB16 (:105) mirrors tA16 (:51). Both use one p.43 sentence, and each lists the other's answer, 100 or 300 feet, as
  a choice.
- The quote report shows 0 form-to-form repeats (docs/driving-quote-report.md) because tA01 cites p.6 and tB01
  p.7. The reservations doc admits the report misses tA16/tB16.
- Fix before Form B opens:
  - Keep `checkTests` passing: tB01 stays a Signs question with a drawn shape, and tB15/tB16 stay number questions
    under Speed, turns, passing and lights.
  - For tB01, use a shape neither form has used: pennant, yield or rectangle.
  - For tB15/tB16, use unused number facts from docs/driving-fact-supply.json. If that takes from Forms C-F, update
    the reservations.

**C3. Medium: some stems give away the answer, so the drawn sign adds nothing.**
- tB03 (driving-tests.js:79): "…warns that the divided highway ends. What should you watch for?" The answer is
  "Oncoming vehicles".
- tB04 (:81): the stem names the horse and buggy. The answer is "Slow down and pass slowly", and the other three
  are honk, speed up and flash your lights.
- w2d3q1 (driving-course.js:190): "showing a lane joining yours", with the answer "blend into your lane".
- Fix: ask a decision the stem doesn't state, or ask what the shape class means.

**C4. Medium: some questions repeat each other within a lesson, so slots are spent twice on one fact.**
- w4d4q2, q3 and q7 (driving-course.js:440, 442, 450): one direction at a time, twice, and fewer conflict points.
- w4d1q6 and q7 (:369, 371): both about right turn on red.
- w1d1q2 and q7 (:33, 43): both about the aggressive driver.
- Crosswalk yielding is asked four ways: w2d3q8 (:204), w3d1q5, w3d1q7 and w4d2q6.
- Fix: one question per fact. Use the freed slots for V2.

**C5. Low: a wrong choice the manual partly supports.**
- w4d2q5 (driving-course.js:392) asks: may you drive on a sidewalk to get around stopped traffic?
- The answer is "No: only to cross it". But the wrong choice "Only to reach a driveway" describes crossing a
  sidewalk into a driveway, which p.19 allows ("except to cross it").
- A careful reader can defend that choice. Fix: replace it with something clearly wrong, such as "Yes, at walking
  speed".

**C6. Low: some explanations Eli reads aren't on the cited page, and nothing checks them.**
- w3d3q8: "Stop behind it on red" (driving-course.js:320). Page 17 says only that bike boxes "allow bicyclists a
  safe way to turn".
- tB12: "keeps you out of the path of flying debris" (driving-tests.js:97). Page 12 gives no reason.
- tB13: "Workers are inches from traffic" (:99). Not on p.14.
- w2d4q7's answer says to stop for anyone "in or about to enter" the crosswalk (driving-course.js:235). Its quote
  (p.18) says stop for anyone *within* and only "be alert" for those about to enter. Page 15 supports the answer.
- Fix: see P2.

**C7. Low (frozen, record only): Form A wording and labels.**
- tA09 (driving-tests.js:37) calls the bus "stopped" in the opposite lanes, then answers "No, not when it's coming
  toward you".
- tA24 (motorcycle following distance, :67) is filed under "Highways, weather and road types". So is tB24 (truck
  no-zones, :121). Backing and parking (tA20, tB18-tB20) are filed under "Speed, turns, passing and lights".
- The syllabus says "The baseline asked signs in words", but tA01-tA04 carry drawn signs.
- Relabelling Form B now would break the BLUEPRINT counts and its consistency with Form A.
- Fix for C-F: keep these topic homes, but add a field naming the unit each question belongs to, so the Parents
  page can show scores by unit (see V3).

**C8. Low: forms have more number questions than the DOT practice test.**
- Form B has 9 of 25 (driving.js:228 keeps every form within one of Form A's 9).
- About 3-4 of the 66 DOT practice stems ask for a number (3, 15, 53 and probably 24).
- The trade-off: fewer number questions would make forms less comparable with Form A.
- Record only: keep 9 for comparability, but expect the app's scores to run a little below the DOT practice test
  on number recall.

**C9. Low: the parents' "Weakest" line hides one-question topics.**
- parents.js:115 filters to `t.total > 1`, so a miss in Right of way or in Alcohol and phones never shows.
- Fix: include those topics, marked "1 question".

## 2. Coverage

**V1. Medium: about 10% of units 1-4 questions go to topics the DOT practice test never asks.**
- Searching docs/iowa/dot-practice-stems.txt for roundabout, diverging, reduced-conflict, beacon, HOV, reversible,
  mile marker, route sign, sharrow and bicycle box finds 0 matches.
- Questions on those topics:
  - w4d4, a whole day: 7 questions and about 8 minutes of video (driving-course.js:431-452);
  - w4d3q9, the truck apron (:426);
  - w2d3q9 and q10, mile markers and route-sign shapes (:206-208);
  - w3d2q5, HOV (:289);
  - w3d3q5 and q8, sharrows and bike boxes (:314, :320);
  - w2d4q8, the hybrid beacon (:237).
- The syllabus already flags w4d4 as an advanced day placed before freeway ramps.
- Fix: keep roundabouts, which Iowa drivers really meet. Cut w4d4 to its key points plus 2-3 questions, or move it
  to unit 6. No more trivia in later units.

**V2. Medium: the 3- to 4-second rule is never asked, though Form C will test a related fact.**
- Unit 1 asks only "at least 3 seconds for beginners" (w1d2q1, driving-course.js:58).
- Not taught or asked anywhere:
  - "the 3- to 4-second rule" (p.41; p.47 item 4);
  - "At speeds of 40 mph, a four- to five-second following distance is recommended" (p.41);
  - "tap your brake pedal three or four times quickly" (p.41);
  - "You must always stop… Before crossing a sidewalk when exiting a… driveway" (p.41).
- DOT stems 57 and 66 ask about rear-end collisions and safe following distance.
- The 40-mph fact is reserved for Form C (reservations doc, Form C item 3).
- Fix: append these questions, but appended questions land at position 8 or later, which P4 shows are rarely asked.
  So add them with the `core` flag from P4, or as w1d2q8 and q9 plus a key point.

**V3. Medium: progress test 1 (Form B) mostly measures topics not yet taught.**
- Form B opens after w2d5 (driving-tests.js:132).
- Only about 5 of its 25 questions draw on units 1-2 (tB01-tB05, signs and signals). The rest are school buses,
  parking, passing, snowplows and railroads (units 4-10).
- The syllabus says 2-3 questions of change is noise, so the step from A to B can't show progress.
- Fix: on the Parents page, show a "taught so far" sub-score (questions whose unit is finished), and tell the
  family that progress tests cover the whole permit test.

**V4. Low: the skill levels are tagged per day, but the questions are nearly all recall.**
- LEVELS tags unit 3 as 'BIII' (scripts/build-video-plan.py:75).
- Yet w3d2's questions are definitions: what the shared left-turn lane is for, a green arrow, a steady yellow X,
  HOV 2+ (driving-course.js:281-289).
- Units 1-4 have few one-decision scenario questions.
- Fix: give each intermediate day at least 2 scenario questions, and tag levels per question.

## 3. Code and UX

**U1. High: the lesson video restarts whenever anyone saves to the shared data (from reading the code).**
- `render()` replaces all of `#today`, including the YouTube iframe (drive-page.js:76 and 79).
- It runs on every update to `routines`, `config` or `eli-drive` (drive-page.js:230-233).
- `emit` passes every snapshot through with no check for a change (store.js:91-94), and `routines` holds all three
  boys' checklists.
- So a brother's tick after school, a parent's approval on another phone, or Eli's own save rebuilds the player and
  restarts the video.
- The parent preview's videos (drive-page.js:154) do the same. No browser test checks that the iframe survives an
  update (tests/browser/cases/drive.body.js only checks that it is absent when skipped).
- Fix: build the video block once per lesson and leave it in place. Update only the quiz and status parts.

**U2. Medium: unit tests skip the questions he missed (as designed, but costly).**
- `unitTestFor` ranks never-asked questions (rank 0) before missed ones (rank 1) (driving.js:127). The syllabus and
  tests/driving.test.mjs:100 describe this order as intended.
- Simulation: `node scratchpad/sim-cold.mjs cold`, every lesson approved, Eli misses the 2nd question each day.
  - 0 missed questions appeared in any of the four unit tests.
  - w1d4q2, missed Thursday Nov 26, is absent from Friday's test.
  - 13-16 of every 16 unit-test questions had never been asked.
- In fairness, misses do return in the daily review slots. In the run, w1d1q2 came back Tuesday and Wednesday, and
  2 of unit 1's 4 misses had been answered right twice by Friday.
- The Parents page shows this score as "Unit N test: x of 16" (parents.js:107-110). It reads as mastery but is
  mostly first sight.
- Fix: per lesson, take up to 2 still-shaky questions first, then never-asked ones, or show "new" and "review"
  separately.

**U3. Medium: one tap is final, with no undo, even on the scored tests.**
- Every quiz and test tap saves the first answer at once (drive-page.js:172 and 182).
- The buttons are 44px tall with 6px between them (style.css:699-700).
- A slip of the thumb on Form B or on a unit test is permanent.
- Fix: unit and knowledge tests already hide right and wrong, so let him change answers until a "Finish" tap.

**U4. Medium: the Driving page is stuck on "Loading…" when opened offline (from reading the code).**
- `live()` needs live Firebase data for three charts (drive-page.js:216), and the page shows "Loading…" or nothing
  until then (lines 49 and 108).
- `isLive` only becomes true inside `onValue` (store.js:106-110).
- The page has a cached copy (store.js:126), and its saves would queue offline, yet no quiz or test is possible
  offline.
- The browser tests cover the checklist offline and a slow server, not this page offline.
- Fix: render from the cache with the "Offline, will sync" pill. Keep the chores lock strict.

**U5. Low: on the shared iPad, the parent preview can stay open with all the answers.**
- `previewOpen` is never reset (drive-page.js:17 and 204), even after the 15-minute parent unlock ends (parent.js:11
  and 27-29).
- The preview shows the next 10 lessons with the right answers in bold (drive-page.js:155), and those questions make
  up the unit tests.
- The requirements name a shared iPad (docs/requirements.md, C1).
- Fix: check `isParent()` in `renderPreview()`, and close the preview when the page is hidden.

**U6. Low: accessibility.**
- `#today` and `#tests` are `aria-live="polite"` (drive.html:26-27) and are fully replaced on every update, so a
  screen reader re-reads the whole lesson.
- Focus is lost after every answer.
- Fix: a small live status line, and focus moves to the next question.

**U7. Low: the database rules can't enforce "first answer counts".**
- Every eli-drive path is `.write: true` with no validation (database.rules.json:44-49). Answers, `done` and the
  frozen Form A sitting can all be overwritten.
- database-safety.md says the rules aren't applied yet and are "not a lock".
- Fix: the app never deletes these, so make `answers/$q/$lesson` and `done/$lesson` write-once (`"!data.exists()"`).

## 4. Process

**P1. High: the anti-guess checker creates the guessing tell in C1.**
- The checker allows 60% of answers at one length rank, per lesson and per form (driving.js:170-172 and 238-240).
- It also limits how often the right answer may be the longest: a third per lesson (167-168) and a quarter per form
  (236-237).
- Writers meet that limit by padding wrong choices, which gives the second-longest pattern.
- This will repeat in units 5-10 and Forms C-F unless the rule changes.
- Fix: keep each length rank at 35% or less across each unit and form, flag a wrong choice much longer than the
  answer, and flag stock fillers ("honk", "only trucks").

**P2. Medium: the quote test proves the quote is on the page, not that it supports the answer.**
- tests/driving.test.mjs:218-236 checks only that `quote` appears in the page text. It ignores the answer, the
  explanation, the key-point text and the `iowa` note, which are what Eli reads.
- The saved text merges columns, and quotes that are column junk pass the check:
  - tA02: "OCTAGON DIAMOND Shape is reserved for a stop sign only." (driving-tests.js:23);
  - tA03: "CIRCLE Yield the right of way. Railroad crossing ahead." (:25), which merges the triangle's meaning into
    the circle's.
- Fix: record per question who checked the answer and explanation against the page picture, and when. Test that
  every number in an explanation appears in its quote.

**P3. Medium: "append only" is enforced for Form A but not for the lessons.**
- Only Form A is pinned by a hash (tests/driving.test.mjs:283-287).
- w1d3's questions run q1, q6, q2, q3, q4, q7, q8 (driving-course.js:81-94), and w1d4 has no q5. Questions were
  inserted and removed before launch.
- After Eli starts, the same edit would quietly change quizzes, unit-test picks and how past days are rebuilt.
- Fix: pin each lesson's question-id list once it has an approval date.

**P4. Medium: a question's position decides whether Eli ever sees it.**
- The first 3 questions are the day's quiz.
- After that, a question appears only in the 2 daily review slots (missed questions first, then at most one newest
  never-asked; driving.js:105-108) or in the unit test, which takes the lowest-numbered never-asked questions.
- In the one-miss-a-day run, 20 of 132 questions were never asked across 4 units. They include w2d4q10 (flashing
  red) and w2d4q11 (flashing yellow) (driving-course.js:241-243), which are DOT stems 9 and 40, and w2d1q9 and
  w2d1q10.
- When he answers everything right, only w4d3q9 goes unasked.
- Fix: put the facts the DOT test asks in positions 1-7, cap lessons at 8 questions, and add a `core` flag the
  selection rule prefers. That flag is the only fix for w2d4q10 and q11, because append-only means they can't be
  moved.

**P5. Medium: duplicate checks match exact stems only, so repeated facts get through.**
- `checkTests` compares stem text (driving.js:224-227).
- `quoteReport` groups by page (:278), so it misses the same fact cited on another page and mirrored number
  questions. That is how C2 and C4 got through.
- Fix: give each question a `fact` key, and add tests for "not in consecutive forms" and "one question per fact
  per lesson".

---

## Scripts I ran

- `node --test tests/*.test.mjs`: 87 pass, 0 fail.
- /tmp/claude-0/-home-user/cc088d5a-c8a1-591c-8368-376a5609c419/scratchpad/sim-cold.mjs `<copy>` simulates 4 weeks
  with every lesson approved Nov 1, weekdays from Nov 23. By default Eli misses the 2nd question of each daily quiz.
  With the argument `all`, he answers everything right.
- /tmp/claude-0/-home-user/cc088d5a-c8a1-591c-8368-376a5609c419/scratchpad/lenstat-cold.mjs `<copy>` prints the
  right answer's length rank and position, and the expected score from guessing.

## The 5 changes I'd make first

1. **Fix Form B before it opens (about Dec 4).**
   - Replace tB01, tB15 and tB16, keeping their topic and number status.
   - Rewrite tB03 and tB04, whose stems give the answer.
   - Rebalance the answer-length ranks, now 5/10/2/8, with plausible wrong choices.
2. **Stop the video restarting.** Build the iframe once per lesson instead of on every update
   (drive-page.js:76 and 230-233).
3. **Make sure missed and core facts come back.**
   - Unit tests take up to 2 shaky questions per lesson before never-asked ones (driving.js:127).
   - A `core` flag makes the facts the DOT test asks (for example w2d4q10 and q11, and the new following-distance
     facts) get asked.
4. **Tighten the anti-guess rule.** Keep each length rank at 35% or less per unit and form, flag padded and stock
   filler choices, and rewrite wrong choices in lessons not yet approved.
5. **Add the protections that stop these problems coming back in units 5-10.**
   - Pin each approved lesson's question list in a test.
   - Add `fact` keys with a test for the consecutive-forms rule.
   - Record a person's check of each answer and explanation against the page picture.
   - On unit and knowledge tests, let him change answers until a "Finish" tap.
