# Reward Charts: notes for every Claude session

The family's checklists, reward charts and Parents page for Eli, Rhett and Isaiah. Plain HTML + ES modules on
GitHub Pages, data in Firebase (`config.js`). Other Claude sessions (nightly and interactive) push to `main`
too: fetch main and rebase on it before you start and again right before you push.

## Where things are
- `docs/plan-progress.md`: the plan, the **Decisions** list (read it first) and what's next.
- `lists.js`: what's on each kid's list for a day, game time, carry-over, grounding. `routines.js`: the
  item definitions, bedtimes, the school calendar. `chorelists.js`: chore step lists. `checklist.js`: the page.
- Big files: grep, don't read whole (`style.css`, `tests/app.test.mjs`, `docs/iowa/drivers-manual.txt`).

## Rules that must hold
- **Past days don't change.** A new or changed item gets a start date in `STARTS` (routines.js), on the
  first day its time hasn't passed yet (Central time). Settings schedule changes go through the Settings page
  (it snapshots history), not `DEFAULTS`.
- **School days come from the calendar** (`NO_SCHOOL`, `isSchoolDay`, `noSchoolTomorrow` in routines.js).
  A weekday off is like a Saturday for school things. Never hardcode a day off anywhere else; add next
  school year's dates there (the list ends May 28, 2027).
- **Lost game time = grounding,** set by parents on the Parents page (`routines/grounded/<kid>/<day>`).
  Don't add `GAME_OFF` weeks in code.
- **Chore step lists** match a chore by its exact name; step ids hash the chore name + the step text.
  Every built-in list name must be a real chore name (a unit test checks).
- **Cashing in game time needs the parent PIN** (`askParent`), on the chart pages and the Parents page.
- **New database paths** need a rule in `database.rules.json` and a line in `tests/rules.test.mjs`.
- **driving-course.js is append-only** (see docs; saved answers point at positions).
- Tests use the Firebase stand-in; never point anything at the real database.

## Shipping a change
1. `python3 stamp.py` (adds `?v=` so phones load the new code).
2. `for f in *.js; do node --input-type=module --check < "$f" || echo "BAD $f"; done` (CI's check).
3. `node --test tests/*.test.mjs` and `node tests/browser/run.mjs` (or one case by name).
4. Look at new screens at phone width (`tests/browser/.out/*.png`); add a browser case for new behavior.
5. If an older test breaks because of the new rule, change only what the rule explains, and say so.

## Talking to the parent
They read on a phone. Lead with what changed for the boys, then what they need to do (exact Settings
lines, in order), then numbered questions with what happens now if they don't answer.
