# Database safety: rules and daily backup

**Status: not applied.** These are ready, but nothing changes until a parent does the steps below.

## 1. Safety rules (database.rules.json)

**What they do:** the app keeps working exactly as now (no sign-in). They only allow writing at the exact places the app saves to, so one request can't replace or delete:
- the whole database;
- a whole chart;
- all the daily checklists;
- the game-time log;
- Eli's training log;
- the weekly charts' weeks and months;
- the time trials;
- Ball Master's days.

**What they don't do:** someone with the address could still change or delete things one at a time. The rules stop one request wiping a whole chart; they aren't a lock. The daily backup covers the rest.

**Apply them (about 5 minutes):**
1. Open the Firebase console, then the project, then **Realtime Database**, then the **Rules** tab.
2. **Copy the current rules out first.** Select all, copy, and paste them into a note on your phone. This is your way back.
3. Replace everything with the contents of `database.rules.json` from this repo, then tap **Publish**.
4. On one phone, tick one box on any checklist and wait for the pill at the top to say **Synced**.
5. **If it says "Not saved, retrying" instead:**
   - Paste the old rules back and Publish.
   - Untick the box.
   - Tell Claude which box it was. A path was missed and needs a rule.

**Changing the app later:** every new place the app saves to needs a rule in `database.rules.json` and a line in `tests/rules.test.mjs` (the test lists each path).

## 2. Daily backup (.github/workflows/backup.yml)

**What it does:**
- Once a day (3:17 am Central) GitHub downloads the whole database, compresses it and encrypts it with your key.
- It keeps that copy for 30 days, under the repo's **Actions**, then **Daily backup**, then a run, then **Artifacts**.
- The repo is public, so only the encrypted file is stored and nothing is printed.
- It does nothing until the key is set.

**Turn it on:**
1. Make a long passphrase, such as 5 or 6 random words. Save it in your password manager: without it the backups can't be opened.
2. GitHub: the repo, then **Settings**, then **Secrets and variables**, then **Actions**, then **New repository secret**. Name it `BACKUP_KEY` and use the passphrase as the value.
3. Optional: **Actions**, then **Daily backup**, then **Run workflow**, to make the first one now.

**Open a backup (on a computer with a terminal):**
```
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in backup.json.gz.enc | gunzip > backup.json
```
It asks for the passphrase. `backup.json` is the whole database, with everything under `charts`.

**Restore:**
- Firebase console, then Realtime Database, then **Data**, then select the `charts` node, then the ⋮ menu, then **Import JSON**.
- Pick a file that contains only what's inside `charts`: open `backup.json` and keep the part inside `"charts": { … }`.
- Restoring replaces what's there now. The app's own **Download a backup** button (Parents page) makes the same kind of file, unencrypted.
