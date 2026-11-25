#!/usr/bin/env bash
# Encrypted backup of the app's data (everything under charts/), run daily by .github/workflows/backup.yml.
# Does nothing unless BACKUP_KEY is set. Never prints the data: it is held in memory, checked, then goes through
# gzip into openssl, and only the encrypted file is written.
# It reads charts/ in one request; if the database refuses that (rules that allow each chart but not the
# whole node), it reads each chart the app uses and joins them. The result is what docs/database-safety.md
# imports into the charts node to restore. Before encrypting it checks the data is a JSON object holding
# "routines", and prints only how many charts it holds.
# Usage: BACKUP_KEY=... scripts/backup.sh [output file]   (DB_URL overrides the address in config.js)
set -euo pipefail
if [ -z "${BACKUP_KEY:-}" ]; then
  echo "No BACKUP_KEY secret is set, so no backup was made."
  exit 0
fi
here="$(cd "$(dirname "$0")/.." && pwd)"
url="${DB_URL:-$(grep -o "databaseURL: *['\"][^'\"]*" "$here/config.js" | sed "s/.*['\"]//")}"
url="${url%/}"
out="${1:-backup.json.gz.enc}"
# every chart the app reads or saves (keep in step with watch()/save() calls and database.rules.json)
CHARTS="routines config settings eli trombone zay isaiah eli-run eli-drive eli-trials"
fetch() { curl -sfS --max-time 120 "$1"; }
data=""
if data="$(fetch "$url/charts.json" 2>/dev/null)"; then :; else
  echo "Reading charts/ as a whole was refused; reading each chart."
  data='{'; first=1
  for c in $CHARTS; do
    body="$(fetch "$url/charts/$c.json")" || { echo "Could not read charts/$c."; exit 1; }
    [ "$first" = 1 ] || data="$data,"
    first=0
    data="$data\"$c\":$body"
  done
  data="$data}"
fi
# check it before encrypting: a JSON object with the daily logs in it (prints only the count of charts)
count="$(printf '%s' "$data" | python3 -c 'import json,sys
d=json.load(sys.stdin)
assert isinstance(d, dict) and isinstance(d.get("routines"), dict), "no routines"
print(len(d))')" || { echo "The data read back isn't a complete set of charts; no backup written."; exit 1; }
printf '%s' "$data" | gzip -9 | openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:BACKUP_KEY -out "$out"
size=$(wc -c < "$out")
if [ "$size" -lt 64 ]; then echo "The backup came out empty."; rm -f "$out"; exit 1; fi
echo "Encrypted backup written: $size bytes, $count charts."
