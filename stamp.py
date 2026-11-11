# Adds ?v=<version> to every local .js/.css reference so phones load fresh copies after each update.
import re, glob, time, sys
v = sys.argv[1] if len(sys.argv) > 1 else str(int(time.time()))
pat = re.compile(r"""((?:src|href)=["']|from\s+['"]|import\(\s*['"])(\./)?([\w-]+\.(?:js|css))(\?v=\w+)?(['"])""")
for f in glob.glob('*.html') + glob.glob('*.js'):
    s = open(f).read()
    n = pat.sub(lambda m: m.group(1) + (m.group(2) or '') + m.group(3) + '?v=' + v + m.group(5), s)
    if n != s: open(f, 'w').write(n)
print('stamped', v)

# Each page checks version.json (never cached) and reloads itself once if a newer version is live.
import json
json.dump({'v': v}, open('version.json', 'w'))
CHECK = ("<script>window.__V='%s';fetch('version.json?'+Date.now(),{cache:'no-store'}).then(function(r){return r.json()})"
         ".then(function(j){if(j.v!==window.__V){var u=new URL(location.href);if(u.searchParams.get('r')!==j.v){u.searchParams.set('r',j.v);location.replace(u)}}})"
         ".catch(function(){})</script>")
for f in glob.glob('*.html'):
    s = open(f).read()
    s = re.sub(r"<script>window\.__V='[^']*';.*?</script>\n?", '', s, flags=re.S)
    s = s.replace('<head>\n', '<head>\n' + (CHECK % v) + '\n', 1)
    open(f, 'w').write(s)
