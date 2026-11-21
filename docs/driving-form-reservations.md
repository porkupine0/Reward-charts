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
`node scripts/fact-supply.mjs` lists every sentence and bullet of the manual and the two saved DOT pages that
states a number (82 on Nov 21), with the questions that already quote it, in docs/driving-fact-supply.json.
`node scripts/quote-report.mjs` lists shared quotes (docs/driving-quote-report.md).

## Shortfall policy (decided Nov 21)
- A fact may come back in a later form with a different stem, but never in consecutive forms (B then C, etc.).
  The baseline Form A facts may repeat from Form C on; Form B facts from Form D on.
- The forms quote the MANUAL only. The Iowa DOT permit/license pages (permit age 14, supervisors 21/25,
  passenger limits, the 6- and 12-month delays) belong in lessons (Unit 10), not the knowledge test, because the
  test is built from the manual.
- Trivia is not a test fact: crash statistics, technology descriptions, processing times, link expiry.

## Number facts reserved (page + verbatim quote; checked on the page pictures Nov 21 unless marked)
Topic in brackets. Quotes are the manual's words (the quote test checks them when the question is written).

**Form C**
1. p.20 [School buses] 'Stop no closer than 15 feet from the rear of the bus'
2. p.42 [Speed] '60 mph on all primary roads'
3. p.41 [Speed] 'At speeds of 40 mph, a four- to five-second following distance is recommended'
4. p.21 [Speed] 'Closer than 10 feet from a stop sign'
5. p.21 [Railroad] 'Closer than 50 feet from a railroad crossing'
6. p.37 [Alcohol] 'having a blood alcohol concentration (BAC) of .08 or higher'
7. p.60 [Highways] 'As little as 6 inches of water may sweep away a vehicle'
8. p.42 [Highways] 'On the interstate system there is a minimum speed of 40 mph'
9. p.63 [Highways] 'property damage of more than $1,500'

**Form D**
1. p.42 [Highways] '70 mph on rural interstate highways'
2. p.42 [Speed] '45 mph in any suburban district'
3. p.21 [Speed] 'Closer than 20 feet from a fire station entrance'
4. p.60 [Highways] 'increase your following distance to five or six seconds' (WET/SLIPPERY roads, not fog)
5. p.37 [Alcohol] 'an automatic one year revocation of your license'
6. p.42 [Speed] 'a vehicle traveling 60 mph will travel 3 times further than a vehicle traveling 30 mph'
7. p.61 [Highways] 'Snowplows typically operate at 25-35 mph'
8. p.24 [Speed] 'at least one red light on the back of the vehicle, and it should be visible for at least 500 feet'
9. p.63 [Highways] 'Failure to do so within 72 hours'

**Form E**
1. p.42 [Speed] '50 mph on unsurfaced secondary roads from sunset until sunrise'
2. p.42 [Speed] '45 mph for any vehicle pulling another vehicle'
3. p.37 [Alcohol] 'Being awake for 18 hours straight' (the figure caption)
4. p.40 [Speed] stopping distance (Figure 4.1; quote chosen at build; NOT yet image-checked)
5. p.42 [Speed] '25 mph in a residential district or school district' (Form A fact, repeated)
6. p.12 [Railroad] 'leave at least 15 feet between the front and rear of your vehicle and the nearest rail' (Form A fact)
7. p.25 [Speed] 'You must be able to see at least 200 feet behind you in your rearview mirror'
8. p.59 [Highways] 'can soar above 160 degrees in less than 10 minutes' (NOT yet image-checked)
9. p.24 [Speed] 'allow at least 70 percent of the light through'

**Form F**
1. p.37 [Alcohol] 'revoked for a minimum of 180 days if you operate while intoxicated'
2. p.49 [Highways] 'whenever visibility is 500 feet or less' (Form A fact)
3. p.43 [Speed] 'signal at least 100 feet before a turn' (Forms A and B fact)
4. p.19 [Emergency] 'Stay at least 500 feet behind any emergency vehicle' (Form B fact)
5. p.21 [Speed] 'Closer than five feet from a fire hydrant' (Form B fact)
6. p.61 [Highways] 'Stopping distances can be 10 times greater in ice and snow' (Form B fact)
7. p.25 [Speed] 'at least 10 inches between the steering wheel and your chest'
8. p.41 [Speed] 'A two-second following distance may be sufficient in normal conditions for an experienced driver'
9. p.34 [Speed] seat belt fines ('$50 fine per passenger and $100 per passenger under 18'; NOT yet image-checked)

Spares: p.24 'Dirt on the lenses can cut the light's effectiveness by 50 percent'; p.24 turn signals 'wider than
40 inches'; p.35 child restraint 'under six years old' (not image-checked); p.37 open container '$200 fine';
p.36 distracted driving death '$1,000 in fines'.

Not-number questions (16 per form) are chosen at build from the manual sections each topic covers, checked with
the quote report so a form does not reuse another form's fact.
