# Builds docs/driving-videos.json (every planned and spare video with its title, channel, length and notes,
# titles and channels from YouTube's oEmbed) and the units table in docs/driving-syllabus.md, from PLAN below.
# Also checks that every section of the Iowa manual is carried by at least one lesson day.
# Run: python3 scripts/build-video-plan.py   (needs network for oEmbed)
import json, re, subprocess, sys

# flags: IA = Iowa DOT or Iowa-made; CA = Canadian channel; UK; a US state name = that state's rules;
# 'check' = check first (chosen by title/search, may not fit; see its spare)
PLAN = [
 (1, 'Seeing the road', [
   ('Scanning the road', ['4.11'], [('nVWq4P1WMZQ', '10:18', '')]),
   ('Following distance', ['4.12'], [('ksxfBi7Z-Vk', '3:32', ''), ('ye-zGn9agys', '2:45', '')]),
   ('Blind spots, mirrors, head checks', ['3.2', '3.4'], [('uJ4w63wZyFQ', '5:45', 'CA')]),
   ('Intersections', ['5.1', '2.22'], [('v0Soc-kicOQ', '7:27', 'CA')])]),
 (2, 'Signs and signals', [
   ('Sign colors and shapes', ['2.1'], [('oEXDKnD756k', '7:52', '')]),
   ('Regulatory signs: stop vs yield', ['2.2'], [('oAEXSBJJqc4', '7:26', '')]),
   ('Warning, guide, service and route signs; slow-moving vehicles; pedestrian conveyances', ['2.3', '2.4', '2.5', '2.6', '2.7', '2.8'], [('jBZH_XA4FUE', '8:32', '')]),
   ('Signals, flashing arrows, pedestrian beacons; sight-impaired walkers', ['2.9', '2.20', '2.21'], [('fBncqaoT3_4', '4:41', ''), ('5nlBLyUBjVM', '1:17', 'IA'), ('kum6w2BH1zc', '1:15', 'IA')])]),
 (3, 'Markings and lanes', [
   ('Pavement markings, yield lines, crosswalks', ['2.12', '2.13', '2.14'], [('JNK2037-WCk', '5:49', '')]),
   ('Reversible, shared left-turn and reserved lanes', ['2.15', '2.16', '2.17', '2.18'], [('ZRDw6RmQ-y4', '6:05', '')]),
   ('Bike lanes and sharing the road with bicyclists', ['2.19', '5.11'], [('9KHhHqb9_E0', '9:40', '')]),
   ('Changing lanes', ['4.9'], [('JaUZJsEyRV4', '7:57', '')])]),
 (4, 'Right of way and Iowa intersections', [
   ('Who goes first: stops and intersections without signs', ['2.22'], [('7MODqVaQVuY', '4:48', ''), ('3bYMB7q6khs', '4:05', '')]),
   ('Turns, pedestrians, motorcycles and driveways', ['2.22', '5.1', '5.10', '5.11'], [('ZdSCgNm4atQ', '12:05', '')]),
   ('Roundabouts', ['5.5'], [('cvdkJnA3QgY', '3:08', 'IA'), ('peUf2NRdWxs', '2:16', '')]),
   ('Reduced-conflict intersections and the diverging diamond', ['5.3', '5.4'], [('xOqMwNLKKto', '3:44', 'IA'), ('bxkur5Wl4Ok', '4:30', 'IA')])]),
 (5, 'Speed, stopping and turning', [
   ('Speed', ['4.5'], [('SP29Xuu-GL4', '12:18', '')]),
   ('Accelerating, steering, curves', ['4.3', '4.6'], [('QasVsrpssn0', '8:52', '')]),
   ('Turning and signaling', ['4.8', '4.13'], [('mIrcBU-OXIk', '11:28', '')]),
   ('Braking, stopping distance, tailgating', ['4.4', '4.12'], [('QhGMm4aKWxc', '3:25', '')])]),
 (6, 'Highways and passing', [
   ('Merging onto a freeway', ['5.2'], [('dYUxQPrpCsY', '9:07', 'CA')]),
   ('Interstate driving, zipper merge', ['5.2'], [('vLVMW8KnfBE', '3:01', 'Minnesota'), ('enBI_nJ8xqE', '4:49', 'CA')]),
   ('Two-lane highways', ['4.11'], [('jUmB7aQ3S10', '9:32', 'CA')]),
   ('Passing', ['4.10'], [('QRQhb6Nlqnw', '13:32', 'CA')])]),
 (7, 'Sharing the road', [
   ('School buses', ['2.24'], [('06ertMlQ8Ig', '1:53', 'IA (Quad Cities news)'), ('dOjXX0dZx3s', '4:48', 'check: general US, Iowa rules may differ')]),
   ('Emergency vehicles, Move Over; after a crash, Steer It-Clear It', ['2.23', '2.27', '2.28', '5.15'], [('r2MYCsumOnI', '2:51', 'IA'), ('_4DApIKjEI0', '1:38', ''), ('ljjGN6xST_A', '1:14', '')]),
   ('Large trucks and farm equipment', ['5.9'], [('rHNUZn4e1ps', '4:19', ''), ('j_FfI8TDOD0', '1:54', '')]),
   ('Motorcycles, bicycles, hot cars', ['5.10', '5.12'], [('2gDCHSsOxmM', '8:14', 'check')])]),
 (8, 'Railroad, work zones, parking', [
   ('Railroad crossings', ['2.10'], [('Q33u7SSAPbk', '10:53', '')]),
   ('Work zones', ['2.11'], [('6aOHMHipXXk', '7:32', 'Pennsylvania')]),
   ('Backing up and reverse parking (family rule: back into every space)', ['4.7'], [('wBibYMNMatI', '5:49', ''), ('cWHj9EC9B1o', '7:08', '')]),
   ('Parking rules and parallel parking', ['2.25', '2.26'], [('2W-5VvXcwT0', '4:32', '')])]),
 (9, 'Night, weather, rural Iowa', [
   ('Headlights and night driving', ['5.7'], [('_SSInig5Fxc', '3:21', ''), ('VkHxit723uM', '3:06', '')]),
   ('Rain and hydroplaning', ['5.13'], [('k6kxcZkE7DY', '4:32', 'IA'), ('TdwuftIUwYY', '4:39', '')]),
   ('Snow, ice, skids, snowplows', ['5.13'], [('7t_sYFBYCKs', '5:14', ''), ('a3PQD_tv-bk', '1:12', ''), ('6RTam4qXIus', '1:12', 'IA')]),
   ('Gravel roads, deer, leaving the road', ['5.6', '5.8'], [('Ty9pHFD8TWU', '3:57', 'IA, check: may be about road design; spare bBoOslis3lk'), ('xJBfYBtqkZE', '1:01', ''), ('uMS1PClnAJQ', '3:09', '')])]),
 (10, 'The driver and the car', [
   ('Phones and distractions', ['3.7'], [('-gB4m2LN9TU', '6:25', '')]),
   ('Alcohol and drugs', ['3.8'], [('UgaT6n1N9mA', '10:13', ''), ('6zl4dmpy0WQ', '3:09', 'North Dakota')]),
   ('Drowsy driving, seat belts, loose objects; Iowa permit and license rules (GDL), 511', ['3.5', '3.6', '3.9', '1.1', '1.2', '1.3', '3.10'], [('KdN-gySbNlw', '9:47', ''), ('tbRC0BXi108', '1:26', 'check: not Iowa-specific; Iowa rules from Iowa DOT pages')]),
   ('The car: checks, warning lights, driver-assist; brake failure; pulled over by police', ['3.1', '3.3', '4.1', '4.2', '5.14', '5.16'], [('SzBO1CkIP8M', '1:40', ''), ('DswOF-reMRo', '2:08', 'CA'), ('6LrbFAvX4cA', '1:55', 'CA'), ('C_t-AOUrm0w', '1:55', 'IA (Des Moines news)')])]),
 (11, 'Final week', [
   ('Iowa practice questions + 5 questions', [], [('yrIxUbBuB7Q', '13:50', 'check: third-party quiz, answers may be wrong or not Iowa')]),
   ('Iowa DOT online practice test + 5 questions', [], []),
   ('Iowa road signs + 5 questions', [], [('owwsk636beU', '11:48', 'check: third-party quiz, answers may be wrong or not Iowa')]),
   ('Iowa DOT online practice test + 5 questions', [], [])]),
]
SPARES = [('-olqiG42Ud4', '9:47', 'Washington'), ('XnOjL1ZDJqk', '6:35', 'CA'), ('l-GeRRVvT14', '6:33', 'IA, check: may be about road design'), ('CdDBJoxHLGE', '4:38', 'CA'), ('tpykT-JU7PM', '6:47', ''), ('Y3jcQCdeJAs', '6:28', ''), ('LOPkiGCFo_Y', '4:34', 'check: survival-show style'), ('bBoOslis3lk', '8:06', 'CA'), ('Cz08eArGuvc', '0:51', ''), ('Q0-7rwnnJQs', '14:06', 'Michigan'),
  ('fba8OgJpWGI', '3:55', ''), ('ym4VOPoda4w', '6:20', 'North Carolina'), ('lWMg2IEtQT8', '8:01', ''), ('uIkanxT72KI', '1:43', 'Michigan'),
  ('lPPJ7S-ZLQE', '1:49', 'IA'), ('cTtEbLoJHyY', '11:58', ''), ('kxQHoBmjp4U', '13:01', ''), ('dWKsDvFBo6M', '12:34', ''),
  ('EJQQxcpQWE0', '0:31', 'IA'), ('xMutekpY0cs', '2:43', 'hazard-spotting'), ('oXh0uS9BHUo', '2:43', 'hazard-spotting'), ('-dQoLfMd-SI', '2:16', 'hazard-spotting')]

def oembed(i):
    out = subprocess.run(['curl', '-s', '-m', '20', '-w', '\n%{http_code}', 'https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=' + i], capture_output=True, text=True).stdout
    body, code = out.rsplit('\n', 1)
    if code != '200': return None
    j = json.loads(body); return j['title'], j['author_name']

def vid(i, ln, fl):
    o = oembed(i)
    if not o: sys.exit('video not found or not embeddable: ' + i)
    return {'yt': i, 'title': o[0], 'channel': o[1], 'len': ln, 'notes': fl}

data = {'units': [{'unit': u, 'title': t, 'days': [{'day': d + 1, 'topic': top, 'sections': secs, 'videos': [vid(*v) for v in vs]} for d, (top, secs, vs) in enumerate(days)]} for u, t, days in PLAN],
        'spares': [vid(*v) for v in SPARES]}
json.dump(data, open('docs/driving-videos.json', 'w'), indent=1, ensure_ascii=False)

# every manual section is carried by a lesson day
man = open('docs/iowa/drivers-manual.txt').read()
toc = man[man.index('1.1 Who'):man.index('1.1 WHO')]
secs = sorted(set(re.findall(r'^(\d\.\d+) ', toc, flags=re.M)), key=lambda x: [int(n) for n in x.split('.')])
have = {s for u in data['units'] for d in u['days'] for s in d['sections']}
missing = [s for s in secs if s not in have]
if missing: sys.exit('manual sections with no lesson day: ' + ', '.join(missing))

# the units table in the plan
cell = lambda d: d['topic'] + (' (' + ', '.join(d['sections']) + ')' if d['sections'] else '') + ': ' + ' + '.join(
    v['yt'] + ' (' + v['len'] + (', ' + v['notes'] if v['notes'] else '') + ')' for v in d['videos'])
rows = ['| Unit | Topic | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 |', '|---|---|---|---|---|---|---|']
for u in data['units']:
    last = 'Unit test' + ('; then **progress test** (new form)' if u['unit'] in (2, 4, 6, 8) else '')
    if u['unit'] == 1: last = 'Unit 1 test'
    if u['unit'] == 11: last = '**Final knowledge test** (new form)'
    days = [(cell(d) if d['videos'] else d['topic']) for d in u['days']]
    rows.append('| ' + str(u['unit']) + ' | ' + u['title'] + (' (**built**, days 1–4)' if u['unit'] == 1 else '') + ' | ' + ' | '.join(days) + ' | ' + last + ' |')
doc = open('docs/driving-syllabus.md').read()
a, b = doc.index('<!-- units -->'), doc.index('<!-- /units -->')
doc = doc[:a] + '<!-- units -->\n' + '\n'.join(rows) + '\n' + doc[b:]
open('docs/driving-syllabus.md', 'w').write(doc)
secs_of = lambda ln: int(ln.split(':')[0]) * 60 + int(ln.split(':')[1])
for u in data['units']:
    for d in u['days']:
        t = sum(secs_of(v['len']) for v in d['videos'])
        if t < 180 or t > 600: print('  unit %d day %d (%s): %d:%02d of video' % (u['unit'], d['day'], d['topic'], t // 60, t % 60))
n = sum(len(d['videos']) for u in data['units'] for d in u['days'])
print('planned videos', n, 'spares', len(data['spares']), 'lesson days', sum(len(u['days']) for u in data['units']),
      'IA', sum(1 for u in data['units'] for d in u['days'] for v in d['videos'] if v['notes'].startswith('IA')))
