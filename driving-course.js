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
      q('w1d1q2', 'Another driver near you is driving aggressively. What does the manual say to do?', ['Speed up and get well ahead of them so they can’t bother you', 'Slow down or pull over to avoid them', 'Honk so they know you see them', 'Stay right beside them so they can’t cut in front of you'], 1,
        'Give an aggressive driver room; you can’t control them, only the space around you.', 47, 'If another driver is showing signs of aggressive driving, slow down or pull over to avoid them.'),
      q('w1d1q3', 'You have a green light. What should you assume about drivers on the cross street?', ['They will always stop, because their light is red', 'They will wave you through if you make eye contact first', 'One might run the red light, so be ready to react', 'Nothing; a green light means the intersection is yours'], 2,
        'Defensive driving means not depending on other drivers to do the right thing.', 47, 'Assume that drivers will run through red lights or stop signs and be prepared to react.'),
      q('w1d1q4', 'What is the “escape route” the manual tells you to always leave yourself?', ['A place to move your vehicle if your path is suddenly blocked', 'The fastest way home', 'The shoulder you use to pass', 'The nearest exit ramp'], 0,
        'If the car ahead stops suddenly, having somewhere to go can keep you out of a crash.', 47, 'a place to move your vehicle if your immediate path of travel is suddenly blocked'),
      q('w1d1q5', 'Besides other cars, what does the manual say to keep an eye on along the road?', ['Only the traffic lights and the signs above the road', 'Billboards', 'Pedestrians, bicyclists, and animals', 'Nothing else; just keep your eyes on the cars around you'], 2,
        'People, bikes and animals can move into the road quickly; scanning catches them early.', 47, 'Also, keep an eye on pedestrians, bicyclists, and animals along the road.'),
      q('w1d1q6', 'How many serious crashes does the manual say are due to dangerous choices or errors people make behind the wheel?', ['About 25 percent', 'About half', '94 percent', 'Almost none; most are bad luck'], 2,
        'Almost every serious crash comes down to a driver’s choice or mistake, which is why defensive driving works.', 47, '94 percent of serious crashes are due to dangerous choices or errors people make behind the wheel.'),
      q('w1d1q7', 'A driver near you is driving so dangerously that you’re worried. What does the manual suggest?', ['Try to get off the road by turning right or taking the next exit, if it’s safe', 'Follow close behind them so you can read their license plate number and report it', 'Pass them as fast as you can', 'Flash your headlights at them'], 0,
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
      q('w1d2q1', 'You’re a new driver on a dry road in normal traffic. What’s the least following distance the manual says to keep?', ['One second', 'About two seconds, if the road is dry', 'At least three seconds', 'Ten seconds, the same as for a large truck'], 2,
        'Beginners need extra time to notice and react, so the manual asks for at least three seconds.', 41, 'An inexperienced or beginning driver should maintain at least a three-second following distance under normal driving conditions.'),
      q('w1d2q2', 'The road is slippery. What following distance does the manual recommend?', ['Two seconds', 'Three seconds', 'Six or more seconds', 'It doesn’t matter if you drive slowly'], 2,
        'On slippery roads you need much more room to stop.', 41, 'When road conditions are slippery or the vehicle in front of you blocks your view, a following distance of six or more seconds is recommended.'),
      q('w1d2q3', 'How do you check your following distance?', ['Count car lengths between you and the car ahead, and keep one length for every ten miles per hour', 'When the car ahead passes a landmark, start counting; you shouldn’t reach it before “three”', 'Look at your speedometer', 'Wait until the car ahead brakes'], 1,
        'Your front bumper shouldn’t pass the landmark before you’ve counted to three.', 41, 'Watch the vehicle ahead of you pass a landmark, such as a sign, and begin slowly counting.'),
      q('w1d2q4', 'Someone is tailgating you. What does the manual suggest?', ['Move slightly to the right and signal early for turns, stops, or lane changes', 'Tap your brakes hard so they back off', 'Speed up to get away', 'Stop in your lane'], 0,
        'The manual adds: try slowing down and encouraging the driver behind you to pass.', 48, 'If you are being tailgated, move slightly to the right and give the tailgater a better view of what is ahead and signal early for turns, stops, or lane changes.'),
      q('w1d2q5', 'Why do faster speeds need more following distance?', ['Higher speeds require greater stopping distances', 'Fast cars have weaker brakes that take longer to grip the road', 'It only matters at night', 'They don’t; distance is the same at any speed'], 0,
        'The faster you go, the farther you travel before you can stop.', 48, 'Higher speeds require greater stopping distances.'),
      q('w1d2q6', 'You spot a slow farm vehicle far ahead. Why does spotting it early help?', ['You can honk at it sooner', 'You can pass it on the shoulder', 'It doesn’t matter; just brake hard when you get close to it', 'You have time to change lanes or slow down safely'], 3,
        'Slowing suddenly can cause a crash; seeing it early gives you time.', 48, 'If you spot these vehicles early, you have time to change lanes or slow down safely.'),
      q('w1d2q7', 'According to the manual, when are roads safest?', ['When some cars go well below the speed of traffic', 'When all vehicles travel the same speed without going over the limit', 'When drivers weave to pass slower cars', 'When you drive a little faster than traffic so you can stay ahead of it'], 1,
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
      q('w1d3q1', 'What is a blind spot?', ['A dark spot on the windshield where the wipers and defroster can’t reach', 'The inside of the trunk', 'A stretch of road with no streetlights', 'An area outside your vehicle that can’t be seen using your mirrors'], 3,
        'That’s why mirrors alone aren’t enough before you change lanes.', 34, 'Blind spots are areas outside your vehicle that cannot be seen using mirrors.'),
      q('w1d3q6', 'You’ve checked your mirrors and want to change lanes. What does the manual say to do next?', ['Nothing more; the mirrors show everything', 'Turn the steering wheel a little to test whether the gap is open', 'Look over your shoulder in the direction you plan to move', 'Honk to warn anyone in the other lane that you’re coming over'], 2,
        'Turning your head shows the rear corner your mirrors can’t; keep the steering wheel straight while you look.', 44, 'Look over your shoulder in the direction you plan to move.'),
      q('w1d3q2', 'You notice you’re driving in another car’s blind spot. What should you do?', ['Speed up or slow down so the driver can see you', 'Stay there; it’s the other driver’s job to check before moving over', 'Honk to let them know', 'Turn on your hazard lights'], 0,
        'If they can’t see you, they might move into your lane.', 34, 'Either speed up or slow down so the other driver can see your vehicle.'),
      q('w1d3q3', 'Why should you never stay alongside a truck or bus?', ['It’s against the law', 'They have large blind spots and it’s hard for them to see you', 'Their mirrors are smaller', 'They always speed up suddenly'], 1,
        'Big vehicles have big blind spots; get past or drop back.', 34, 'These vehicles have large blind spots and it is hard for them to see you.'),
      q('w1d3q4', 'How does the manual say to set your left-side mirror?', ['So you can see the whole side of your car in it', 'Point it straight back at the road behind you, the same view as the inside mirror', 'So you can see the back seat', 'Lean toward the left window and set it so you barely see the side of the car'], 3,
        'The manual says this method gives the best view of the lanes next to you.', 25, 'Lean your head toward the left-side window, and set the left mirror so you can barely see the side of the car.'),
      q('w1d3q7', 'How should you set the inside rearview mirror?', ['So you can see the back seat', 'Tilted down toward the trunk', 'So it frames the entire rear window', 'Angled toward the left lane so you can see cars passing you'], 2,
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
      q('w1d4q1', 'Before you go through an intersection, which way should you look for vehicles and pedestrians?', ['Right only, since that’s where cars come from first', 'Straight ahead only', 'Just in your mirrors before you pull out', 'Left, right, and left again'], 3,
        'The manual adds: never assume another driver will share space with you or give you space.', 50, 'Look left, right, and left again for approaching vehicles and pedestrians.'),
      q('w1d4q2', 'An approaching car has its turn signal on. Can you pull out in front of it?', ['Yes: a turn signal means the driver is turning off before reaching you', 'Yes, if you honk first', 'No: wait until it actually starts to turn, then go if it’s safe', 'Only if it’s a motorcycle, since their signals mean they’re turning soon'], 2,
        'The driver may turn later or forgot the signal was on.', 50, 'Do not turn just because an approaching vehicle has a turn signal on.'),
      q('w1d4q3', 'Which of these counts as an intersection?', ['Any place traffic merges or crosses, including driveways and parking lots', 'Only places with traffic lights', 'Only where two highways cross each other, out in the country rather than in town', 'Only four-way stops'], 0,
        'The manual lists cross streets, side streets, driveways, parking lots, and roadways open to public travel.', 50, 'Intersections are any place where traffic merges or crosses.'),
      q('w1d4q4', 'What does the law about right-of-way do?', ['It gives bigger vehicles the right-of-way because they take longer to stop', 'It says who must yield; it doesn’t give anyone the right-of-way', 'It lets whoever arrives first go no matter what', 'It only applies to trucks'], 1,
        'Whoever should yield, you should do everything you can to avoid hitting a pedestrian or another vehicle.', 18, 'The law says who must yield the right-of-way; it does not give anyone the right-of-way.'),
      q('w1d4q6', 'A bicyclist at an intersection should yield to you, but starts to go. What does the manual say?', ['Keep going; it’s your right-of-way', 'Honk and keep going', 'Speed up to get past first', 'Be ready to yield, even when the bicyclist should yield to you'], 3,
        'Bicyclists have no defense against a vehicle, so it’s your job to watch out for them.', 18, 'Be ready to yield the right-of-way, even at times the bicyclists should yield to you.'),
      q('w1d4q7', 'What is step 1 before you enter an intersection?', ['Speed up to get through it quickly', 'Honk to warn other drivers', 'Look ahead: what kind of intersection, and what signs or signals', 'Turn on your hazard lights so everyone knows you might stop suddenly'], 2,
        'Knowing the kind of intersection tells you who goes first and what to watch for.', 50, 'look ahead to identify the type of intersection and any traffic control devices'),
      q('w1d4q8', 'Why be extra careful about a motorcycle’s turn signal?', ['Motorcycle turn signals often don’t turn off by themselves', 'Motorcycles never use turn signals', 'A motorcycle signal means the rider is about to stop and pull over', 'Motorcycle signals blink faster'], 0,
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
      { ...q('w2d1q1', 'What does a green sign like this tell you?', ['A hazard warning', 'Where to find food or fuel', 'A law you must obey', 'Directions: where a place is, or how far away'], 3,
        'Green is for directions and distances.', 6, 'Direction. Indicates where a place is, or how far a place is from where you are.'), sign: { shape: 'rectangle', color: 'green' } },
      { ...q('w2d1q2', 'What does a blue sign like this point you to?', ['Services: rest areas, hospitals, fuel, food and lodging', 'Road work ahead', 'Parks and historical sites', 'A school crossing'], 0,
        'Blue is for services for travelers.', 6, 'Services for travelers.'), sign: { shape: 'rectangle', color: 'blue' } },
      { ...q('w2d1q3', 'An orange sign like this means:', ['A hospital is nearby', 'A school zone where you must slow down during school hours', 'Road work, temporary traffic control or maintenance', 'A scenic route with places along the way to stop and look around'], 2,
        'Orange is for work zones: watch for changing speed limits and workers.', 6, 'Road work, temporary traffic control, and maintenance warnings.'), sign: { shape: 'diamond', color: 'orange' } },
      { ...q('w2d1q4', 'A brown sign like this points you to:', ['Gas stations, restaurants and places to stay overnight', 'Parks, recreation areas and historical sites', 'Interstate exits and the distance to each one in miles', 'Detours'], 1,
        'Brown is for recreation and points of interest.', 6, 'Recreation and cultural points of interest.'), sign: { shape: 'rectangle', color: 'brown' } },
      { ...q('w2d1q5', 'A fluorescent pink sign like this is used for:', ['School crossings and areas where children walk to school', 'Bike lanes', 'Parking rules', 'Incidents, like a crash cleanup or debris on the road'], 3,
        'Pink signs go up for incidents: be ready to slow down and follow them.', 6, 'Warning and guide signs for incident management such as crash clean up, debris removal, traffic, etc.'), sign: { shape: 'diamond', color: 'pink' } },
      { ...q('w2d1q6', 'A five-sided sign shaped like this marks:', ['A school area or school crossing', 'A railroad crossing a short distance ahead', 'A no passing zone', 'A hospital'], 0,
        'The pentagon shape is for schools; watch for children.', 7, 'School crossing. Signs mark school areas and school crossings.'), sign: { shape: 'pentagon', color: 'yellow-green' } },
      { ...q('w2d1q7', 'Where is a sideways-triangle (pennant) sign like this, and what does it warn of?', ['On the right side of the road; a sharp curve ahead', 'Over the road; a lane closing', 'On the left side; a no passing zone', 'On the left side; a school'], 2,
        'It’s on the left, where a driver about to pass will see it.', 7, 'This sign will be on the left side of the road. It warns you of a no passing zone.'), sign: { shape: 'pennant', color: 'yellow' } },
      { ...q('w2d1q8', 'A white sign like this gives you:', ['Directions', 'Laws you must follow (regulatory)', 'Services', 'A general warning about a hazard ahead'], 1,
        'White signs are regulatory: speed limits, turn rules and other laws.', 6, 'Regulatory. Provides information regarding enforceable laws and ordinances.'), sign: { shape: 'rectangle', color: 'white' } },
      { ...q('w2d1q9', 'A yellow diamond-shaped sign like this is usually:', ['A regulatory sign telling you a law you must obey right now', 'A guide sign', 'A warning sign: a hazard or special situation ahead', 'A service sign'], 2,
        'Words or pictures on it show what to watch for; slow down and be ready to stop.', 9, 'Warning signs are yellow with black lettering or symbols and most are diamond-shaped.'), sign: { shape: 'diamond', color: 'yellow' } },
      { ...q('w2d1q10', 'A round yellow sign like this warns of:', ['A school zone where children may be crossing', 'A traffic circle', 'A stop sign ahead', 'A railroad crossing ahead'], 3,
        'Slow down, look and listen for a train.', 7, 'Railroad crossing ahead.'), sign: { shape: 'circle', color: 'yellow' } }
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
      { ...q('w2d2q1', 'At a sign like this, you must:', ['Slow down, look both ways, and keep rolling if no one is coming either way', 'Stop only if other cars are coming', 'Honk, then go', 'Stop fully; wait until cross traffic and the crosswalk are clear'], 3,
        'A full stop every time, even when nobody is coming.', 8, 'A stop sign means you must come to a full stop and wait until crossing vehicles and the cross-walk are clear before proceeding.'), sign: { shape: 'octagon', color: 'red' } },
      q('w2d2q2', 'There’s a white stop line painted before the stop sign. Where do you stop?', ['At the stop line', 'Past the sign, at the corner', 'In the crosswalk', 'Anywhere near the sign'], 0,
        'Then, if you can’t see, you may pull forward carefully before going.', 8, 'Stop at the stop line if one is present.'),
      { ...q('w2d2q3', 'A sign like this means:', ['Stop every time, even if no one is coming', 'Slow down and let traffic you’re crossing or entering go first', 'Speed up to merge ahead', 'No turns allowed'], 1,
        'Yield: be ready to stop if traffic is coming.', 8, 'A yield sign means you must slow down and yield the right of way to traffic in the intersection you are crossing or roadway you are entering.'), sign: { shape: 'yield' } },
      q('w2d2q4', 'A red circle with a red slash over a symbol (like a U-turn arrow) means:', ['You must do what the symbol shows, as soon as it’s safe', 'The road is closed', 'You can’t do what the symbol shows', 'Caution ahead: slow down until the symbol is gone'], 2,
        'For example: no left turn, no right turn, or no U-turn.', 8, 'These indicate you cannot do something; for example, no left turn, no right turn, or no U-turn.'),
      q('w2d2q5', 'The road is slippery or foggy. What about the posted speed limit?', ['Drive at it; it’s the legal speed whatever the weather', 'It goes up in bad weather', 'It becomes the minimum speed', 'You may need to drive slower than it'], 3,
        'Limits are for ideal conditions; rain, snow and fog call for less.', 8, 'Sometimes you must reduce your speed when conditions require it'),
      q('w2d2q6', 'You see a red-and-white DO NOT ENTER sign at an opening in the road. It means:', ['Do not enter that road opening', 'Enter only to turn around, then leave the same way you came in', 'One lane ahead', 'Enter carefully'], 0,
        'You’ll see them at exit ramps, crossovers on divided roads, and one-way roads.', 8, 'You will see this sign at roadway openings you are not to enter.'),
      q('w2d2q7', 'You pass a WRONG WAY sign. What happened?', ['Nothing; it’s a reminder meant for the drivers coming the other way', 'You missed your exit', 'You turned wrong and you’re in a lane of oncoming traffic', 'The road ahead is closed'], 2,
        'Get off the traveled road, stop, and turn around as quickly and safely as you can.', 8, 'You made a wrong turn and have entered a lane of oncoming traffic.'),
      q('w2d2q8', 'A KEEP RIGHT sign (an arrow curving around a small island) means:', ['The right lane ends just ahead, so merge left', 'The road ahead is divided: go around the island or barrier', 'Right turn only', 'Slow vehicles must keep to the right lane on hills and curves'], 1,
        'Pass on the side the arrow shows.', 8, 'The road ahead is divided. This sign directs traffic around an island or barrier.'),
      q('w2d2q9', 'A high-speed road has a minimum speed that is too fast for you. What should you do?', ['Drive slower with your flashers on', 'Use another route', 'Drive on the shoulder', 'Ignore the minimum'], 1,
        'Driving far below the flow of traffic is dangerous too.', 8, 'If this minimum speed is too fast for you, then you should use another route.')
    ]
  },
  {
    id: 'w2d3', title: 'Warning signs, guide signs and slow vehicles',
    key: [k('Warning signs are yellow, and most are diamond-shaped.', 9, 'Warning signs are yellow with black lettering or symbols and most are diamond-shaped.'),
      k('An orange triangle on a vehicle means it goes 35 mph or less: slow down early.', 11, 'A reflective orange triangle on the rear of a vehicle means it is traveling 35 mph or less.'),
      k('Yield to people walking and to anyone on a wheelchair, stroller, skateboard or scooter.', 10, 'vehicles must yield the right of way to pedestrians on foot and those using any human powered device')],
    videos: [{ yt: 'jBZH_XA4FUE', title: 'TRAFFIC SIGNS! What Do They Mean?', channel: 'Zutobi Drivers Ed', len: '8:32',
      iowa: 'Watch for Iowa’s farm-machinery and horse-drawn-vehicle signs on rural roads: slow down and pass slowly.' }],
    questions: [
      { ...q('w2d3q1', 'You’re on the main road and see a yellow diamond sign showing a lane joining yours. It means:', ['Your lane ends ahead', 'Turn right ahead at the next road, then rejoin the highway', 'No passing for the next half mile on this stretch of road', 'Be ready for other vehicles to blend into your lane'], 3,
        'That’s the Merging Traffic sign.', 9, 'If you are on the main road and see this sign, be prepared for other vehicles blending into your lane.'), sign: { shape: 'diamond', color: 'yellow' } },
      q('w2d3q2', 'A LANE ENDS sign means two lanes will soon become one. What does the manual say about merging?', ['Nobody needs to yield; just go', 'Traffic must yield when merging', 'Only trucks have to yield to cars when lanes merge', 'The faster car always goes first'], 1,
        'Merge carefully, and be ready to let others merge too.', 9, 'Two lanes of traffic will soon become one lane of traffic. Traffic must yield when merging.'),
      { ...q('w2d3q3', 'A triangle like this on the back of a vehicle means it travels:', ['35 mph or less', 'At the speed limit', 'With a wide load', 'Only on gravel roads'], 0,
        'Farm equipment, road equipment and horse-drawn wagons use it.', 11, 'A reflective orange triangle on the rear of a vehicle means it is traveling 35 mph or less.'), sign: { shape: 'smv' } },
      q('w2d3q4', 'A HILL warning sign (a truck going downhill) tells you to:', ['Speed up so you have momentum for the climb', 'Pass slow vehicles before the road goes down', 'Check your brakes before going down the hill', 'Turn on your hazard lights'], 2,
        'The road ahead goes down a hill.', 9, 'You should check your brakes before going down the hill.'),
      q('w2d3q5', 'A T-INTERSECTION AHEAD sign means:', ['A four-way stop ahead', 'A railroad crossing ahead', 'The road narrows to one lane for a bridge or work zone', 'The road ends ahead: get ready to turn right or left'], 3,
        'Slow down early: you’ll have to turn.', 9, 'The road you are on does not go straight ahead. Prepare to turn right or left.'),
      q('w2d3q6', 'You pass a FARM MACHINERY warning sign. What should you do?', ['Watch for slow farm equipment: slow down and pass slowly', 'Honk to warn the farmer', 'Speed up to get past', 'Nothing; it’s for tractors'], 0,
        'Tractors can be wide and slow, and may turn into fields.', 9, 'Be alert for slow-moving, farm equipment on the roadways. Reduce your speed and pass slowly.'),
      q('w2d3q7', 'You see a DEER CROSSING sign. What should you do?', ['Slow down and watch carefully', 'Honk your horn', 'Turn on your high beams and speed up', 'Nothing in the daytime'], 0,
        'Deer often cross where these signs are posted.', 9, 'There may be deer trying to cross the roadway in the area. Slow down and watch carefully.'),
      q('w2d3q8', 'Who must you yield to at a crosswalk under Iowa’s 2024 law?', ['Only people walking, because devices must use the street like cars', 'Only people in wheelchairs', 'Walkers, and anyone in a wheelchair or on a stroller, skateboard or scooter', 'Nobody, if you have a green light'], 2,
        'The law calls those devices pedestrian conveyances.', 10, 'vehicles must yield the right of way to pedestrians on foot and those using any human powered device'),
      q('w2d3q9', 'What do mile markers on the interstate show?', ['Miles to the next city', 'Miles from where that interstate entered the state you’re in', 'The speed limit', 'Miles left to the state line ahead of you, counting down'], 1,
        'They help you know how far your exit is, and tell 911 exactly where you are in an emergency.', 11, 'Mile markers show the number of miles from where the Interstate route entered the state you are traveling in.')
    ]
  },
  {
    id: 'w2d4', title: 'Traffic signals and pedestrian beacons',
    key: [k('Flashing red: treat it like a stop sign.', 11, 'Flashing red Treat it the same as a stop sign.'),
      k('Flashing yellow arrow: you may turn left after yielding to oncoming traffic and pedestrians.', 11, 'Yield to oncoming traffic and pedestrians; then turn left proceeding with caution.'),
      k('Rapid-flashing amber beacons at a crosswalk: stop for anyone in it.', 18, 'Motorists must stop for anyone within the crosswalk')],
    videos: [
      { yt: 'fBncqaoT3_4', title: 'What Do Those Flashing Arrow Traffic Signals Mean?', channel: 'Stan Cravens', len: '4:41',
        iowa: 'Iowa’s manual: a flashing yellow arrow means yield to oncoming traffic and pedestrians, then turn left with caution; oncoming traffic has a green light.' },
      { yt: '5nlBLyUBjVM', title: 'Rectangular Rapid Flashing Beacons', channel: 'Iowa DOT Answers', len: '1:17' },
      { yt: 'kum6w2BH1zc', title: 'Pedestrian Hybrid Beacons', channel: 'Iowa DOT Answers', len: '1:15' }],
    questions: [
      q('w2d4q1', 'A steady yellow light comes on as you approach. What should you do?', ['Speed up to make it through before the red', 'Stop suddenly, no matter how close you are to the intersection', 'Treat it like a stop sign', 'Don’t enter the intersection if you can stop safely'], 3,
        'If you can’t stop safely, go through with caution.', 11, 'Do not enter the intersection if you can stop safely. If you cannot stop safely, proceed through the intersection with caution.'),
      q('w2d4q2', 'You want to turn left and see a flashing yellow arrow. What does it mean?', ['Yield to oncoming traffic and pedestrians, then turn left with caution', 'Oncoming traffic must stop for you', 'Don’t turn left', 'Go straight only'], 0,
        'Oncoming traffic has a green light, so wait for a safe gap.', 11, 'Yield to oncoming traffic and pedestrians; then turn left proceeding with caution. Oncoming traffic has a green light.'),
      q('w2d4q3', 'Your light is solid green. Can you just go?', ['Yes, always', 'Only if you honk first so other drivers know you’re coming', 'Yes, but only once the intersection is clear', 'Only to turn right, after a full stop at the line'], 2,
        'Traffic may be caught in the intersection when the light changes; give it time to clear.', 11, 'Go, but only when the intersection is clear. Yield to vehicles and pedestrians in the intersection.'),
      q('w2d4q4', 'A steady green arrow points left. What does it mean?', ['Yield to oncoming cars, then turn left when there’s a gap', 'Turn left; oncoming traffic must stop', 'Go straight or turn left, whichever lane you’re in', 'Stop, then turn'], 1,
        'Go only the way the arrow points, and yield to anyone already in the intersection.', 11, 'Drivers can proceed with the left or right turn. Oncoming traffic must stop.'),
      q('w2d4q5', 'A steady red arrow points right. What must you do?', ['Turn right without stopping, as long as no one is coming', 'Slow down and turn', 'Go straight', 'Stop: drivers turning that way must stop'], 3,
        'A red arrow means stop for that turn.', 11, 'Steady red arrow Drivers turning left or right must stop.'),
      q('w2d4q6', 'A school crossing guard signals you to stop, but your light is green. What do you do?', ['Follow the light', 'Follow the crossing guard', 'Honk and go', 'Stop only if children are in the road'], 1,
        'Directions from police, highway workers and crossing guards come first.', 11, 'You must follow directions from these persons.'),
      q('w2d4q7', 'At a crosswalk, rectangular amber lights are flashing rapidly. What must you do?', ['Stop for anyone in or about to enter the crosswalk', 'Slow down a little and go around anyone who is crossing', 'Nothing; they’re for bikes', 'Honk and go'], 0,
        'A walker pushed the button to cross.', 18, 'Motorists must stop for anyone within the crosswalk and be alert for anyone about to enter the crosswalk when the beacon is flashing.'),
      q('w2d4q8', 'A pedestrian hybrid beacon’s two top red lights are solid. What do you do?', ['Slow down', 'Proceed with caution', 'Stop for pedestrians', 'Turn right only'], 2,
        'When they start flashing, stop first; then you may go with caution if the crosswalk is clear.', 18, 'Then the top two red lights become solid, and motorists must stop for pedestrians.'),
      q('w2d4q9', 'A person crossing is using a white cane with a red tip. What does that tell you?', ['They’re a crossing guard directing traffic at the corner', 'They have the light', 'Nothing special', 'They’re likely visually impaired: use extra caution'], 3,
        'Also watch for a person led by a harnessed service animal.', 18, 'the person is likely visually impaired. Use extra caution to prevent injury to that person.'),
      q('w2d4q10', 'A traffic light is flashing red. What do you do?', ['Treat it like a stop sign: stop, then go when it’s clear', 'Slow down and go through without stopping if no one is there', 'Wait for it to turn green', 'Go; flashing means the light is broken'], 0,
        'Come to a full stop every time.', 11, 'Flashing red Treat it the same as a stop sign.'),
      q('w2d4q11', 'A traffic light is flashing yellow. What do you do?', ['Stop and wait for green', 'Speed up before it turns red', 'Go carefully, yielding to vehicles and people', 'Stop completely at the line, then wait for a green light to come on'], 2,
        'Proceed with caution and go when it’s safe.', 11, 'Proceed with caution. Yield to vehicles and pedestrians and proceed when it is safe.')
    ]
  },
  { id: 'w2d5', title: 'Unit 2 test', review: true, videos: [], questions: [] },
  // ---- Unit 3: markings and lanes (manual 2.12-2.19, 4.9, 5.11). Facts read off the page pictures (pp. 15-17, 44, 58).
  {
    id: 'w3d1', title: 'Pavement markings, yield lines and crosswalks',
    key: [k('White lines separate traffic going the same way.', 15, 'White lines separate traffic moving in the same direction.'),
      k('Solid yellow line on your side: no passing.', 15, 'Passing is not allowed on the side with the solid yellow line.'),
      k('Stop before the stop line, or before the crosswalk if there is one.', 15, 'you must stop before your vehicle reaches the stop line, or a crosswalk if there is one.')],
    videos: [{ yt: 'JNK2037-WCk', title: 'Every Road Line Explained (Solid, Broken, Yellow, White) | Driving Rules You Must Know', channel: 'Street Explainer', len: '5:49', iowa: 'Iowa’s manual: white lines separate traffic going the same way; yellow lines separate traffic going opposite ways.' }],
    questions: [
      q('w3d1q1', 'White lane lines on the road separate:', ['Traffic going opposite ways on a two-way road', 'Parking spaces from the travel lanes', 'Traffic moving in the same direction', 'Bike lanes from the sidewalk'], 2,
        'Yellow lines are for traffic going opposite ways.', 15, 'White lines separate traffic moving in the same direction.'),
      q('w3d1q2', 'On a two-way road, a dashed yellow line runs beside a solid one. Who may pass?', ['Drivers on the side with the dashed line, when safe', 'Drivers on the side with the solid line, if it’s clear', 'Nobody, on any road with yellow lines', 'Anyone, as long as they signal first'], 0,
        'Solid yellow on your side means no passing.', 15, 'Vehicles on the side with the dashed line may pass when safe to do so.'),
      q('w3d1q3', 'A row of white triangles across your lane, pointing at you, marks:', ['A school zone starting, so slow to 25 mph', 'Speed bumps just ahead of you', 'The end of your lane', 'Where you yield, as the yield sign says'], 3,
        'They’re called yield lines.', 15, 'Yield lines consist of a row of solid white triangles pointing toward approaching vehicles.'),
      q('w3d1q4', 'You must stop for a red light. There’s a crosswalk but no stop line. Where do you stop?', ['In the crosswalk, so you can see both ways', 'Before the crosswalk', 'Past the crosswalk, at the corner', 'Anywhere, as long as you stop'], 1,
        'Leave the crosswalk clear for people crossing.', 15, 'you must stop before your vehicle reaches the stop line, or a crosswalk if there is one.'),
      q('w3d1q5', 'Is every crosswalk painted on the road?', ['No: watch for walkers even where there’s no paint', 'Yes, by law every crosswalk is painted', 'Only the ones near schools and parks', 'Only the ones at traffic lights'], 0,
        'Corners without painted lines can still be crosswalks.', 15, 'Not all crosswalks are marked.'),
      q('w3d1q6', 'Arrows painted in your lane show:', ['Which way the next lane’s traffic is going', 'Where bicycles are allowed to ride', 'What you may or must do from that lane', 'Where you may park for a short time'], 2,
        'A left arrow alone means that lane must turn left.', 15, 'show the movements that are allowed or required when driving in that lane.'),
      q('w3d1q7', 'Who must you yield to at a crosswalk?', ['Only people already halfway across', 'Only children and people in wheelchairs', 'Only people who wave at you first', 'Anyone in it or about to enter it'], 3,
        'Watch the corners as you approach.', 15, 'You must yield to anyone in or about to enter a crosswalk.')
    ]
  },
  {
    id: 'w3d2', title: 'Special lanes: center turn, reversible and HOV',
    key: [k('A center left-turn lane is for left turns only, never for passing.', 16, 'the lane cannot be used for passing.'),
      k('Never drive or pass on the shoulder.', 16, 'Never pass on the shoulder, whether it is paved or not.'),
      k('Three or more lanes your way: stay right or center except to pass.', 16, 'On a road with three or more lanes stay in the right or center lane except to pass.')],
    videos: [{ yt: 'ZRDw6RmQ-y4', title: 'How To Use The Center Left Turn Lane Correctly - Do\'s & Don\'ts That Can Make You A Safer Driver!', channel: 'Stan Cravens', len: '6:05', iowa: 'Iowa’s manual: you may enter and stop in a shared center left-turn lane before turning left, but never use it to pass.' }],
    questions: [
      q('w3d2q1', 'What is a shared center left-turn lane for?', ['Passing slow cars on a two-lane road', 'Emergency vehicles and buses only', 'Left turns, by traffic from either direction', 'Waiting while you read a map or phone'], 2,
        'It’s marked with solid and dashed yellow lines on each side.', 16, 'Shared left-turn lanes are reserved for vehicles making left turns from either direction.'),
      q('w3d2q2', 'May you use a shared center left-turn lane to pass a slow car?', ['No, never', 'Yes, if no one is turning ahead', 'Yes, at night when traffic is light', 'Only on roads with four or more lanes'], 0,
        'You may only enter it to stop and turn left.', 16, 'Vehicles may enter and stop in the lane before making a left turn, but the lane cannot be used for passing.'),
      q('w3d2q3', 'Over a reversible lane, a green arrow means:', ['The lane is about to change direction, so get ready to leave it', 'The lane is for left turns only', 'Speed up to clear the lane', 'You may use the lane beneath it'], 3,
        'These lanes change direction at different times of day.', 15, 'A green arrow means you can use the lane beneath it'),
      q('w3d2q4', 'A steady yellow X shows over your lane. What should you do?', ['Keep going; it only warns trucks', 'Move out of the lane as soon as it’s safe', 'Stop in the lane and wait for the light to change', 'Use the lane only to turn right'], 1,
        'The lane’s direction is changing.', 15, 'A steady yellow “X” means that the use of the lane is changing and you should move out of it as soon as it is safe to do so.'),
      q('w3d2q5', 'A lane has a white diamond and an HOV 2+ sign. Who may use it?', ['Vehicles carrying two or more people', 'Any car during rush hour', 'Trucks and buses only', 'Anyone driving under the speed limit'], 0,
        'Don’t drive in a reserved lane unless you qualify.', 16, 'the lane is reserved for high-occupancy vehicles (HOV) carrying two or more people.'),
      q('w3d2q6', 'Three or more lanes go your way. Where should you usually drive?', ['In the left lane, since it moves fastest', 'Any lane; it makes no difference', 'In the right or center lane, except to pass', 'On the shoulder when traffic is heavy'], 2,
        'If a lot of traffic is entering, the center lane is best.', 16, 'On a road with three or more lanes stay in the right or center lane except to pass.'),
      q('w3d2q7', 'You turn where there are no lane markings. Which lane do you turn into?', ['The far lane, so you have plenty of room to finish', 'Any lane that looks open', 'Always the right lane', 'The one closest to the lane you came from'], 3,
        'Change lanes after the turn if you need to.', 16, 'turn into the lane closest to the one you came from.'),
      q('w3d2q8', 'May you pass on the shoulder if it’s paved?', ['Yes, if traffic ahead has stopped', 'No: never pass on the shoulder, paved or not', 'Yes, on the right side only', 'Only to reach an exit you’d miss'], 1,
        'Other drivers won’t expect you there and may pull off without looking.', 16, 'Never pass on the shoulder, whether it is paved or not.')
    ]
  }
];
