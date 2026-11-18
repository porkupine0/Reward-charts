#!/usr/bin/env bash
# Encrypted backup of the whole database (run daily by .github/workflows/backup.yml).
# Does nothing unless BACKUP_KEY is set. Never prints the data: it goes straight from the download
# through gzip into openssl, and only the encrypted file is written.
# Usage: BACKUP_KEY=... scripts/backup.sh [output file]   (DB_URL overrides the address in config.js)
set -euo pipefail
if [ -z "${BACKUP_KEY:-}" ]; then
  echo "No BACKUP_KEY secret is set, so no backup was made."
  exit 0
fi
here="$(cd "$(dirname "$0")/.." && pwd)"
url="${DB_URL:-$(grep -o "databaseURL: *['\"][^'\"]*" "$here/config.js" | sed "s/.*['\"]//")}"
out="${1:-backup.json.gz.enc}"
curl -sfS --max-time 120 "${url%/}/.json" | gzip -9 | openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:BACKUP_KEY -out "$out"
size=$(wc -c < "$out")
if [ "$size" -lt 64 ]; then echo "The backup came out empty."; rm -f "$out"; exit 1; fi
echo "Encrypted backup written: $size bytes."
