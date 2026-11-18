# Builds a browser test from full.js's setup (mock Firebase, page helpers) plus a body file.
# Usage: python3 tests/browser/mkcase.py tests/browser/cases/eli-days.body.js > /tmp/x.js && node /tmp/x.js
import sys, os
here = os.path.dirname(os.path.abspath(__file__))
s = open(os.path.join(here, 'full.js')).read()
head = s[:s.index("  const db = () =>")] + "  const db = () => p.evaluate(() => JSON.parse(sessionStorage.getItem('mockdb') || '{}'));\n"
body = open(sys.argv[1]).read()
print(head + body + "\n  const refused = await p.evaluate(() => JSON.parse(sessionStorage.getItem('refused') || '[]')).catch(() => []);\n  check(!refused.length, 'saves the database rules would refuse: ' + refused.join(', '));\n  console.log(notes.join('\\n')); console.log(errors.length ? errors.join('\\n') : 'NO ISSUES');\n  await b.close();\n})();")
