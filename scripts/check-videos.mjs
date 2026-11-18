// Confirms every video in the driving course with YouTube (oEmbed): it exists, and its title and channel
// match what the course says. Run before each new unit:  node scripts/check-videos.mjs
// oEmbed answers 401 when a video's owner turned off embedding (the page then shows the link only) and
// 404 (or 400) when the video is gone. Lengths aren't available from oEmbed; the course shows them as approximate.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
// (curl, so it works through a network proxy too)
const get = (url) => { const out = execFileSync('curl', ['-s', '--max-time', '20', '-w', '\n%{http_code}', url], { encoding: 'utf8' }); const i = out.lastIndexOf('\n'); return { status: Number(out.slice(i + 1)), body: out.slice(0, i) }; };
const V = JSON.parse(readFileSync(new URL('../version.json', import.meta.url))).v;
const { LESSONS } = await import('../driving-course.js?v=' + V);
const norm = (s) => String(s || '').replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
let bad = 0;
for (const l of LESSONS) for (const v of l.videos || []) {
  const url = 'https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + v.yt);
  let line;
  try {
    const r = get(url);
    if (r.status === 401) { line = 'NOT EMBEDDABLE (link only)'; }
    else if (r.status !== 200) { line = 'MISSING (' + r.status + ')'; bad++; }
    else {
      const j = JSON.parse(r.body), t = norm(j.title) === norm(v.title), c = norm(j.author_name) === norm(v.channel);
      line = t && c ? 'ok' : 'DIFFERS: "' + j.title + '" by ' + j.author_name;
      if (!(t && c)) bad++;
    }
  } catch (e) { line = 'NO ANSWER (' + e.message + ')'; bad++; }
  console.log(l.id + ' ' + v.yt + ' · ' + line + ' · ' + v.title + ' · ' + v.channel + ' · about ' + v.len);
}
console.log(bad ? bad + ' problem(s)' : 'all videos confirmed');
process.exit(bad ? 1 : 0);
