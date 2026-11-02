# Adds ?v=<version> to every local .js/.css reference so phones load fresh copies after each update.
import re, glob, time, sys
v = sys.argv[1] if len(sys.argv) > 1 else str(int(time.time()))
pat = re.compile(r"""((?:src|href)=["']|from\s+['"]|import\(\s*['"])(\./)?([\w-]+\.(?:js|css))(\?v=\w+)?(['"])""")
for f in glob.glob('*.html') + glob.glob('*.js'):
    s = open(f).read()
    n = pat.sub(lambda m: m.group(1) + (m.group(2) or '') + m.group(3) + '?v=' + v + m.group(5), s)
    if n != s: open(f, 'w').write(n)
print('stamped', v)
