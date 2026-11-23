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
// Iowa's permit and license rules aren't in the manual: cite the saved Iowa DOT page ('permit' or 'license').
const DOT_REF = { permit: 'Iowa DOT: Instruction Permit page', license: 'Iowa DOT: Intermediate License page' }; // = SOURCES in driving.js (the checker rejects any other ref)
const qd = (id, question, choices, answer, why, src, quote) => ({ id, q: question, choices, answer, why, ref: DOT_REF[src], quote });
const kd = (text, src, quote) => ({ t: text, ref: DOT_REF[src], quote });

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
      q('w1d1q1', 'How far ahead does Iowa’s manual say to scan conditions while you drive?', ['About 5 seconds ahead', 'About two car lengths ahead', 'As far as your headlights reach', '20 to 30 seconds ahead'], 3,
        'The manual says to keep your eyes moving, so you’re aware and ready for whatever happens.', 47, 'Check your mirrors frequently and scan conditions 20 to 30 seconds ahead of you.'),
      q('w1d1q2', 'Another driver near you is driving aggressively. What does the manual say to do?', ['Speed up and get well ahead of them so they can’t bother you', 'Slow down or pull over to avoid them', 'Keep your speed and stay in your lane', 'Stay right beside them so they can’t cut in front of you'], 1,
        'Give an aggressive driver room; you can’t control them, only the space around you.', 47, 'If another driver is showing signs of aggressive driving, slow down or pull over to avoid them.'),
      q('w1d1q3', 'You have a green light. What should you assume about drivers on the cross street?', ['They will always stop, because their light is red', 'They will wave you through if you make eye contact first', 'One might run the red light, so be ready to react', 'Nothing; a green light means the intersection is yours'], 2,
        'Defensive driving means not depending on other drivers to do the right thing.', 47, 'Assume that drivers will run through red lights or stop signs and be prepared to react.'),
      q('w1d1q4', 'What is the “escape route” the manual tells you to always leave yourself?', ['A place to move your vehicle if your path is suddenly blocked', 'The lane you use to pass slower traffic', 'A route planned around road construction', 'Room behind you so nobody tailgates'], 0,
        'If the car ahead stops suddenly, having somewhere to go can keep you out of a crash.', 47, 'a place to move your vehicle if your immediate path of travel is suddenly blocked'),
      q('w1d1q5', 'Besides other cars, what does the manual say to keep an eye on along the road?', ['Speed cameras and patrol cars', 'Your speedometer, every few seconds', 'Pedestrians, bicyclists, and animals', 'The license plates of nearby cars'], 2,
        'People, bikes and animals can move into the road quickly; scanning catches them early.', 47, 'Also, keep an eye on pedestrians, bicyclists, and animals along the road.'),
      q('w1d1q6', 'You signal to merge, and a driver in the next lane sees you. What should you assume?', ['They will slow down and let you in', 'They will move to another lane for you', 'You have the right-of-way because you signaled', 'They may not move over or let you in'], 3,
        'Don’t count on other drivers; merge only when there’s really room.', 47, 'Do not assume another driver is going to move out of the way or allow you to merge.'),
      q('w1d1q7', 'A driver near you is driving so dangerously that you’re worried. What does the manual suggest?', ['Try to get off the road by turning right or taking the next exit, if it’s safe', 'Follow close behind them so you can read their license plate number and report it', 'Pass them as fast as you can', 'Flash your headlights at them'], 0,
        'Put distance between you and them; don’t engage.', 47, 'try to get off the roadway by turning right or taking the next exit if it’s safe to do so.')
    ]
  },
  {
    id: 'w1d2', title: 'Space ahead: following distance',
    key: [k('New drivers: stay at least 3 seconds behind the car ahead.', 41, 'An inexperienced or beginning driver should maintain at least a three-second following distance under normal driving conditions.'),
      k('To count it: when the car ahead passes a sign, start counting slowly.', 41, 'Watch the vehicle ahead of you pass a landmark, such as a sign, and begin slowly counting.'),
      k('Tailgated? Move slightly right and signal early.', 48, 'If you are being tailgated, move slightly to the right')],
    videos: [
      { yt: 'ksxfBi7Z-Vk', title: 'How To Set & Maintain A Safe Following Distance When Driving - The 3 Second Rule Saves Lives', channel: 'Stan Cravens', len: '3:32',
        iowa: 'Iowa uses a 3- to 4-second rule. As a new driver, keep at least three seconds in normal conditions, and six or more when the road is slippery or your view ahead is blocked.' },
      { yt: 'ye-zGn9agys', title: 'Intermediate Roads: Space Cushion', channel: 'TeenDrivingPlan', len: '2:45' }
    ],
    questions: [
      q('w1d2q1', 'You’re a new driver on a dry road in normal traffic. At least how much following distance does the manual tell new drivers to keep?', ['One second', 'Two seconds, like an experienced driver', 'At least three seconds', 'Ten seconds, the same as for a large truck'], 2,
        'Beginners need extra time to notice and react, so the manual asks for at least three seconds.', 41, 'An inexperienced or beginning driver should maintain at least a three-second following distance under normal driving conditions.'),
      q('w1d2q2', 'The road is slippery. What following distance does the manual recommend?', ['Six or more seconds', 'Two seconds', 'Three seconds', 'One second, if you drive slowly'], 0,
        'On slippery roads you need much more room to stop.', 41, 'When road conditions are slippery or the vehicle in front of you blocks your view, a following distance of six or more seconds is recommended.'),
      q('w1d2q3', 'How do you check your following distance?', ['Count car lengths between you and the car ahead, and keep one length for every ten miles per hour', 'Keep the car ahead’s rear tires in sight over your hood', 'Wait until the car ahead brakes', 'When the car ahead passes a landmark, start counting; you shouldn’t reach it before “three”'], 3,
        'Your front bumper shouldn’t pass the landmark before you’ve counted to three.', 41, 'Watch the vehicle ahead of you pass a landmark, such as a sign, and begin slowly counting.'),
      q('w1d2q4', 'Someone is tailgating you. What does the manual suggest?', ['Turn on your hazard lights and keep your speed', 'Move slightly right and signal early', 'Speed up to get away', 'Stop in your lane'], 1,
        'The manual adds: try slowing down and encouraging the driver behind you to pass.', 48, 'If you are being tailgated, move slightly to the right and give the tailgater a better view of what is ahead and signal early for turns, stops, or lane changes.'),
      q('w1d2q5', 'Why do faster speeds need more following distance?', ['Higher speeds require greater stopping distances', 'Other drivers expect you to leave more room', 'Faster cars need more room to change lanes', 'The law sets the distance by the speed limit'], 0,
        'The faster you go, the farther you travel before you can stop.', 48, 'Higher speeds require greater stopping distances.'),
      q('w1d2q6', 'You spot a slow farm vehicle far ahead. Why does spotting it early help?', ['You can signal early to warn it you’re coming', 'You can get close enough to read its sign', 'You can line up to pass it on the shoulder', 'You have time to change lanes or slow down safely'], 3,
        'Slowing suddenly can cause a crash; seeing it early gives you time.', 48, 'If you spot these vehicles early, you have time to change lanes or slow down safely.'),
      q('w1d2q7', 'According to the manual, when are roads safest?', ['When some cars go well below the speed of traffic', 'When all vehicles travel the same speed without going over the limit', 'When most drivers stay in the left lane', 'When you drive a little faster than traffic so you can stay ahead of it'], 1,
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
      q('w1d3q1', 'What is a blind spot?', ['The space between your car and the car ahead', 'The road just past the reach of your headlights', 'Any stretch of road without streetlights', 'An area around your car that your mirrors can’t show'], 3,
        'Blind spots are the areas outside your vehicle that your mirrors can’t show, so check them another way before you move over.', 34, 'Blind spots are areas outside your vehicle that cannot be seen using mirrors.'),
      q('w1d3q6', 'You’ve checked your mirrors and want to change lanes. What does the manual say to do next?', ['Nothing more; the mirrors show everything', 'Turn the wheel slightly to test the gap', 'Look over your shoulder toward the lane you want', 'Check the inside mirror one more time'], 2,
        'Turning your head shows the rear corner your mirrors can’t; keep the steering wheel straight while you look.', 44, 'Look over your shoulder in the direction you plan to move.'),
      q('w1d3q2', 'You notice you’re driving in another car’s blind spot. What should you do?', ['Speed up or drop back so the driver can see you', 'Stay there; they’ll check before moving over', 'Move over to the far side of your lane', 'Turn on your hazard lights so they see you'], 0,
        'The manual says to speed up or slow down so the other driver can see your vehicle.', 34, 'Either speed up or slow down so the other driver can see your vehicle.'),
      q('w1d3q3', 'Why should you never stay alongside a truck or bus?', ['It’s against the law to ride beside them', 'They may not see you: big blind spots', 'They change lanes more often than cars do', 'You might block them from changing lanes'], 1,
        'Big vehicles have big blind spots; get past or drop back.', 34, 'These vehicles have large blind spots and it is hard for them to see you.'),
      q('w1d3q4', 'How does the manual say to set your left-side mirror?', ['So you can see the whole side of your car', 'Pointed straight back, matching the inside mirror view', 'Tilted down so you can see the curb', 'Lean left, then set it to barely show your car’s side'], 3,
        'The manual says this method gives the best view of the lanes next to you.', 25, 'Lean your head toward the left-side window, and set the left mirror so you can barely see the side of the car.'),
      q('w1d3q7', 'How should you set the inside rearview mirror?', ['Angled so you can see the car beside you', 'Aimed at the left lane to watch for passing cars', 'So it frames the entire rear window', 'Angled down to see the road right behind you'], 2,
        'It’s your main mirror for what’s behind you.', 25, 'adjust the inside mirror so that it frames the entire rear window.'),
      q('w1d3q8', 'When you turn your head to check a blind spot, what should your hands do?', ['Keep the steering wheel pointed straight', 'Turn the wheel the way you’re looking', 'Loosen your grip so you can turn farther', 'Hold the wheel at the bottom with one hand'], 0,
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
      q('w1d4q1', 'Before you go through an intersection, which way should you look for vehicles and pedestrians?', ['Left, then right', 'Straight ahead, then in your mirrors', 'Right, left, and right again', 'Left, right, and left again'], 3,
        'The manual adds: never assume another driver will share space with you or give you space.', 50, 'Look left, right, and left again for approaching vehicles and pedestrians.'),
      q('w1d4q2', 'An approaching car has its turn signal on. What should you do before pulling out in front of it?', ['Go: it will turn before it reaches you', 'Wait for the driver to wave you out', 'Wait until it actually starts to turn', 'Go if it is also slowing down'], 2,
        'The driver may turn later or forgot the signal was on.', 50, 'Do not turn just because an approaching vehicle has a turn signal on.'),
      q('w1d4q3', 'Which of these also counts as an intersection?', ['A store parking lot', 'A railroad overpass', 'A highway shoulder', 'A no passing zone'], 0,
        'The manual’s list: cross streets, side streets, driveways, parking lots, and roadways open to public travel.', 50, 'Intersections are any place where traffic merges or crosses.'),
      q('w1d4q4', 'What does the law about right-of-way do?', ['It lets whoever arrives first go no matter what', 'It says who must yield, not who may go', 'It gives the right-of-way to whoever signals first', 'It gives the right-of-way to the bigger vehicle'], 1,
        'Whoever should yield, you should do everything you can to avoid hitting a pedestrian or another vehicle.', 18, 'The law says who must yield the right-of-way; it does not give anyone the right-of-way.'),
      q('w1d4q6', 'A bicyclist at an intersection should yield to you, but starts to go. What does the manual say?', ['Keep going; it’s your right-of-way', 'Slow a little and keep going', 'Keep your speed so they can judge you', 'Be ready to yield to them anyway'], 3,
        'Bicyclists have no defense against a vehicle, so it’s your job to watch out for them.', 18, 'Be ready to yield the right-of-way, even at times the bicyclists should yield to you.'),
      q('w1d4q7', 'You’re coming up to an intersection. What should you do first?', ['Signal, even if you’re going straight', 'Move into the left lane to see better', 'Look ahead to see what kind it is and its signs', 'Check your mirrors for anyone tailgating'], 2,
        'The manual’s first step: look ahead to see what kind of intersection it is and what signs or signals control it.', 50, 'look ahead to identify the type of intersection and any traffic control devices'),
      q('w1d4q8', 'Why be extra careful about a motorcycle’s turn signal?', ['Their signals often don’t switch off on their own', 'Riders often signal with their hands instead', 'Their signals flash faster than a car’s', 'A blinking signal means they’re about to pull over'], 0,
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
      { ...q('w2d1q10', 'A round yellow sign like this warns of:', ['A school crossing ahead', 'A traffic circle ahead', 'A railroad crossing ahead', 'A stop sign ahead'], 2,
        'The round yellow sign means a railroad crossing is ahead.', 7, 'Railroad crossing ahead.'), sign: { shape: 'circle', color: 'yellow' } },
      { ...q('w2d1q9', 'A yellow diamond-shaped sign like this is usually:', ['A law you must obey', 'A warning of a hazard ahead', 'Directions to a place', 'A service ahead'], 1,
        'Yellow diamonds are warning signs: they warn you to slow down and be ready to stop.', 9, 'Warning signs are yellow with black lettering or symbols and most are diamond-shaped.'), sign: { shape: 'diamond', color: 'yellow' } },
      { ...q('w2d1q6', 'A five-sided sign shaped like this marks:', ['A school area or crossing', 'A railroad crossing just ahead', 'A no passing zone', 'A hospital zone'], 0,
        'A five-sided sign marks a school area or a school crossing.', 7, 'School crossing. Signs mark school areas and school crossings.'), sign: { shape: 'pentagon', color: 'yellow-green' } },
      { ...q('w2d1q7', 'Where is a sideways-triangle (pennant) sign like this, and what does it warn of?', ['On the right side; a sharp curve ahead', 'Over the road; a lane closing', 'On the left side; a no passing zone', 'Before a bridge; one lane ahead'], 2,
        'The pennant is on the left side of the road and marks a no passing zone.', 7, 'This sign will be on the left side of the road. It warns you of a no passing zone.'), sign: { shape: 'pennant', color: 'yellow' } },
      { ...q('w2d1q3', 'An orange sign like this means:', ['A school zone ahead', 'A hospital nearby', 'A scenic route ahead', 'Road work ahead'], 3,
        'Orange is for work zones: watch for changing speed limits and workers.', 6, 'Road work, temporary traffic control, and maintenance warnings.'), sign: { shape: 'diamond', color: 'orange' } },
      { ...q('w2d1q1', 'What does a green sign like this tell you?', ['A hazard warning ahead', 'Where to find food or fuel', 'A law to obey', 'Where places are, and how far'], 3,
        'Green is for directions and distances.', 6, 'Direction. Indicates where a place is, or how far a place is from where you are.'), sign: { shape: 'rectangle', color: 'green' } },
      { ...q('w2d1q2', 'What does a blue sign like this point you to?', ['Fuel, food and rest areas', 'Road work and lane closures', 'Directions to cities and towns', 'A law you must obey'], 0,
        'Blue is for services for travelers.', 6, 'Services for travelers.'), sign: { shape: 'rectangle', color: 'blue' } },
      { ...q('w2d1q4', 'A brown sign like this points you to:', ['Fuel, food and lodging', 'Parks and recreation', 'Distances to the next exits', 'Detours'], 1,
        'Brown is for recreation and points of interest.', 6, 'Recreation and cultural points of interest.'), sign: { shape: 'rectangle', color: 'brown' } }
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
      { ...q('w2d2q1', 'At a sign like this, you must:', ['Slow down and go if no one is coming', 'Stop only if other cars are near', 'Stop fully, then go when it’s clear', 'Stop, then go right away'], 2,
        'A full stop every time, even when nobody is coming.', 8, 'A stop sign means you must come to a full stop and wait until crossing vehicles and the cross-walk are clear before proceeding.'), sign: { shape: 'octagon', color: 'red' } },
      q('w2d2q2', 'There’s a white stop line painted before the stop sign. Where do you stop?', ['At the stop line', 'Past the sign, without stopping first', 'In the crosswalk', 'Two car lengths before the sign'], 0,
        'Stop at the stop line if there is one. After stopping, you may pull forward if you need to see.', 8, 'Stop at the stop line if one is present.'),
      { ...q('w2d2q3', 'A sign like this means:', ['Stop every time', 'Let traffic you’re entering go first', 'Merge without slowing', 'No turns allowed'], 1,
        'Slow down and yield the right of way to the traffic you’re entering or crossing.', 8, 'A yield sign means you must slow down and yield the right of way to traffic in the intersection you are crossing or roadway you are entering.'), sign: { shape: 'yield' } },
      q('w2d2q4', 'A red circle with a red slash over a symbol (like a U-turn arrow) means:', ['A warning that what’s shown is just ahead', 'The road is closed ahead', 'You can’t do what it shows', 'Do it only if no one is coming'], 2,
        'These signs mean you cannot do what’s shown: for example, no left turn, no right turn, or no U-turn.', 8, 'These indicate you cannot do something; for example, no left turn, no right turn, or no U-turn.'),
      q('w2d2q6', 'Where does the manual say you’ll see DO NOT ENTER signs?', ['At no passing zones', 'At railroad crossings', 'At school crossings', 'At exit ramps'], 3,
        'They mark roadway openings you must not enter: exit ramps, crossovers on divided roads, and one-way roads.', 8, 'You will see them at exit ramps, in crossovers on divided roadways, and at numerous locations on one-way roads.'),
      q('w2d2q7', 'You pass a WRONG WAY sign. What happened?', ['Nothing; it’s for drivers coming the other way', 'You missed your exit', 'The road ahead is closed', 'You’re driving against traffic'], 3,
        'Get off the traveled road, stop, and turn around as quickly and safely as you can.', 8, 'You made a wrong turn and have entered a lane of oncoming traffic.'),
      q('w2d2q8', 'What does a DIVIDED HIGHWAY sign tell you?', ['A one-lane bridge is coming up', 'The road ahead splits around a barrier', 'The right lane ends ahead', 'Traffic moves one way only'], 1,
        'The road ahead is divided: the sign directs traffic around an island or barrier.', 8, 'The road ahead is divided. This sign directs traffic around an island or barrier.')
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
        'They help you know how far your exit is, and tell 911 exactly where you are in an emergency.', 11, 'Mile markers show the number of miles from where the Interstate route entered the state you are traveling in.'),
      q('w2d3q10', 'What does the shape of a route sign tell you?', ['The speed limit on that road', 'How far it is to the next town', 'The type of road: interstate, U.S. highway, Iowa route or county road', 'Which exit is coming up next'], 2,
        'Follow route signs to stay on your route.', 11, 'The shape of a route sign indicates the type of roadway it is')
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
        'Watch the corners as you approach.', 15, 'You must yield to anyone in or about to enter a crosswalk.'),
      q('w3d1q8', 'Broken (dashed) yellow lines down the middle of a road separate:', ['Lanes going the same direction, like on a one-way street', 'The road from the shoulder', 'A bike lane from the car lanes', 'Traffic moving in opposite directions'], 3,
        'Yellow means traffic on the other side comes toward you; dashed means passing is allowed when safe.', 15, 'Yellow lines separate traffic moving in opposite directions.')
    ]
  },
  {
    id: 'w3d2', title: 'Special lanes: center turn, reversible and HOV',
    key: [k('A center left-turn lane is for left turns only, never for passing.', 16, 'the lane cannot be used for passing.'),
      k('Never drive or pass on the shoulder.', 16, 'Never pass on the shoulder, whether it is paved or not.'),
      k('Three or more lanes your way: stay right or center except to pass.', 16, 'On a road with three or more lanes stay in the right or center lane except to pass.')],
    videos: [{ yt: 'ZRDw6RmQ-y4', title: 'How To Use The Center Left Turn Lane Correctly - Do\'s & Don\'ts That Can Make You A Safer Driver!', channel: 'Stan Cravens', len: '6:05', iowa: 'Iowa’s manual: you may enter and stop in a shared center left-turn lane before turning left, but never use it to pass.' }],
    questions: [
      q('w3d2q1', 'What is a shared center left-turn lane for?', ['Passing slow cars on a two-lane road', 'Emergency vehicles and buses only', 'Waiting while you read a map or phone', 'Left turns, by traffic from either direction'], 3,
        'It’s marked with solid and dashed yellow lines on each side.', 16, 'Shared left-turn lanes are reserved for vehicles making left turns from either direction.'),
      q('w3d2q2', 'May you use a shared center left-turn lane to pass a slow car?', ['Yes, if no one is turning ahead', 'No, never', 'Yes, at night when traffic is light', 'Only on roads with four or more lanes'], 1,
        'You may only enter it to stop and turn left.', 16, 'Vehicles may enter and stop in the lane before making a left turn, but the lane cannot be used for passing.'),
      q('w3d2q3', 'Over a reversible lane, a green arrow means:', ['You may use the lane beneath it', 'The lane is about to change direction, so get ready to leave it', 'The lane is for left turns only', 'Speed up to clear the lane'], 0,
        'These lanes change direction at different times of day.', 15, 'A green arrow means you can use the lane beneath it'),
      q('w3d2q4', 'A steady yellow X shows over your lane. What should you do?', ['Keep going; it only warns trucks', 'Stop in the lane and wait for the light to change', 'Move out of the lane as soon as it’s safe', 'Use the lane only to turn right'], 2,
        'The lane’s direction is changing.', 15, 'A steady yellow “X” means that the use of the lane is changing and you should move out of it as soon as it is safe to do so.'),
      q('w3d2q5', 'A lane has a white diamond and an HOV 2+ sign. Who may use it?', ['Any car during rush hour', 'Vehicles carrying two or more people', 'Trucks and buses only', 'Anyone driving under the speed limit'], 1,
        'Don’t drive in a reserved lane unless you qualify.', 16, 'the lane is reserved for high-occupancy vehicles (HOV) carrying two or more people.'),
      q('w3d2q6', 'Three or more lanes go your way. Where should you usually drive?', ['In the left lane, since it moves fastest', 'Any lane; it makes no difference', 'On the shoulder when traffic is heavy', 'In the right or center lane, except to pass'], 3,
        'If a lot of traffic is entering, the center lane is best.', 16, 'On a road with three or more lanes stay in the right or center lane except to pass.'),
      q('w3d2q7', 'You turn where there are no lane markings. Which lane do you turn into?', ['The one closest to the lane you came from', 'The far lane, so you have plenty of room to finish', 'Any lane that looks open', 'Always the right lane'], 0,
        'Change lanes after the turn if you need to.', 16, 'turn into the lane closest to the one you came from.'),
      q('w3d2q8', 'May you pass on the shoulder if it’s paved?', ['Yes, if traffic ahead has stopped', 'Yes, on the right side only', 'No: never pass on the shoulder, paved or not', 'Only to reach an exit you’d miss'], 2,
        'Other drivers won’t expect you there and may pull off without looking.', 16, 'Never pass on the shoulder, whether it is paved or not.')
    ]
  },
  {
    id: 'w3d3', title: 'Bike lanes and sharing the road with bicyclists',
    key: [k('Don’t stop on green bike-lane paint.', 17, 'Motorists should not stop on green pavement.'),
      k('Passing a bicyclist: change lanes completely, as you would for a car.', 58, 'When passing bicyclists, you must completely change lanes'),
      k('Check for bikes coming up behind you before you turn right.', 58, 'Watch for bicyclists coming from behind, especially before turning right.')],
    videos: [{ yt: '9KHhHqb9_E0', title: 'TDS Talks, Pedestrian and Bicycle Safety', channel: 'teensinthedriverseat', len: '9:40', iowa: 'Iowa’s manual: when passing a bicyclist, move completely into the next lane, and don’t move back until you can see the bicyclist in your rearview mirror.' }],
    questions: [
      q('w3d3q1', 'When may you drive in a bike lane?', ['Never, for any reason at all', 'Only to turn, after checking for bikes', 'Whenever no bikes are in sight ahead of you', 'To pass a slow car on the right side'], 1,
        'Look beside and behind you first, and cross with care.', 17, 'Motorists may only drive in bicycle lanes when making turning movements'),
      q('w3d3q2', 'You’re passing a bicyclist on the road. How much room do you give?', ['About two feet of room, if you slow way down', 'Enough to squeeze past after you honk', 'None; stay behind them the whole way', 'The whole lane: change lanes completely'], 3,
        'Pass a bicyclist the way you’d pass a car.', 58, 'When passing bicyclists, you must completely change lanes, giving the bicyclist the entire lane like you would with any other vehicle.'),
      q('w3d3q3', 'After passing a bicyclist, when may you move back to the right?', ['When you see them in your rearview mirror', 'Right away, once your front bumper is past', 'After you count to two', 'When the bicyclist waves you over'], 0,
        'Cutting back in too soon can clip them.', 58, 'Do not return to the right until you can see the bicyclist(s) in your rearview mirror.'),
      q('w3d3q4', 'A lane ahead is painted green with a bicycle on it. What should you do?', ['Use it as an extra turn lane when it’s busy', 'Park in it for a minute if no bikes come', 'Check for bikes; don’t stop on it', 'Speed up so you cross it quickly'], 2,
        'Green paint marks a bike lane or crossing.', 17, 'Motorists should not stop on green pavement.'),
      q('w3d3q5', '“Sharrows” (a bike with arrows painted in a regular lane) mean:', ['The lane is only for bicycles, never for cars', 'Cars may not use that lane at all', 'A separate bike lane starts just ahead', 'Bikes may use it too: share and pass safely'], 3,
        'Unlike a bike lane, the space isn’t only for bikes.', 17, 'Unlike bike lanes, sharrows do not designate a particular portion of the roadway for the exclusive use of bicycles.'),
      q('w3d3q6', 'The car in the next lane stops for a pedestrian. May you pass it?', ['Yes, if you go slowly and carefully', 'No: never pass a car stopped for a pedestrian', 'Yes, after a short tap of the horn', 'Only if the walker is almost across'], 1,
        'The stopped car can hide the person crossing.', 58, 'Never pass another vehicle that has stopped or is slowing down for a pedestrian.'),
      q('w3d3q7', 'May bicyclists ride on the road?', ['Yes: they have the right to be on the road', 'No, they belong on the sidewalk', 'Only on marked bike paths', 'Only in daylight hours'], 0,
        'They’re often not allowed on sidewalks, so respect their place on the road.', 58, 'People riding bicycles have the right to be on the road'),
      q('w3d3q8', 'A green box with a bicycle is painted at an intersection, just past the stop line. It is:', ['A spot where bikes may be parked', 'Where cars wait to turn right on a red light', 'A bike box, for bikes to wait and turn', 'A stop for city buses'], 2,
        'Stop behind it on red.', 17, 'Bicycle boxes are pavement markings that are installed to allow bicyclists a safe way to turn at a signalized intersection.')
    ]
  },
  {
    id: 'w3d4', title: 'Changing lanes safely',
    key: [k('Change lanes one lane at a time.', 44, 'Only change lanes one lane at a time.'),
      k('Signal first, so other drivers know your plan.', 44, 'Inform other drivers of your plans by proper signaling.'),
      k('Check the far lane too: someone there may be moving into the same lane.', 44, 'someone in that lane may be planning to move into the same lane you want to enter.')],
    videos: [{ yt: 'JaUZJsEyRV4', title: 'How to Know When It’s Safe to Change Lanes (Basic Road Test Skill)', channel: 'Zutobi Drivers Ed', len: '7:57', iowa: 'Iowa’s manual: signal, check your mirrors and blind spot, keep your speed, and move one lane at a time.' }],
    questions: [
      q('w3d4q1', 'You need to move two lanes to the left. How do you do it?', ['Cross both lanes in one smooth move', 'Only with your hazard lights on', 'One lane at a time', 'Slow down to let both lanes clear'], 2,
        'Signal and check again before each lane.', 44, 'Only change lanes one lane at a time.'),
      q('w3d4q2', 'What should your speed do while you change lanes?', ['Stay the same, unless you’re moving into a slower lane', 'Drop a lot, so you have extra time to look all around you', 'Jump up quickly, to get ahead of traffic', 'Come almost to a stop first'], 0,
        'Slowing down suddenly can cause a crash behind you.', 44, 'do it carefully but without slowing down unless you are moving into a slower lane of traffic.'),
      q('w3d4q3', 'Three lanes go your way and you’re moving into the middle one. Why look at the far lane too?', ['The far lane is only for trucks and buses', 'A car there may be moving into the same lane', 'To read the signs above that lane', 'It doesn’t matter; only the lane you’re moving into does'], 1,
        'Two cars merging into one lane at the same time is a common crash.', 44, 'someone in that lane may be planning to move into the same lane you want to enter.'),
      q('w3d4q4', 'Which of these counts as a lane change?', ['Turning into a driveway on your right', 'Stopping at a red light', 'Backing out of your garage', 'Pulling away from the curb into traffic'], 3,
        'So does merging from an entrance ramp.', 44, 'Entering the roadway from the curb or shoulder.'),
      q('w3d4q5', 'Before you move into the next lane, who goes first?', ['Vehicles already in that lane', 'You do, once your signal is on', 'Whoever is driving faster', 'Only trucks, because they’re bigger'], 0,
        'Make sure there’s room before you move.', 44, 'yield to any vehicles already in that lane'),
      q('w3d4q6', 'Your mirror shows a car about to pass you on the side you want to move to. What do you do?', ['Move over quickly before it reaches you', 'Speed up and move in ahead of it', 'Wait: make sure nobody is about to pass you', 'Signal and move over; it will slow down for you'], 2,
        'Let it pass, then check again.', 44, 'Make sure that nobody is about to pass you.'),
      q('w3d4q7', 'What should you keep doing during the lane change itself?', ['Look only at the road straight ahead', 'Keep checking the traffic around you', 'Watch the GPS on your phone', 'Look down at the dashboard'], 1,
        'Someone can come up on you unexpectedly.', 44, 'While you are changing lanes, constantly check traffic so you will see anyone coming up on you unexpectedly.'),
      q('w3d4q8', 'On a road with two lanes going your way, the left lane is generally for:', ['Slow trucks and farm equipment', 'Parking during off-peak hours', 'Turning right at the next corner', 'Passing'], 3,
        'Move back right after you pass.', 16, 'the left lane is generally used for passing.')
    ]
  },
  { id: 'w3d5', title: 'Unit 3 test', review: true, videos: [], questions: [] },
  // ---- Unit 4: right of way, roundabouts and Iowa intersections (2.22, 5.1, 5.3-5.5). Facts read off the page pictures (pp. 18-19, 52-55, 58).
  {
    id: 'w4d1', title: 'Who goes first: stops and intersections without signs',
    key: [k('All-way stop: the first to stop goes first.', 19, 'At an all-way stop, the driver reaching the intersection first gets to go first'),
      k('Arrive at the same time: the car on the right goes first.', 19, 'For vehicles arriving at the same time, the vehicle to the right gets to go first.'),
      k('No signs or signals: every driver slows down and approaches carefully.', 19, 'it’s the responsibility of all drivers to slow down and approach carefully.')],
    videos: [{ yt: '7MODqVaQVuY', title: 'Who Goes First? 2-Way Stop Right of Way Rules Explained!', channel: 'Stan Cravens', len: '4:48', iowa: 'Iowa’s manual: at a two-way stop, cross traffic doesn’t stop; from the stop sign, wait until crossing traffic and the crosswalk are clear.' },
      { yt: '3bYMB7q6khs', title: 'Right of Way Rules: Who Goes First at a 4-Way Stop? (2026)', channel: 'Master Road Signs', len: '4:05', iowa: 'Iowa’s manual: at an all-way stop, the first to arrive (after a full stop) goes first; arriving together, the car on the right goes first.' }],
    questions: [
      q('w4d1q1', 'At an all-way stop, which driver goes first?', ['The one going straight, ahead of anyone turning', 'The first one to reach it, after a full stop', 'The bigger vehicle, since it needs more room', 'Whoever waves the others through'], 1,
        'Everyone stops; then it goes in the order they arrived.', 19, 'At an all-way stop, the driver reaching the intersection first gets to go first'),
      q('w4d1q2', 'You and a car on your right reach an all-way stop at the same moment. Who goes first?', ['You, because the other car is on your right', 'Whoever is going straight through', 'Whoever is driving the larger vehicle', 'The car on your right'], 3,
        'Arriving together, the driver on the left yields.', 19, 'For vehicles arriving at the same time, the vehicle to the right gets to go first.'),
      q('w4d1q3', 'No signs or signals at an intersection. You and a car on your left arrive at about the same time. Who yields?', ['The car on your left yields to you', 'You yield to the car on your left', 'Whoever is driving faster goes first', 'Both stop and wait for someone to wave'], 0,
        'At an uncontrolled intersection, the driver on the left yields to the one on the right.', 19, 'The driver on the left (red car) must yield to the driver on the right (green car).'),
      q('w4d1q4', 'At an intersection with no stop sign or signal, what should every driver do?', ['Keep their speed; nobody has to stop', 'Honk before going through it', 'Slow down and approach carefully', 'Speed up to get through quickly'], 2,
        'Use extra caution where there are no signs or signals.', 19, 'it’s the responsibility of all drivers to slow down and approach carefully.'),
      q('w4d1q5', 'Do the right-of-way rules for intersections with signs also apply where there are none?', ['No: anyone may go once it looks clear', 'Only in towns, not out in the country', 'Only during the daytime hours', 'Yes: all the same rules apply'], 3,
        'Use extra caution at uncontrolled intersections.', 19, 'All of the rules listed above that apply at a controlled intersection also apply at an uncontrolled intersection.'),
      q('w4d1q6', 'You’ve stopped at a red light and want to turn right. May you?', ['Yes, unless a sign says you may not', 'No, never: wait for the green light', 'Only if a police officer waves you on', 'Only after the light turns yellow'], 0,
        'Stop first, then yield to traffic and people crossing.', 19, 'Right turns on red are permitted unless there is a sign prohibiting them.'),
      q('w4d1q7', 'Turning right on red after stopping, what must you also do?', ['Honk, so others know you’re turning', 'Turn quickly before the light changes', 'Yield to traffic and people crossing', 'Nothing else; the stop was enough'], 2,
        'The cars and walkers with the green go first.', 19, 'You must yield when you want to make a right turn after stopping at a red light.'),
      q('w4d1q8', 'At a two-way stop (cross traffic doesn’t stop), you want to turn left from the stop sign. Who goes first?', ['You, since you stopped first', 'Cross traffic going straight', 'Whoever is closest to the middle', 'Cars turning right from across'], 1,
        'At a stop sign, you wait until crossing traffic is clear.', 8, 'wait until crossing vehicles and the cross-walk are clear before proceeding.')
    ]
  },
  {
    id: 'w4d2', title: 'Turns, pedestrians, motorcycles and driveways',
    key: [k('Failing to yield is the #1 cause of traffic deaths in Iowa.', 18, 'FAILURE TO YIELD THE RIGHT-OF-WAY IS THE #1 CAUSE OF TRAFFIC-RELATED FATALITIES IN IOWA.'),
      k('Crossing a sidewalk or using a driveway: yield to people walking.', 19, 'Drivers crossing a sidewalk, entering or exiting a driveway, alley, or parking lot must yield to pedestrians.'),
      k('See a motorcycle and know its speed before you turn in front of it.', 58, 'Make sure you see the motorcycle and know its speed before you start to turn or enter an intersection.')],
    videos: [{ yt: 'ZdSCgNm4atQ', title: 'How to Turn Left at Intersections - Unprotected Left Turns', channel: 'Zutobi Drivers Ed', len: '12:05', iowa: 'Iowa’s manual: turning left, yield to oncoming traffic going straight, including motorcycles and bicycles.' }],
    questions: [
      q('w4d2q1', 'You’re turning left. A motorcycle is coming straight through from the other way. Who must yield?', ['The motorcycle, because it is smaller', 'Whoever reaches the middle first', 'You, the driver turning left', 'Neither; both may go together'], 2,
        'The same goes for a bicycle going straight.', 19, 'Drivers turning left must yield to oncoming cars that are going straight ahead.'),
      q('w4d2q2', 'Where are crashes between cars and motorcycles most likely?', ['At intersections', 'On long straight highways', 'In parking lots and garages', 'On gravel roads in the country'], 0,
        'Look twice for motorcycles before you turn.', 58, 'Intersections are the most likely places for car/ motorcycle collisions to occur.'),
      q('w4d2q3', 'Before you turn across a motorcycle’s path, what must you be sure of?', ['It has its turn signal on, so it must be turning', 'The rider has waved you on', 'It is at least a block away', 'You see it and know its speed'], 3,
        'Motorcycles are small and easy to misjudge.', 58, 'Make sure you see the motorcycle and know its speed before you start to turn or enter an intersection.'),
      q('w4d2q4', 'You’re backing out of a driveway across the sidewalk. Who goes first?', ['You, since you’re in a car', 'People on the sidewalk', 'Whoever moves first', 'Cars on the street only'], 1,
        'The same goes for alleys and parking lots.', 19, 'Drivers crossing a sidewalk, entering or exiting a driveway, alley, or parking lot must yield to pedestrians.'),
      q('w4d2q5', 'May you drive on a sidewalk to get around stopped traffic?', ['No: only to cross it', 'Yes, if no one is walking', 'Yes, at low speed', 'Only to reach a driveway'], 0,
        'Driving along a sidewalk is illegal.', 19, 'It is illegal to drive on a sidewalk except to cross it.'),
      q('w4d2q6', 'A person is waiting at a corner with no painted crosswalk. Must you yield?', ['No, only at painted crosswalks', 'Yes: marked or unmarked, you yield', 'Only if they wave at you', 'Only near a school'], 1,
        'Every intersection corner can be a crosswalk.', 19, 'You must yield or stop for pedestrians in marked or unmarked crosswalks.'),
      q('w4d2q7', 'Before turning at an intersection or driveway, who should you look for?', ['Only cars coming toward you from the other way', 'Only cars behind you', 'Only traffic lights and signs', 'Walkers, bikes, skaters and wheelchairs'], 3,
        'They can be hard to see and move into your path.', 58, 'Be especially careful to look for pedestrians, bicyclists, skaters, and people using wheelchairs or low-speed micromobility devices before turning at intersections and driveways.'),
      q('w4d2q8', 'What is the number one cause of traffic deaths in Iowa?', ['Driving in snow and ice', 'Deer on the road at night', 'Failing to yield the right-of-way', 'Flat tires on the highway'], 2,
        'Knowing who goes first saves lives.', 18, 'FAILURE TO YIELD THE RIGHT-OF-WAY IS THE #1 CAUSE OF TRAFFIC-RELATED FATALITIES IN IOWA.')
    ]
  },
  {
    id: 'w4d3', title: 'Roundabouts',
    key: [k('Traffic goes counterclockwise around the center island.', 54, 'Roundabouts are intersections that direct traffic in a counterclockwise direction around a center island.'),
      k('Entering: yield to traffic already in the roundabout.', 54, 'When entering the roundabout, yield to all traffic already in the roundabout.'),
      k('Don’t change lanes in the roundabout.', 54, 'Do not change lanes in the roundabout.')],
    videos: [{ yt: 'cvdkJnA3QgY', title: 'Roundabouts in Iowa', channel: 'Iowa DOT Answers', len: '3:08' },
      { yt: 'peUf2NRdWxs', title: 'Rules of the Roundabout', channel: 'Federal Highway Administration USDOTFHWA', len: '2:16', iowa: 'Iowa’s manual: yield to people in the crosswalk and to traffic already in the roundabout; don’t change lanes or stop inside it.' }],
    questions: [
      q('w4d3q1', 'Which way does traffic go around a roundabout?', ['Clockwise, keeping the island on your right', 'Either way, whichever exit is closer', 'Straight across the center island', 'Counterclockwise around the center island'], 3,
        'In the U.S. you go to the right and around.', 54, 'Roundabouts are intersections that direct traffic in a counterclockwise direction around a center island.'),
      q('w4d3q2', 'You’re entering a roundabout. Who has the right-of-way?', ['You, once you reach the yield line', 'Traffic already in the roundabout', 'Whoever is going farther around', 'The vehicle on your right side'], 1,
        'Wait for a gap, then merge in.', 54, 'When entering the roundabout, yield to all traffic already in the roundabout.'),
      q('w4d3q3', 'As you approach a roundabout, who do you yield to first?', ['Cars waiting to enter beside you', 'Nobody until you reach the circle', 'Anyone in the crosswalk', 'Only bicycles on the shoulder'], 2,
        'Slow to the posted advisory speed as you come up to it.', 54, 'Slow down to the posted advisory speed and yield to anyone in the crosswalk.'),
      q('w4d3q4', 'In a multi-lane roundabout, may you change lanes?', ['No', 'Yes, if you signal first', 'Yes, to reach your exit', 'Only when it is empty'], 0,
        'Pick your lane before you enter.', 54, 'Do not change lanes in the roundabout.'),
      q('w4d3q5', 'When do you signal to leave a roundabout?', ['As soon as you enter, so everyone knows your plan', 'You don’t signal in a roundabout', 'After passing the street before your exit', 'Only when another car is close'], 2,
        'Signal right, then exit.', 54, 'After passing the street before your exit, signal for a right turn, then exit.'),
      q('w4d3q6', 'In a roundabout, a truck is in the lane next to you. What should you do?', ['Don’t pass it or ride beside it', 'Pass it quickly on the inside', 'Honk so the driver sees you', 'Stay right beside its cab'], 0,
        'Trucks may straddle lanes or not see you.', 54, 'Do not pass or drive beside trucks or buses.'),
      q('w4d3q7', 'In a multi-lane roundabout, how do you pick your lane?', ['Any lane at all, then switch inside once you can see your exit', 'Always the outside lane', 'Always the inside lane', 'By the signs and markings, before the yield line'], 3,
        'Choose before you enter; you can’t change inside.', 54, 'select the appropriate lane according to the lane control signs and pavement markings.'),
      q('w4d3q8', 'Should you stop inside a roundabout to let someone enter?', ['Yes, to be polite', 'No: keep moving and avoid stopping', 'Yes, if they honk', 'Only for trucks and buses'], 1,
        'Stopping inside can cause a crash behind you.', 54, 'Avoid stopping in the roundabout.'),
      q('w4d3q9', 'What is the truck apron around a roundabout’s center island for?', ['The rear wheels of long vehicles like semis', 'A place for cars to pass a slow truck safely', 'Parking for a quick stop', 'People walking across'], 0,
        'Never walk across the circle to the center island.', 55, 'Truck apron: designed to accommodate the rear wheels of long vehicles')
    ]
  },
  {
    id: 'w4d4', title: 'Iowa’s reduced-conflict intersections and diverging diamonds',
    key: [k('Reduced-conflict intersection: to go left or across, turn right, then U-turn at the median.', 52, 'will turn right onto the highway, merge into the left lane and then make a U-turn at a designated median opening.'),
      k('You only watch one direction of highway traffic at a time.', 52, 'drivers are only concerned with one direction of traffic on the highway at a time.'),
      k('A diverging diamond briefly puts you on the opposite side of the road.', 53, 'it directs drivers on the opposite side of the road briefly before diverging back into the correct direction.')],
    videos: [{ yt: 'xOqMwNLKKto', title: 'Reduced Conflict Intersections', channel: 'Iowa DOT Answers', len: '3:44' },
      { yt: 'bxkur5Wl4Ok', title: 'Navigating the Diverging Diamond Interchange', channel: 'Iowa DOT Answers', len: '4:30' }],
    questions: [
      q('w4d4q1', 'At a reduced-conflict intersection, you’re on the side road and want to go left onto the four-lane highway. What do you do?', ['Turn right, move left, then U-turn at the median opening', 'Wait for a gap both ways, then cross and turn left like at any other road', 'Turn left straight across the median gap', 'Drive on the shoulder to the next crossing'], 0,
        'You never cross both directions at once.', 52, 'will turn right onto the highway, merge into the left lane and then make a U-turn at a designated median opening.'),
      q('w4d4q2', 'Why are reduced-conflict intersections safer?', ['There are traffic lights and stop signs on every corner of it', 'The speed limit there is always 25 mph', 'You watch one direction of highway traffic at a time', 'Trucks are not allowed to use them'], 2,
        'Fewer places where vehicles can crash into each other.', 52, 'drivers are only concerned with one direction of traffic on the highway at a time.'),
      q('w4d4q3', 'At a reduced-conflict intersection, must you wait for a gap in both directions?', ['Yes, before you cross either way', 'No: only one direction at a time', 'Yes, and honk before you go', 'Only at night when it’s dark'], 1,
        'That’s what makes it safer than a normal crossing.', 52, 'You don’t need to wait for a gap in both directions to cross the major road.'),
      q('w4d4q4', 'What is unusual about a diverging diamond interchange?', ['It has no traffic lights at all anywhere', 'It only lets trucks and buses use the ramps late at night', 'It makes every car stop at a stop sign', 'It briefly puts you on the opposite side of the road'], 3,
        'Follow the lane lines and signals; they guide you back.', 53, 'it directs drivers on the opposite side of the road briefly before diverging back into the correct direction.'),
      q('w4d4q5', 'Why are diverging diamond interchanges built?', ['So cars can pass trucks on the ramps', 'So traffic spends less time at traffic lights', 'So drivers can park under the bridge', 'So the speed limit can be raised'], 1,
        'They keep busy interchanges moving.', 53, 'A diverging diamond interchange maximizes efficiency by requiring traffic to spend less time at a traditional traffic light controlled intersection.'),
      q('w4d4q6', 'Where is a diverging diamond interchange used?', ['On quiet gravel roads in the country', 'Only inside parking garages', 'At school drop-off lanes', 'Where two busy, high-volume roads meet'], 3,
        'Ankeny’s I-35 and First Street is one.', 53, 'This type of interchange is used at the intersection of two high-volume traffic roads.'),
      q('w4d4q7', 'What is a reduced-conflict intersection designed to reduce?', ['The places where vehicles can crash into each other', 'The number of lanes on the highway', 'The speed limit on the side road', 'The number of signs and signals drivers must read on the way'], 0,
        'Fewer conflict points mean fewer crashes.', 52, 'Reduced-conflict intersections are designed to reduce the number of conflict points where vehicles can crash into each other.')
    ]
  },
  { id: 'w4d5', title: 'Unit 4 test', review: true, videos: [], questions: [] }
];
