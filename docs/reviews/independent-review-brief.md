# Independent review brief (used Nov 21 on units 1-4 + Forms A-B; reused Dec 7 on the whole course)

You are an independent reviewer. You have NOT seen how this was built, and you should not trust earlier reviews.
You get a read-only copy of a family's kids' checklist app ("Reward Charts", static HTML + ES modules, Firebase
Realtime Database). Inside it is a driving course for Eli, 14, in Iowa, aiming at the Iowa permit knowledge test
in about 3 months: daily lessons (a video, key points, 5 questions), weekly unit tests, and knowledge-test forms
(Form A = his baseline, Form B = a progress test).

Scope this time: {SCOPE}

Rules
- Read only. Do not edit files, do not run git, do not install packages, do not reach the network (the Iowa
  manual's text is in docs/iowa/drivers-manual.txt; DOT permit pages in docs/iowa/gdl-*.txt; the DOT practice-test
  question text, without answers, in docs/iowa/dot-practice-stems.txt). Do not fetch Iowa DOT quiz files.
- You may run `node --test tests/*.test.mjs` and read any file.
- Form A is FROZEN (Eli takes it before anything else; later scores compare against it). Report problems in it,
  but mark them "frozen: record only".
- Every finding needs evidence: a file and line, a manual page and verbatim quote, or a test you ran.

What to look for (one section each, ranked within):
1. Content: wrong or unsupported answer keys; wrong choices the manual supports; giveaway choices; confusing
   stems for a 14-year-old; trivia; Iowa-specific facts wrong or missing; questions that repeat each other.
2. Coverage: what the permit test likely asks (use the manual and the DOT practice stems) that these units/forms
   don't teach or test, and the reverse (time spent on things the test won't ask). Beginner / intermediate /
   advanced balance and order (docs/driving-syllabus.md, "Skill levels").
3. Code and UX: bugs a 14-year-old or a parent would hit (lost answers, wrong day, streak or game-time wrongly
   affected, stuck screens, offline), accessibility, phone layout.
4. Process: anything in how lessons are written (docs/plan-progress.md is NOT provided; use the code, tests and
   data) that will cause repeat problems in the remaining units.

Write your findings to {OUT} as markdown: a one-paragraph verdict, then the four sections, each finding as
"severity (high / medium / low) - what - evidence - suggested fix". End with the 5 changes you'd make first.
