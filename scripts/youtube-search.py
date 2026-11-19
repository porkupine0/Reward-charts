# Usage: python3 -I scripts/youtube-search.py "query" [n]  -> id | title | channel | length, from YouTube's search page.
# Pick videos with it, then confirm each with scripts/check-videos.mjs (oEmbed) and record it in docs/driving-videos.json.
import json, re, subprocess, sys, urllib.parse
q, n = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 8
url = 'https://www.youtube.com/results?hl=en&gl=US&search_query=' + urllib.parse.quote(q)
html = subprocess.run(['curl', '-s', '-m', '25', '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', '-H', 'Accept-Language: en-US', url], capture_output=True, text=True).stdout
m = re.search(r'var ytInitialData = (\{.*?\});</script>', html, re.S)
if not m:
    print('no data (' + str(len(html)) + ' bytes)'); sys.exit()
data = json.loads(m.group(1))
out = []
def walk(o):
    if isinstance(o, dict):
        if 'videoRenderer' in o:
            v = o['videoRenderer']
            t = ''.join(r.get('text', '') for r in v.get('title', {}).get('runs', []))
            ch = ''.join(r.get('text', '') for r in v.get('ownerText', {}).get('runs', []))
            ln = v.get('lengthText', {}).get('simpleText', '')
            out.append((v.get('videoId'), t, ch, ln))
        for x in o.values(): walk(x)
    elif isinstance(o, list):
        for x in o: walk(x)
walk(data)
for v in out[:n]: print(' | '.join(v))
