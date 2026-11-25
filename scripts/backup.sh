#!/usr/bin/env bash
# Encrypted backup of the app's data (everything under charts/), run daily by .github/workflows/backup.yml.
# Does nothing unless BACKUP_KEY is set. Never prints the data: it goes straight from the download
# through gzip into openssl, and only the encrypted file is written.
# It reads charts/ in one request; if the database refuses that (rules that allow each chart but not the
# whole node), it reads each chart the app uses and joins them. The result is what docs/database-safety.md
# imports into the charts node to restore.
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
download() {
  if fetch "$url/charts.json" 2>/dev/null; then return 0; fi
  echo "Reading charts/ as a whole was refused; reading each chart." >&2
  printf '{'
  local first=1 c body
  for c in $CHARTS; do
    body="$(fetch "$url/charts/$c.json")" || { echo "Could not read charts/$c." >&2; return 1; }
    [ "$first" = 1 ] || printf ','
    first=0
    printf '"%s":%s' "$c" "$body"
  done
  printf '}'
}
download | gzip -9 | openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:BACKUP_KEY -out "$out"
size=$(wc -c < "$out")
if [ "$size" -lt 64 ]; then echo "The backup came out empty."; rm -f "$out"; exit 1; fi
echo "Encrypted backup written: $size bytes."
