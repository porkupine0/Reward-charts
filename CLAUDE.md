# Reward Charts: notes for every Claude session

The family's checklists, reward charts and Parents page for Eli, Rhett and Isaiah. Plain HTML + ES modules on
GitHub Pages, data in Firebase (`config.js`). Standing rules live here; dated history and to-dos live in
`docs/plan-progress.md` (read its **Decisions** first). Other Claude sessions work on this repo too.

## Where things are
- `lists.js`: what's on a kid's list for a day, game time, carry-over, grounding. `routines.js`: item
  definitions, bedtimes, `STARTS`, the school calendar. `chorelists.js`: chore step lists. `checklist.js`: the page.
- Big files: grep, don't read whole (`style.css`, `tests/app.test.mjs`, `docs/iowa/drivers-manual.txt`).
- This container can't read the live database: never assume the code's defaults are what's live.

## Rules that must hold
- **Past days don't change.** New or changed items get a start date in `STARTS`: the first day its time
  hasn't passed yet (Central time). Schedule changes go through the Settings page (it snapshots history), not
  `DEFAULTS`. Exception: edits to chore step lists show on every day.
- **School days come only from the calendar** (`NO_SCHOOL`, `isSchoolDay`, `noSchoolTomorrow`). A weekday off
  is like a Saturday for school things. Add next year's dates there (the list ends May 28, 2027).
- **Lost game time = grounding,** set by parents on the Parents page. Don't add `GAME_OFF` weeks in code.
- **Chore lists** match a chore by exact name (a unit test checks built-in names against the chores, plus
  Isaiah's "Laundry" and "Clean your room (30 min)"); step ids hash the chore name + step text.
- **Every parent-only action goes through `askParent`** (PIN): cash-ins, grounding, approvals, Settings.
- **New database paths** need a rule in `database.rules.json` and a line in `tests/rules.test.mjs`. The rules
  aren't applied yet; once they are, the parent must republish them for a new path to save.
- **driving-course.js is append-only:** never reorder or remove lessons; add questions only at the end of a
  lesson's list (saved answers point at positions).
- Tests use the Firebase stand-in; never point anything at the real database.

## Adding a checklist item (the most common request)
Settle each of these and tell the parent the answers:
- Which days, by the school calendar (school days, days off, weekends), and the first day it shows.
- Game time: after-school and bedtime items count toward it; morning items don't.
- Whether it carries to the next day (`CARRY` in lists.js) and whether Isaiah's morning candy needs it.
- Traps: chore ticks are saved by position in the day (`chore`, `chore2`), and lights out isn't always the last
  bedtime row (after-lights items share its time); filter `afterLights` where it matters.

## Shipping a change
1. Fetch main (`git fetch --depth=200 origin main`) and start from it; if main moved while you worked, merge
   it in (don't rebase other sessions' commits, never force-push).
2. `python3 stamp.py` after merging (every `?v=` line changes, so on a `?v=` conflict take either side and stamp again).
3. `for f in *.js; do node --input-type=module --check < "$f" || echo "BAD $f"; done` (CI's check).
4. `node --test tests/*.test.mjs` and `node tests/browser/run.mjs` (or one case by name). Look at new screens
   at phone width (`tests/browser/.out/*.png`) and add a browser case for new behavior. If an older test breaks
   because of the new rule, change only what the rule explains, and say so.
5. Push to `main`: it goes live on the boys' phones. The parent's standing OK (Decisions, Nov 25): publish
   finished, tested changes without asking first, then tell them what changed.

## Talking to the parent
They read on a phone. Lead with what changed for the boys, then what they need to do (exact Settings lines, in
order), then numbered questions with what happens now if they don't answer.
