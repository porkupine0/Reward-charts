// APPEND ONLY: never reorder or remove lessons, and add new questions only at the END of a lesson's list
// (the first 3 are that day's quiz). Past days (his streak) are rebuilt from this order.
// Eli's driving course content. Each lesson is checked by checkCourse() in driving.js, every question's
// quote is checked against the saved Iowa Driver's License Manual (docs/iowa/drivers-manual.txt, page
// numbers as printed), and a parent previews and approves each lesson before Eli sees it.
// Video titles and channels were confirmed with YouTube (scripts/check-videos.mjs); lengths are approximate.

const q = (id, question, choices, answer, why, page, quote) => ({ id, q: question, choices, answer, why, ref: "Iowa Driver's Manual p." + page, quote });
// A key point (shown above the video): the fact in a few words, with the manual page and quote it comes from.
// A family rule that isn't in the manual: fam(text), shown as "Family rule" and never quizzed.
const k = (text, page, quote) => ({ t: text, ref: "Iowa Driver's Manual p." + page, quote });
// eslint-disable-next-line no-unused-vars
const fam = (text) => ({ t: text, family: true });

// Lesson days in the whole plan (docs/driving-syllabus.md): while LESSONS is shorter, the page says more are coming.
export const PLANNED = 55;

export const LESSONS = [
  {
    id: 'w1d1', title: 'Look ahead: scanning the road',
    key: [k('Scan 20 to 30 seconds ahead, and check your mirrors often.', 47, 'Check your mirrors frequently and scan conditions 20 to 30 seconds ahead of you.'),
      k('Expect other drivers to make mistakes, like running a red light.', 47, 'Assume that drivers will run through red lights or stop signs and be prepared to react.'),
      k('Always leave yourself an escape route.', 47, 'always leave yourself an out')],
    videos: [{ yt: 'nVWq4P1WMZQ', title: 'Vision in Driving - How to Scan Your Surroundings Correctly', channel: 'Zutobi Drivers Ed', len: '10:18',
      iowa: 'Iowa’s manual says to check your mirrors often and scan conditions 20 to 30 seconds ahead of you, keeping your eyes moving.' }],
    questions: [
      q('w1d1q1', 'How far ahead does Iowa’s manual say to scan conditions while you drive?', ['About 5 seconds ahead', '20 to 30 seconds ahead', 'Only to the car in front of you', 'As far as your headlights reach'], 1,
        'The manual says to keep your eyes moving, so you’re aware and ready for whatever happens.', 47, 'Check your mirrors frequently and scan conditions 20 to 30 seconds ahead of you.'),
      q('w1d1q2', 'Another driver near you is driving aggressively. What does the manual say to do?', ['Speed up to get away from them', 'Slow down or pull over to avoid them', 'Honk so they know you see them', 'Stay close so they can’t cut in'], 1,
        'Give an aggressive driver room; you can’t control them, only the space around you.', 47, 'If another driver is showing signs of aggressive driving, slow down or pull over to avoid them.'),
      q('w1d1q3', 'You have a green light. What should you assume about drivers on the cross street?', ['They will always stop for their red light', 'They will wave you through', 'One might run the red light, so be ready to react', 'Nothing; the green light protects you'], 2,
        'Defensive driving means not depending on other drivers to do the right thing.', 47, 'Assume that drivers will run through red lights or stop signs and be prepared to react.'),
      q('w1d1q4', 'What is the “escape route” the manual tells you to always leave yourself?', ['A place to move your vehicle if your path is suddenly blocked', 'The fastest way home', 'The shoulder you use to pass slow cars', 'The nearest exit ramp'], 0,
        'If the car ahead stops suddenly, having somewhere to go can keep you out of a crash.', 47, 'a place to move your vehicle if your immediate path of travel is suddenly blocked'),
      q('w1d1q5', 'Besides other cars, what does the manual say to keep an eye on along the road?', ['Only traffic lights', 'Billboards and signs', 'Pedestrians, bicyclists, and animals', 'Nothing else; watch the cars'], 2,
        'People, bikes and animals can move into the road quickly; scanning catches them early.', 47, 'Also, keep an eye on pedestrians, bicyclists, and animals along the road.'),
      q('w1d1q6', 'How many serious crashes does the manual say are due to dangerous choices or errors people make behind the wheel?', ['About 25 percent', 'About half', '94 percent', 'Almost none; most are bad luck'], 2,
        'Almost every serious crash comes down to a driver’s choice or mistake, which is why defensive driving works.', 47, '94 percent of serious crashes are due to dangerous choices or errors people make behind the wheel.'),
      q('w1d1q7', 'A driver near you is driving so dangerously that you’re worried. What does the manual suggest?', ['Try to get off the road by turning right or taking the next exit, if it’s safe', 'Follow them to read their license plate', 'Pass them as fast as you can', 'Flash your headlights at them'], 0,
        'Put distance between you and them; don’t engage.', 47, 'try to get off the roadway by turning right or taking the next exit if it’s safe to do so.')
    ]
  },
  {
    id: 'w1d2', title: 'Space ahead: following distance',
    key: [k('New drivers: stay at least 3 seconds behind; 6 or more when it’s slippery or your view is blocked.', 41, 'An inexperienced or beginning driver should maintain at least a three-second following distance under normal driving conditions.'),
      k('To count it: when the car ahead passes a sign, start counting slowly.', 41, 'Watch the vehicle ahead of you pass a landmark, such as a sign, and begin slowly counting.'),
      k('Tailgated? Move slightly right and signal early.', 48, 'If you are being tailgated, move slightly to the right')],
    videos: [
      { yt: 'ksxfBi7Z-Vk', title: 'How To Set & Maintain A Safe Following Distance When Driving - The 3 Second Rule Saves Lives', channel: 'Stan Cravens', len: '3:32',
        iowa: 'Iowa uses a 3- to 4-second rule. As a new driver, keep at least three seconds in normal conditions, and six or more when the road is slippery or your view ahead is blocked.' },
      { yt: 'ye-zGn9agys', title: 'Intermediate Roads: Space Cushion', channel: 'TeenDrivingPlan', len: '2:45' }
    ],
    questions: [
      q('w1d2q1', 'You’re a new driver on a dry road in normal traffic. What’s the least following distance the manual says to keep?', ['One second', 'Two seconds', 'At least three seconds', 'Ten seconds'], 2,
        'Beginners need extra time to notice and react, so the manual asks for at least three seconds.', 41, 'An inexperienced or beginning driver should maintain at least a three-second following distance under normal driving conditions.'),
      q('w1d2q2', 'The road is slippery. What following distance does the manual recommend?', ['Two seconds', 'Three seconds', 'Six or more seconds', 'It doesn’t matter if you drive slowly'], 2,
        'On slippery roads you need much more room to stop.', 41, 'When road conditions are slippery or the vehicle in front of you blocks your view, a following distance of six or more seconds is recommended.'),
      q('w1d2q3', 'How do you check your following distance?', ['Count car lengths', 'When the car ahead passes a landmark, start counting; you shouldn’t reach it before “three”', 'Look at your speedometer', 'Wait until the car ahead brakes'], 1,
        'Your front bumper shouldn’t pass the landmark before you’ve counted to three.', 41, 'Watch the vehicle ahead of you pass a landmark, such as a sign, and begin slowly counting.'),
      q('w1d2q4', 'Someone is tailgating you. What does the manual suggest?', ['Move slightly to the right and signal early for turns, stops, or lane changes', 'Brake hard so they back off', 'Speed up to get away', 'Stop in your lane'], 0,
        'The manual adds: try slowing down and encouraging the driver behind you to pass.', 48, 'If you are being tailgated, move slightly to the right and give the tailgater a better view of what is ahead and signal early for turns, stops, or lane changes.'),
      q('w1d2q5', 'Why do faster speeds need more following distance?', ['Higher speeds require greater stopping distances', 'Fast cars have weaker brakes', 'It only matters at night', 'They don’t; distance is the same at any speed'], 0,
        'The faster you go, the farther you travel before you can stop.', 48, 'Higher speeds require greater stopping distances.'),
      q('w1d2q6', 'You spot a slow farm vehicle far ahead. Why does spotting it early help?', ['You can honk at it sooner', 'You can pass it on the shoulder', 'It doesn’t; brake hard when you reach it', 'You have time to change lanes or slow down safely'], 3,
        'Slowing suddenly can cause a crash; seeing it early gives you time.', 48, 'If you spot these vehicles early, you have time to change lanes or slow down safely.'),
      q('w1d2q7', 'According to the manual, when are roads safest?', ['When some cars go well below the speed of traffic', 'When all vehicles travel the same speed without going over the limit', 'When drivers weave to pass slower cars', 'When you drive faster than traffic to stay ahead'], 1,
        'Cars going faster or slower than the flow cause more lane changes, passing and tailgating.', 48, 'The safest roadways are when all vehicles travel the same speed but do not exceed the speed limit.')
    ]
  },
  {
    id: 'w1d3', title: 'Blind spots and mirrors',
    key: [k('Blind spots are areas your mirrors can’t show.', 34, 'Blind spots are areas outside your vehicle that cannot be seen using mirrors.'),
      k('Before changing lanes: mirrors, then look over your shoulder (wheel straight).', 44, 'Look over your shoulder in the direction you plan to move.'),
      k('Don’t ride beside trucks and buses: their blind spots are big.', 34, 'These vehicles have large blind spots and it is hard for them to see you.')],
    videos: [{ yt: 'uJ4w63wZyFQ', title: 'How to Shoulder (Head) Check When Turning & Changing Lanes', channel: 'Smart Drive Test', len: '5:45',
      iowa: 'Iowa’s manual: blind spots are areas you can’t see in your mirrors. Look over your shoulder before changing lanes, and never stay alongside a truck or bus. (This channel may not be from the US: listen for km/h or rules that differ.)' }],
    questions: [
      q('w1d3q1', 'What is a blind spot?', ['An area outside your vehicle that can’t be seen using your mirrors', 'A dark spot on the windshield', 'The inside of the trunk', 'A stretch of road with no streetlights'], 0,
        'That’s why mirrors alone aren’t enough before you change lanes.', 34, 'Blind spots are areas outside your vehicle that cannot be seen using mirrors.'),
      q('w1d3q6', 'You’ve checked your mirrors and want to change lanes. What does the manual say to do next?', ['Nothing more; the mirrors show everything', 'Turn the steering wheel a little to test the gap', 'Look over your shoulder in the direction you plan to move', 'Honk to warn the other lane'], 2,
        'Turning your head shows the rear corner your mirrors can’t; keep the steering wheel straight while you look.', 44, 'Look over your shoulder in the direction you plan to move.'),
      q('w1d3q2', 'You notice you’re driving in another car’s blind spot. What should you do?', ['Stay there; it’s their job to see you', 'Speed up or slow down so the driver can see you', 'Honk to let them know', 'Turn on your hazard lights'], 1,
        'If they can’t see you, they might move into your lane.', 34, 'Either speed up or slow down so the other driver can see your vehicle.'),
      q('w1d3q3', 'Why should you never stay alongside a truck or bus?', ['It’s against the law', 'They always speed up suddenly', 'They have large blind spots and it’s hard for them to see you', 'Their mirrors are smaller'], 2,
        'Big vehicles have big blind spots; get past or drop back.', 34, 'These vehicles have large blind spots and it is hard for them to see you.'),
      q('w1d3q4', 'How does the manual say to set your left-side mirror?', ['So you can see the whole side of your car', 'Lean your head toward the left window, then set it so you can barely see the side of the car', 'Point it at the road right behind you', 'So you can see the back seat'], 1,
        'The manual says this method gives the best view of the lanes next to you.', 25, 'Lean your head toward the left-side window, and set the left mirror so you can barely see the side of the car.'),
      q('w1d3q7', 'How should you set the inside rearview mirror?', ['So you can see the back seat', 'Tilted down toward the trunk', 'So it frames the entire rear window', 'Angled toward the left lane'], 2,
        'It’s your main mirror for what’s behind you.', 25, 'adjust the inside mirror so that it frames the entire rear window.'),
      q('w1d3q8', 'When you turn your head to check a blind spot, what should your hands do?', ['Keep the steering wheel straight', 'Turn the wheel the way you’re looking', 'Let go with one hand', 'Turn the wheel slightly the other way'], 0,
        'People tend to turn their arms the same way as their head, which pulls the car over.', 44, 'make sure you keep the steering wheel straight')
    ]
  },
  {
    id: 'w1d4', title: 'Seeing hazards at intersections',
    key: [k('Look left, right, and left again.', 50, 'Look left, right, and left again for approaching vehicles and pedestrians.'),
      k('Driveways and parking lots count as intersections too.', 50, 'Intersections are any place where traffic merges or crosses.'),
      k('A turn signal isn’t a promise: wait until the car starts to turn.', 50, 'Wait until the other driver starts to turn and then proceed if it is safe to do so.')],
    videos: [{ yt: 'v0Soc-kicOQ', title: 'Scanning And Moving Through Intersections Safely', channel: 'Smart Drive Test', len: '7:27',
      iowa: 'Iowa’s manual: look left, right, and left again, and never assume another driver will give you space. (This channel may not be from the US: listen for km/h or rules that differ.)' }],
    questions: [
      q('w1d4q1', 'Before you go through an intersection, which way should you look for vehicles and pedestrians?', ['Right only', 'Left, right, and left again', 'Straight ahead only', 'Just in your mirror'], 1,
        'The manual adds: never assume another driver will share space with you or give you space.', 50, 'Look left, right, and left again for approaching vehicles and pedestrians.'),
      q('w1d4q2', 'An approaching car has its turn signal on. Can you pull out in front of it?', ['No: wait until it actually starts to turn, then go if it’s safe', 'Yes, the signal means it’s turning', 'Yes, if you honk first', 'Only if it’s a motorcycle'], 0,
        'The driver may turn later or forgot the signal was on.', 50, 'Do not turn just because an approaching vehicle has a turn signal on.'),
      q('w1d4q3', 'Which of these counts as an intersection?', ['Only places with traffic lights', 'Only where two highways cross', 'Any place traffic merges or crosses, including driveways and parking lots', 'Only four-way stops'], 2,
        'The manual lists cross streets, side streets, driveways, parking lots, and roadways open to public travel.', 50, 'Intersections are any place where traffic merges or crosses.'),
      q('w1d4q4', 'What does the law about right-of-way do?', ['It says who must yield; it doesn’t give anyone the right-of-way', 'It gives bigger vehicles the right-of-way', 'It lets whoever arrives first go no matter what', 'It only applies to trucks'], 0,
        'Whoever should yield, you should do everything you can to avoid hitting a pedestrian or another vehicle.', 18, 'The law says who must yield the right-of-way; it does not give anyone the right-of-way.'),
      q('w1d4q6', 'A bicyclist at an intersection should yield to you, but starts to go. What does the manual say?', ['Keep going; it’s your right-of-way', 'Be ready to yield, even when the bicyclist should yield to you', 'Honk and keep going', 'Speed up to get past first'], 1,
        'Bicyclists have no defense against a vehicle, so it’s your job to watch out for them.', 18, 'Be ready to yield the right-of-way, even at times the bicyclists should yield to you.'),
      q('w1d4q7', 'What is step 1 before you enter an intersection?', ['Speed up to get through it quickly', 'Look ahead to see what kind of intersection it is and its signs, signals or markings', 'Honk to warn other drivers', 'Turn on your hazard lights'], 1,
        'Knowing the kind of intersection tells you who goes first and what to watch for.', 50, 'look ahead to identify the type of intersection and any traffic control devices'),
      q('w1d4q8', 'Why be extra careful about a motorcycle’s turn signal?', ['Motorcycle turn signals often don’t turn off by themselves', 'Motorcycles never use turn signals', 'A motorcycle signal means the rider will stop', 'Motorcycle signals blink faster'], 0,
        'The rider may have forgotten it’s on; wait until they actually start to turn.', 50, 'their signals often do not cancel by themselves.')
    ]
  },
  { id: 'w1d5', title: 'Unit 1 test', review: true, videos: [], questions: [] },
  // ---- Unit 2: signs and signals (manual 2.1-2.9). Facts on pp. 6-11 read off the page pictures (the saved text mixes the columns).
  {
    id: 'w2d1', title: 'Signs: colors and shapes',
    key: [k('A sign’s shape and color tell you what kind of sign it is.', 6, 'The shape and color of traffic signs give clues to the type of information they provide.'),
      k('Yellow means a general warning.', 6, 'General warning.'),
      k('Orange means road work: watch for lower speed limits and workers.', 6, 'Be sure to watch for changing speed limits and workers on the road.')],
    videos: [{ yt: 'oEXDKnD756k', title: 'Beginner Driving Lesson: Common Road Signs & Meanings Explained!', channel: 'Zutobi Drivers Ed', len: '7:52',
      iowa: 'Iowa uses these same sign colors and shapes (manual pages 6 and 7). Fluorescent pink signs are for crash scenes and other incidents.' }],
    questions: [
      { ...q('w2d1q1', 'What does a green sign like this tell you?', ['Directions: where a place is, or how far away', 'A warning about a hazard ahead', 'Where to find food or fuel', 'A law you must obey'], 0,
        'Green is for directions and distances.', 6, 'Direction. Indicates where a place is, or how far a place is from where you are.'), sign: { shape: 'rectangle', color: 'green' } },
      { ...q('w2d1q2', 'What does a blue sign like this point you to?', ['Road work ahead', 'Services: rest areas, hospitals, fuel, food and lodging', 'Parks and historical sites', 'A school crossing'], 1,
        'Blue is for services for travelers.', 6, 'Services for travelers.'), sign: { shape: 'rectangle', color: 'blue' } },
      { ...q('w2d1q3', 'An orange sign like this means:', ['A hospital is nearby', 'A school zone', 'Road work, temporary traffic control or maintenance', 'A scenic route'], 2,
        'Orange is for work zones: watch for changing speed limits and workers.', 6, 'Road work, temporary traffic control, and maintenance warnings.'), sign: { shape: 'diamond', color: 'orange' } },
      { ...q('w2d1q4', 'A brown sign like this points you to:', ['Recreation and cultural places, like parks and historical sites', 'Gas stations', 'Interstate exits', 'Detours'], 0,
        'Brown is for recreation and points of interest.', 6, 'Recreation and cultural points of interest.'), sign: { shape: 'rectangle', color: 'brown' } },
      { ...q('w2d1q5', 'A fluorescent pink sign like this is used for:', ['School crossings', 'Incidents, like a crash cleanup or debris on the road', 'Bike lanes', 'Parking rules'], 1,
        'Pink signs go up for incidents: be ready to slow down and follow them.', 6, 'Warning and guide signs for incident management such as crash clean up, debris removal, traffic, etc.'), sign: { shape: 'diamond', color: 'pink' } },
      { ...q('w2d1q6', 'A five-sided sign shaped like this marks:', ['A railroad crossing', 'A no passing zone', 'A school area or school crossing', 'A hospital'], 2,
        'The pentagon shape is for schools; watch for children.', 7, 'School crossing. Signs mark school areas and school crossings.'), sign: { shape: 'pentagon', color: 'yellow-green' } },
      { ...q('w2d1q7', 'Where is a sideways-triangle (pennant) sign like this, and what does it warn of?', ['On the right side of the road; a curve', 'On the left side of the road; a no passing zone', 'Over the road; a lane closing', 'On the left side; a school'], 1,
        'It’s on the left, where a driver about to pass will see it.', 7, 'This sign will be on the left side of the road. It warns you of a no passing zone.'), sign: { shape: 'pennant', color: 'yellow' } },
      { ...q('w2d1q8', 'A white sign like this gives you:', ['Laws you must follow (regulatory)', 'Directions', 'Services', 'A general warning'], 0,
        'White signs are regulatory: speed limits, turn rules and other laws.', 6, 'Regulatory. Provides information regarding enforceable laws and ordinances.'), sign: { shape: 'rectangle', color: 'white' } }
    ]
  },
  {
    id: 'w2d2', title: 'Stop, yield and other regulatory signs',
    key: [k('Stop sign: come to a full stop, at the stop line if there is one.', 8, 'Stop at the stop line if one is present.'),
      k('Yield sign: slow down and let traffic you’re crossing or entering go first.', 8, 'A yield sign means you must slow down and yield the right of way to traffic in the intersection you are crossing or roadway you are entering.'),
      k('A red circle with a slash means you can’t do what’s shown.', 8, 'These indicate you cannot do something')],
    videos: [{ yt: 'oAEXSBJJqc4', title: 'Stop vs Yield: The Mistake That Fails Your Driving Test', channel: 'Zutobi Drivers Ed', len: '7:26',
      iowa: 'Iowa’s manual: at a stop sign, stop at the stop line if there is one, then you may pull forward to see before going. At a yield sign, slow down and be ready to stop.' }],
    questions: [
      { ...q('w2d2q1', 'At a sign like this, you must:', ['Slow down and go if it looks clear', 'Come to a full stop and wait until crossing traffic and the crosswalk are clear', 'Stop only if other cars are coming', 'Honk, then go'], 1,
        'A full stop every time, even when nobody is coming.', 8, 'A stop sign means you must come to a full stop and wait until crossing vehicles and the cross-walk are clear before proceeding.'), sign: { shape: 'octagon', color: 'red' } },
      q('w2d2q2', 'There’s a white stop line painted before the stop sign. Where do you stop?', ['At the stop line', 'Past the sign, at the corner', 'In the crosswalk', 'Anywhere near the sign'], 0,
        'Then, if you can’t see, you may pull forward carefully before going.', 8, 'Stop at the stop line if one is present.'),
      { ...q('w2d2q3', 'A sign like this means:', ['Stop every time', 'Speed up to merge ahead of traffic', 'Slow down and let traffic you’re crossing or entering go first', 'No turns allowed'], 2,
        'Yield: be ready to stop if traffic is coming.', 8, 'A yield sign means you must slow down and yield the right of way to traffic in the intersection you are crossing or roadway you are entering.'), sign: { shape: 'yield' } },
      q('w2d2q4', 'A red circle with a red slash over a symbol (like a U-turn arrow) means:', ['You must do what the symbol shows', 'You can’t do what the symbol shows', 'The road is closed', 'Caution ahead'], 1,
        'For example: no left turn, no right turn, or no U-turn.', 8, 'These indicate you cannot do something; for example, no left turn, no right turn, or no U-turn.'),
      q('w2d2q5', 'The road is slippery or foggy. What about the posted speed limit?', ['Drive at it; it’s the legal speed', 'You may need to drive slower than it', 'It goes up in bad weather', 'It becomes the minimum speed'], 1,
        'Limits are for ideal conditions; rain, snow and fog call for less.', 8, 'Sometimes you must reduce your speed when conditions require it'),
      q('w2d2q6', 'You see a red-and-white DO NOT ENTER sign at an opening in the road. It means:', ['Enter carefully', 'Enter only to turn around', 'One lane ahead', 'Do not enter that road opening'], 3,
        'You’ll see them at exit ramps, crossovers on divided roads, and one-way roads.', 8, 'You will see this sign at roadway openings you are not to enter.'),
      q('w2d2q7', 'You pass a WRONG WAY sign. What happened?', ['You turned wrong and you’re in a lane of oncoming traffic', 'Nothing; it’s for other drivers', 'You missed your exit', 'The road ahead is closed'], 0,
        'Get off the traveled road, stop, and turn around as quickly and safely as you can.', 8, 'You made a wrong turn and have entered a lane of oncoming traffic.'),
      q('w2d2q8', 'A KEEP RIGHT sign (an arrow curving around a small island) means:', ['The road ahead is divided: go around the island or barrier', 'The right lane ends', 'Right turn only', 'Slow vehicles keep right'], 0,
        'Pass on the side the arrow shows.', 8, 'The road ahead is divided. This sign directs traffic around an island or barrier.'),
      q('w2d2q9', 'A high-speed road has a minimum speed that is too fast for you. What should you do?', ['Drive slower with your flashers on', 'Use another route', 'Drive on the shoulder', 'Ignore the minimum'], 1,
        'Driving far below the flow of traffic is dangerous too.', 8, 'If this minimum speed is too fast for you, then you should use another route.')
    ]
  }
];
