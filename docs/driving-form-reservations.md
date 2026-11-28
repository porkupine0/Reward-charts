# Knowledge-test Forms C-F: groundwork (Nov 21, 2026)

Input for building Forms C and D (Nov 25) and E and F (Dec 1). Form A (the baseline he took Nov 20) is frozen
(a test pins it); Form B is the progress test after unit 2.

## Demand
Each form: 25 questions, the BLUEPRINT per topic (Signs 4, Signals and markings 2, Right of way 1, School buses
and emergency vehicles 4, Railroad crossings and work zones 2, Alcohol and phones 1, Speed, turns, passing and
lights 7, Highways, weather and road types 4), 8-10 number questions (checkTests), 4 choices, no stem shared with
a lesson or another form.

| | C | D | E | F | Total |
|---|---|---|---|---|---|
| Questions | 25 | 25 | 25 | 25 | 100 |
| Number questions (8-10) | 9 | 9 | 9 | 9 | 36 |
| Sign questions (Signs topic, drawn shape) | 4 | 4 | 4 | 4 | 16 |

Signs: signs.js has 9 shapes (octagon, yield, rectangle, pennant, diamond, circle, pentagon, crossbuck, smv);
Forms A-B used pentagon x2, octagon, circle, smv, crossbuck, diamond x2. 16 more sign questions can't all be new
shapes: the shape repeats, the meaning asked differs (e.g. diamond: curve ahead / deer / slippery when wet).
No two sign questions in one form may ask the same shape.

## Supply (mechanical)
The quote report under-reports (tA16 and tB16 share a p.43 sentence but quote different words): use
fact-supply's `used` list as the "already used" source.

`node scripts/fact-supply.mjs` lists every sentence and bullet of the manual and the two saved DOT pages that
states a number (82 on Nov 21), with the questions that already quote it, in docs/driving-fact-supply.json.
`node scripts/quote-report.mjs` lists shared quotes (docs/driving-quote-report.md).

## Shortfall policy (decided Nov 21)
- A fact may come back in a later form with a different stem, but never in consecutive forms (B then C, etc.).
  The baseline Form A facts may repeat from Form C on; Form B facts from Form D on.
- The forms quote the MANUAL only (checkTests enforces it). The Iowa DOT permit/license pages (permit age 14, supervisors 21/25,
  passenger limits, the 6- and 12-month delays) belong in lessons (Unit 10), not the knowledge test, because the
  test is built from the manual (confirmed Nov 21: none of the 68 DOT practice questions asks a permit or license rule; docs/iowa/dot-practice-stems.txt).
- Trivia is not a test fact: crash statistics, technology descriptions, processing times, link expiry.

## Number facts reserved (page + verbatim quote; checked on the page pictures Nov 21 unless marked)
Topic in brackets. Quotes are the manual's words (the quote test checks them when the question is written).

**Form C**
1. p.20 [School buses] 'Stop no closer than 15 feet from the rear of the bus'
2. p.42 [Speed] '60 mph on all primary roads'
3. p.41 [Speed] 'At speeds of 40 mph, a four- to five-second following distance is recommended'
4. p.21 [Speed] 'Closer than 10 feet from a stop sign'
5. p.21 [Speed] 'Closer than 50 feet from a railroad crossing'
6. p.37 [Alcohol] 'having a blood alcohol concentration (BAC) of .08 or higher'
7. p.60 [Highways] 'As little as 6 inches of water may sweep away a vehicle'
8. p.42 [Speed] 'On the interstate system there is a minimum speed of 40 mph'
9. p.63 [Highways] 'property damage of more than $1,500'

**Form D**
1. p.42 [Speed] '70 mph on rural interstate highways'
2. p.42 [Speed] '45 mph in any suburban district'
3. p.21 [Speed] 'Closer than 20 feet from a fire station entrance'
4. p.60 [Highways] 'increase your following distance to five or six seconds' (WET/SLIPPERY roads, not fog)
5. p.37 [Alcohol] 'an automatic one year revocation of your license'
6. p.42 [Speed] 'a vehicle traveling 60 mph will travel 3 times further than a vehicle traveling 30 mph'
7. p.61 [Highways] 'Snowplows typically operate at 25-35 mph'
8. p.24 [Speed] 'at least one red light on the back of the vehicle, and it should be visible for at least 500 feet'
9. p.63 [Highways] 'Failure to do so within 72 hours'

**Form E** (provisional until built)
1. p.42 [Speed] '50 mph on unsurfaced secondary roads from sunset until sunrise'
2. p.42 [Speed] '45 mph for any vehicle pulling another vehicle'
3. p.37 [Alcohol] 'Being awake for 18 hours straight' (the figure caption; drowsy driving compared with BAC .08: a stretch for this topic, swap for the open-container '$200 fine' if a reviewer objects)
4. p.40 [Speed] stopping distance (Figure 4.1; quote chosen at build; NOT yet image-checked)
5. p.42 [Speed] '25 mph in a residential district or school district' (Form A fact)
6. p.12 [Railroad] 'leave at least 15 feet between the front and rear of your vehicle and the nearest rail' (Form A fact)
7. p.24 [Speed] 'Dirt on the lenses can cut the light's effectiveness by 50 percent'
8. p.20 [School buses] 'you must slow your vehicle to no more than 20 mph' (Form A fact)
9. p.46 [Speed] 'Do not pass within 100 feet of a railroad crossing' (Form B fact; NOT yet image-checked)

**Form F** (provisional until built)
1. p.37 [Alcohol] 'revoked for a minimum of 180 days if you operate while intoxicated'
2. p.49 [Speed] 'whenever visibility is 500 feet or less' (Form A fact)
3. p.43 [Speed] 'signal at least 100 feet before a turn' (Forms A and B fact)
4. p.19 [School buses] 'Stay at least 500 feet behind any emergency vehicle' (Form B fact)
5. p.21 [Speed] 'Closer than five feet from a fire hydrant' (Form B fact)
6. p.61 [Highways] 'Stopping distances can be 10 times greater in ice and snow' (Form B fact)
7. p.41 [Speed] 'A two-second following distance may be sufficient in normal conditions for an experienced driver'
8. p.41 [Speed] 'a following distance of six or more seconds is recommended'
9. p.20 [School buses] 'suspended for up to 180 days' (Form B fact)

Topic homes follow Forms A-B: parking (p.21), speed limits (p.42), signalling (p.43) and headlights (p.49) were
asked under Speed, turns, passing and lights; chapter 5 (p.51-61) under Highways, weather and road types.
Chapter 3 vehicle facts with no topic home in Forms A-B (mirror 200 ft, window tint 70 percent, air bag 10
inches, seat-belt fines, the hot car) are spares for lessons, not the forms.

Spares: p.24 turn signals 'wider than
40 inches'; p.35 child restraint 'under six years old' (not image-checked); p.37 open container '$200 fine';
p.36 distracted driving death '$1,000 in fines'.

Not-number questions (16 per form) are chosen at build from the manual sections each topic covers, checked with
the quote report so a form does not reuse another form's fact.

## Decided Nov 21: tA16 and tB16
Both come from the same p.43 sentence (signal 100 feet before a turn at 45 mph or less; 300 feet above 45 mph),
in consecutive forms. Kept: they ask different numbers for different speeds (tA16: 45 mph or less, 100 feet;
tB16: 55 mph, 300 feet), and Form A can't change. The rule from here: "never in consecutive forms" means the same
number for the same case; another number from the same sentence may follow.

## Nov 25: changes after rebuilding Form B
- Form B took three reserved facts (it's taken first, about Dec 4): p.20 bus 15 feet and p.42 interstate minimum
  40 mph (were Form C items 1 and 8), p.42 50 mph unsurfaced at night (was Form E item 1). Under the consecutive-forms
  rule they can't be in Form C; refill C from the spares when C is built (p.24 dirt 50 percent; p.37 open
  container $200 is Alcohol, which already has its one slot, so prefer a Speed or Highways spare).
- Number-question quota settled (C8): Form A, his baseline, has 9 number questions by hand count (tA04, tA08,
  tA12, tA14, tA15, tA16, tA18, tA19, tA24; its `num` flags were never set). The DOT practice test has about 5 in
  66, but every form is compared with Form A, so the 8-10 rule stays.
- New test: consecutive forms may not repeat a number on the same page, state the next form's answer in an
  explanation, or quote the same manual words (Eli can read every explanation after a test). It can't catch a
  repeat in different words (the old tB08 repeated tA09's "from behind, you always stop"): the blind check must.

## Nov 28: thin topics allocated across Forms C-F (school buses/emergency 4 per form, railroad/work zones 2)
Already used: A: tA08 amber from the front 20 mph, tA09 four-lane meeting from the front, tA10 pull right for an
emergency vehicle (its explanation adds "drive through an intersection first"), tA11 move over (its explanation
lists tow/maintenance/hazard lights), tA12 15 feet from the rail, tA13 orange work-zone signs. B: tB08 15 feet
behind the bus, tB09 500 feet behind an emergency vehicle, tB10 180-day suspension, tB11 three lanes or fewer all
stop, tB12 45-degree angle toward the train, tB13 fines double.

| Form | School buses and emergency (4) | Railroad and work zones (2) |
|---|---|---|
| C | p.20 stay stopped until the arm is in and the bus moves; p.19 divided by a median, the other side needn't stop; p.22 move-over violation: suspension up to one year (number); p.20 from behind, never pass while red or amber lights flash | p.14 arrow boards: a lane or shoulder is closed; p.12 passive crossing (crossbuck only): slow down, look, expect a train |
| D | p.20 amber lights: the bus is about to stop (DOT 59); p.22 Steer It-Clear It: a crash with no injuries, move the car out of the lanes; p.20 a four-lane road from behind: stop (B's tB08 is distance, not this); p.19 emergency vehicle at an intersection: drive through first, then pull over | p.14 flaggers: follow their stop/slow paddle; p.12 never stop on the tracks |
| E | p.20 loading sequence: amber, then red and the arm (DOT 49); p.22 move over: no speed set, it must be reasonable; p.20 two-lane with a centre turn lane, meeting: stop; p.19 emergency vehicle: don't follow closely (500 ft, A/B-free by then) | p.14 channelizing devices (cones, drums, barricades) guide you; p.12 school buses and hazmat vehicles stop 15-50 feet before crossings |
| F | p.22 move over also for a car with hazard lights on; p.20 three lanes or fewer: everyone stops (B fact, F not consecutive); p.19 pull right for an emergency vehicle (A fact); p.20 180-day suspension (B fact) | p.14 work zones: increase following distance; p.12 trains are wider than the tracks (A's explanation; F not consecutive to A) |

Form C numbers after Form B took two: 60 mph primary roads (p.42), 4-5 seconds at 40 mph (p.41), 10 feet from a
stop sign (p.21), 50 feet from a railroad crossing (p.21), BAC .08 (p.37), 6 inches of water (p.60), $1,500 crash
report (p.63), move-over suspension up to one year (p.22), 20 feet from a fire station entrance (p.21, from D's
list). That's 9. Signs for C: shapes no earlier form asked or explained: a diamond (merging traffic? no: unit 2
asks it; use a work-zone or warning diamond meaning) and the coloured rectangles (green, blue, brown).

