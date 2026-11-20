// Eli's knowledge tests: practice for Iowa's written permit test, kept apart from the daily lessons.
// A form is a fixed set of 25 questions (4 choices each) with a fixed number per topic, so scores from different sittings
// can be compared (overall and per topic). Topic weights follow Iowa DOT's online practice test, whose
// questions are mostly from chapter 2 (signs, signals, school buses, emergency vehicles, railroad crossings).
// Every answer comes from the Iowa Driver's License Manual: each quote is checked against its page
// (tests/driving.test.mjs). Answers are stored like lesson answers: answers/<question>/<sitting>.
// APPEND ONLY: never change a question once a sitting has used it (old scores are rebuilt from it).

const q = (id, topic, question, choices, answer, why, page, quote) => ({ id, topic, q: question, choices, answer, why, ref: "Iowa Driver's Manual p." + page, quote });

// How many questions each form has per topic. From a tally of Iowa DOT's 68 practice questions, scaled to
// 25: signs 10, signals and markings 5, right of way 3, school buses and emergency vehicles 10, railroad and
// work zones 4, alcohol and phones 3, speed/turns/passing/lights (and other general rules) 23, highways,
// weather and road types 10.
export const BLUEPRINT = { 'Signs': 4, 'Signals and markings': 2, 'Right of way': 1, 'School buses and emergency vehicles': 4, 'Railroad crossings and work zones': 2, 'Alcohol and phones': 1, 'Speed, turns, passing and lights': 7, 'Highways, weather and road types': 4 };

export const TOPICS = ['Signs', 'Signals and markings', 'Right of way', 'School buses and emergency vehicles', 'Railroad crossings and work zones', 'Alcohol and phones', 'Speed, turns, passing and lights', 'Highways, weather and road types'];

export const FORMS = {
  A: [
    { ...q('tA01', 'Signs', 'A fluorescent yellow-green sign warns you about:', ['Road work and lane closures ahead', 'A park or recreation area', 'Pedestrians, bicycles, or a school', 'A hospital nearby'], 2,
      'Yellow-green is used for pedestrian, bicycle and school warnings.', 6, 'Pedestrian, bicycle, and school warning signs.'), sign: { shape: 'pentagon', color: 'yellow-green' } },
    { ...q('tA02', 'Signs', 'An eight-sided (octagon) sign always means:', ['Stop', 'Yield', 'Railroad crossing ahead', 'No passing zone'], 0,
      'The octagon shape is used only for stop signs.', 7, 'OCTAGON DIAMOND Shape is reserved for a stop sign only.'), sign: { shape: 'octagon', color: 'red' } },
    { ...q('tA03', 'Signs', 'A round (circle) warning sign means:', ['A stop sign is ahead', 'A rest area is ahead', 'The speed limit changes soon', 'Railroad crossing ahead'], 3,
      'A circle warns of a railroad crossing; a triangle means yield.', 7, 'CIRCLE Yield the right of way. Railroad crossing ahead.'), sign: { shape: 'circle', color: 'yellow' } },
    { ...q('tA04', 'Signs', 'An orange triangle on the back of a vehicle means the vehicle:', ['Is carrying a wide load', 'Travels 35 mph or less', 'Is going to an emergency', 'Has hazardous materials'], 1,
      'It’s a slow-moving vehicle sign: farm equipment, road equipment or a horse-drawn wagon.', 11, 'A reflective orange triangle on the rear of a vehicle means it is traveling 35 mph or less.'), sign: { shape: 'smv' } },
    q('tA05', 'Signals and markings', 'A flashing red traffic light means:', ['Treat it the same as a stop sign', 'Slow down and go on with caution', 'It’s broken, so go if it looks clear', 'Stop only if other cars are there'], 0,
      'Come to a full stop, then go when it’s clear.', 11, 'Flashing red Treat it the same as a stop sign.'),
    q('tA06', 'Signals and markings', 'A flashing yellow traffic light means:', ['Stop and wait for the green light', 'Speed up before it turns red', 'Go with caution, yielding first', 'The lane ahead is closed to traffic'], 2,
      'Yield to vehicles and pedestrians, then go carefully.', 11, 'Flashing yellow Proceed with caution.'),
    q('tA07', 'Right of way', 'You’re turning left, and an oncoming car is going straight. Who must yield?', ['The oncoming car going straight', 'Whoever signaled their turn first', 'Whoever got to the intersection last', 'You, the driver turning left'], 3,
      'Left turns yield to oncoming traffic going straight.', 19, 'Drivers turning left must yield to oncoming cars that are going straight ahead.'),
    q('tA08', 'School buses and emergency vehicles', 'On a two-lane road, a school bus coming toward you has its amber (yellow) lights flashing. You must:', ['Keep going; amber means it’s leaving', 'Slow to 20 mph or less, ready to stop', 'Pass it quickly before it can stop', 'Stop at once and wait for it to pass'], 1,
      'Amber lights mean the bus is about to stop; red lights and the stop arm mean stop.', 20, 'you must slow your vehicle to no more than 20 mph and be prepared to stop.'),
    q('tA09', 'School buses and emergency vehicles', 'On a road with four or more lanes, a school bus in the opposite lanes is stopped with its stop arm out. Must you stop?', ['Yes, from any direction', 'No, not when meeting it', 'Only if you see children', 'Only on school days'], 1,
      'Four or more lanes and you’re meeting it from the front: you don’t stop. From behind, you always stop.', 20, 'This is the only time you may pass a school bus that is stopped and has its stop arm extended.'),
    q('tA10', 'School buses and emergency vehicles', 'An ambulance with its siren on is coming toward you on an undivided road. You should:', ['Pull over to the right edge', 'Stop right where you are', 'Speed up to get out of its way', 'Pull over to the left side'], 0,
      'Pull to the right for an emergency vehicle coming from any direction (drive through an intersection first).', 19, 'Pull over to the right edge of the road, or as near to the right as possible, when you see or hear an emergency vehicle approaching from any direction.'),
    q('tA11', 'School buses and emergency vehicles', 'A tow truck is stopped on the shoulder with its lights flashing. Iowa’s Move Over law says to:', ['Honk to warn the driver as you go by', 'Keep your speed, since it’s on the shoulder', 'Stop behind it and wait until it leaves', 'Change lanes, or slow down if you can’t'], 3,
      'It applies to emergency, tow, maintenance and other stopped vehicles with flashing lights, and any car with its hazard lights on.', 22, 'If a lane change is not possible, prohibited by law, or unsafe, you must slow down and be prepared to stop.'),
    q('tA12', 'Railroad crossings and work zones', 'You stop at a railroad crossing. How much room should you leave between your car and the nearest rail?', ['At least 3 feet', 'None; pull right up to it', 'At least 15 feet', 'At least 100 feet'], 2,
      'Trains are wider than the tracks.', 12, 'When stopped, leave at least 15 feet between the front and rear of your vehicle and the nearest rail.'),
    q('tA13', 'Railroad crossings and work zones', 'What is the basic color of work zone signs?', ['Orange', 'Yellow', 'Red', 'Brown'], 0,
      'Orange means road work: watch for lower speed limits and workers.', 14, 'Orange is the basic color of these signs and warning devices.'),
    q('tA14', 'Alcohol and phones', 'What is the lowest blood alcohol level at which a driver under 21 is considered to be driving while intoxicated?', ['.08 or more', '.02 or more', '.10 or more', 'Only after failing a walking test'], 1,
      'The limit is much stricter for underage drivers.', 37, 'with a BAC of .02 or more. An underage driver will have their driving privileges revoked'),
    q('tA15', 'Speed, turns, passing and lights', 'If no speed limit is posted, what is the limit in a residential district?', ['20 mph', '35 mph', '45 mph', '25 mph'], 3,
      'Business district 20, residential or school district 25, suburban 45.', 42, '25 mph in a residential district or school district'),
    q('tA16', 'Speed, turns, passing and lights', 'The speed limit is 45 mph or less. How far before a turn must you signal?', ['At least 50 feet', 'At least 300 feet', 'At least 100 feet', 'Only when cars are around'], 2,
      'Faster than 45 mph: at least 300 feet.', 43, 'Iowa law requires you to signal at least 100 feet before a turn if the speed limit is 45 mph or less'),
    q('tA17', 'Speed, turns, passing and lights', 'After passing a car, when should you move back into your lane?', ['When your back bumper passes its front', 'When the other driver flashes the headlights', 'When its front shows in your rearview mirror', 'As soon as you have counted to three'], 2,
      'Wait until you see its front in the mirror and you’re well clear, then signal and move back gently.', 45, 'When you see the front of the passed car in the rearview mirror and your vehicle is well clear'),
    q('tA18', 'Speed, turns, passing and lights', 'Iowa law requires headlights from sunset to sunrise and whenever visibility is:', ['500 feet or less', '1,000 feet or less', '100 feet or less', 'Never in the daytime'], 0,
      'Rule of thumb: wipers on, headlights on.', 49, 'Iowa law requires the use of both headlights from sunset to sunrise or whenever visibility is 500 feet or less'),
    q('tA19', 'Speed, turns, passing and lights', 'As a new driver on a dry road, what following distance should you keep, at least?', ['One second', 'Three seconds', 'Half a car length', 'Ten feet'], 1,
      'Six or more seconds when the road is slippery.', 41, 'An inexperienced or beginning driver should maintain at least a three-second following distance under normal driving conditions.'),
    q('tA20', 'Speed, turns, passing and lights', 'When backing up, what about mirrors and backup cameras?', ['Use them as your main view, with a quick look back', 'Trust the camera; it shows more than turning your head', 'Check them once before you start backing', 'Don’t rely on them alone; turn your head'], 3,
      'They don’t show everything and can fool you about distance.', 43, 'Do not depend on mirrors or backup cameras alone as they don’t provide a full view'),
    q('tA21', 'Speed, turns, passing and lights', 'Posted maximum speed limits are meant for:', ['Ideal driving conditions', 'Any weather, day or night', 'Daytime driving only', 'Cars, but not trucks'], 0,
      'In rain, snow or fog you must slow down below the limit.', 8, 'Maximum speed limits are for ideal driving conditions.'),
    q('tA22', 'Highways, weather and road types', 'On a freeway entrance ramp, what do you do in the acceleration area?', ['Stop and wait for a big gap', 'Drive slowly so others see you', 'Match traffic’s speed and merge', 'Merge right away at any speed you like'], 2,
      'Don’t stop on the ramp unless you absolutely must.', 51, 'Use this area to bring your vehicle up to the speed of traffic and merge when safe to do so.'),
    q('tA23', 'Highways, weather and road types', 'On a loose gravel road you should:', ['Keep your speed so the tires don’t dig in', 'Slow down and leave more room', 'Drive in the center, away from the soft edges', 'Brake firmly so the gravel can’t slide you'], 1,
      'Tires have less grip on gravel: avoid sudden turns, and speed up and brake slowly.', 55, 'Slow down, avoid sudden turning, accelerate and brake slowly, and increase your following distance.'),
    q('tA24', 'Highways, weather and road types', 'How much following distance should you leave behind a motorcycle?', ['About 1 second', 'Half of one car length', 'Very little; they stop slowly', 'At least 3 to 4 seconds'], 3,
      'Motorcycles can stop quickly.', 58, 'When driving behind a motorcycle, allow at least a 3-4 second following'),
    q('tA25', 'Highways, weather and road types', 'What causes hydroplaning?', ['Water deeper than your tire tread', 'Driving too slowly in the rain', 'Tires that are still cold', 'Using cruise control on dry roads'], 0,
      'The tires ride on the water and lose grip. Slow down when you see deep water.', 60, 'Hydroplaning occurs as a result of water on the road that is deeper than the tire tread.')
  ],
  // Form B: progress test 1 (after unit 2). New questions only: no stem from Form A or the lessons. num: a number question
  // (Form A has 9; new forms keep within one of that). Facts read off the manual's page pictures.
  B: [
    { ...q('tB01', 'Signs', 'You see a sign shaped like this ahead. What should you watch for?', ['Children near a school area or crossing', 'A train approaching on the tracks just ahead of you', 'Hospital traffic turning in and out', 'Hikers crossing near a state park'], 0,
      'This five-sided shape is only used for schools.', 7, 'School crossing. Signs mark school areas and school crossings.'), sign: { shape: 'pentagon', color: 'yellow-green' } },
    { ...q('tB02', 'Signs', 'Where is a white X-shaped sign like this posted?', ['Where two highways cross each other', 'At the start of every no passing zone', 'At each railroad crossing', 'Where a road is closed to traffic'], 2,
      'A number under it shows how many sets of tracks you’ll cross.', 7, 'Railroad crossing signs are placed at each crossing.'), sign: { shape: 'crossbuck', color: 'white' } },
    { ...q('tB03', 'Signs', 'A yellow diamond sign like this warns that the divided highway ends. What should you watch for?', ['A lane opening up for passing on your right side', 'A toll booth', 'The end of the speed limit', 'Oncoming vehicles: the center strip is ending'], 3,
      'Two-way traffic is no longer separated.', 9, 'Two-way traffic will no longer be divided by a center strip. Watch out for oncoming vehicles.'), sign: { shape: 'diamond', color: 'yellow' } },
    { ...q('tB04', 'Signs', 'A yellow diamond sign like this shows a horse and buggy. What should you do?', ['Honk so the horse knows you are behind it', 'Slow down and pass slowly', 'Speed up and pass quickly before it turns', 'Flash your lights to warn the driver'], 1,
      'Horse-drawn vehicles are slow and can spook.', 9, 'Be alert for slow-moving, horse-drawn vehicles on the roadways. Reduce your speed and pass slowly.'), sign: { shape: 'diamond', color: 'yellow' } },
    q('tB05', 'Signals and markings', 'You’re already in the intersection turning left when your arrow turns steady yellow. What do you do?', ['Stop where you are and wait for the next green', 'Back up to the stop line', 'Finish your turn', 'Turn on your hazard lights and wait'], 2,
      'If you haven’t entered yet and can stop safely, don’t go.', 11, 'Complete your left or right turn if you are already within the intersection.'),
    q('tB06', 'Signals and markings', 'A red X light shows over a lane. What does it mean?', ['You may not drive in that lane', 'The lane is only for turning left at the next light', 'Change lanes when you can', 'Drive slowly in that lane'], 0,
      'A green arrow means you may use the lane under it.', 15, 'a red “X” means you may not'),
    q('tB07', 'Right of way', 'You’re pulling out of a driveway onto a street. Who goes first?', ['You do, once you signal your turn', 'Whoever is larger', 'Whoever got there first, as at a four-way stop', 'Vehicles already on the street'], 3,
      'The same goes for alleys and pulling off the roadside.', 19, 'Drivers entering a road from a driveway, alley, or roadside must yield to vehicles already on the main road.'),
    q('tB08', 'School buses and emergency vehicles', 'On a four-lane highway you come up behind a school bus that has stopped with its stop arm out. What must you do?', ['Pass it slowly in the left lane', 'Stop behind it: from behind, you always stop', 'Nothing; four lanes means you don’t stop', 'Honk and wait for it to wave you by'], 1,
      'Only traffic meeting it from the front on four or more lanes doesn’t stop.', 20, 'When approaching from the rear, the rules are the same as for a two- or three- lane road.'),
    { ...q('tB09', 'School buses and emergency vehicles', 'How far behind an emergency vehicle using lights and sirens should you stay?', ['At least 100 feet', 'At least 500 feet', 'At least 50 feet', 'About two car lengths'], 1,
      'Give it room to stop or turn suddenly.', 19, 'Stay at least 500 feet behind any emergency vehicle using lights and sirens.'), num: true },
    { ...q('tB10', 'School buses and emergency vehicles', 'What can happen if you illegally pass a stopped school bus?', ['A warning only, for a first offense', 'A fine, but no effect on your license', 'Nothing unless children are hurt', 'Your license may be suspended for up to 180 days'], 3,
      'It’s one of the most serious violations a new driver can make.', 20, 'Violating this law may result in your license being suspended for up to 180 days.'), num: true },
    q('tB11', 'School buses and emergency vehicles', 'On a two-lane road with a center turn lane, a school bus coming toward you stops with its stop arm out. Must you stop?', ['Yes: on three lanes or fewer, everyone stops', 'No: the turn lane separates you', 'Only if children are crossing', 'No: only traffic behind the bus stops'], 0,
      'A center turn lane makes it three lanes, so both directions stop.', 20, '3 lanes or fewer: all vehicles must stop'),
    q('tB12', 'Railroad crossings and work zones', 'Your car stalls on railroad tracks and a train is coming. After getting everyone out, which way do you go?', ['Straight away from the tracks the way the train is going', 'Back into the car to keep trying to start it', 'Away from the tracks at an angle, toward the approaching train', 'Down the tracks, away from the train'], 2,
      'Moving toward the train keeps you out of the path of flying debris.', 12, 'move away from the tracks at a 45-degree angle, in the direction of the approaching train'),
    { ...q('tB13', 'Railroad crossings and work zones', 'What can happen to traffic fines in a work zone?', ['Nothing changes in work zones', 'Fines go down for a first offense', 'Only trucks pay higher fines', 'Fines may double'], 3,
      'Workers are inches from traffic; slow down and stay alert.', 14, 'fines may double in work area zones'), num: true },
    q('tB14', 'Alcohol and phones', 'Where may an open container of alcohol be carried in a car?', ['On the floor of the back seat, if a passenger holds it', 'In the trunk', 'In the glove box', 'Anywhere, if the driver hasn’t been drinking'], 1,
      'Open containers anywhere else are illegal, for drivers and passengers.', 37, 'Open containers of alcoholic beverages may be transported in the trunk of a vehicle.'),
    { ...q('tB15', 'Speed, turns, passing and lights', 'If no speed limit is posted, what is the limit in a business district?', ['20 mph', '25 mph', '35 mph', '45 mph'], 0,
      'Residential or school district: 25; suburban: 45.', 42, '20 mph in any business district'), num: true },
    { ...q('tB16', 'Speed, turns, passing and lights', 'The speed limit is 55 mph. How far before a turn must you signal?', ['At least 100 feet', 'Only when other cars are near', 'At least 300 feet', 'At least 50 feet'], 2,
      '45 mph or less: at least 100 feet.', 43, 'if the speed limit is faster than 45 mph, you must signal at least 300 feet before you turn.'), num: true },
    { ...q('tB17', 'Speed, turns, passing and lights', 'How close to an intersection may you pass another vehicle?', ['Anywhere, if no one is coming', 'Within 50 feet', 'No closer than 100 feet', 'Right up to the corner, if you signal'], 2,
      'The same goes for railroad crossings and narrow bridges.', 46, 'Do not pass within 100 feet of an intersection.'), num: true },
    q('tB18', 'Speed, turns, passing and lights', 'When backing up, which way do you turn the steering wheel?', ['The direction you want the car to go', 'The opposite way from where you want to go', 'Keep it straight; never turn while backing', 'Whichever way the mirror shows is clear'], 0,
      'Look back through the rear window in the direction you’re moving.', 43, 'Turn your wheel in the direction you want the car to travel.'),
    { ...q('tB19', 'Speed, turns, passing and lights', 'Parking on a street with a curb, how close to the curb must you be?', ['Within 3 feet', 'Anywhere in the parking lane', 'Within 2 feet, or closer', 'Within 18 inches, or closer'], 3,
      'Park as far from traffic as you can.', 21, 'park within 18 inches of the curb or closer.'), num: true },
    { ...q('tB20', 'Speed, turns, passing and lights', 'How close to a fire hydrant may you park?', ['Within 2 feet', 'No closer than 5 feet', 'Right beside it, if you stay in the car', 'No closer than 1 foot'], 1,
      'Firefighters need to reach it fast.', 21, 'Closer than five feet from a fire hydrant'), num: true },
    q('tB21', 'Speed, turns, passing and lights', 'As a rule, how many vehicles should you pass at one time?', ['As many as you can see ahead', 'Two, if the road is straight', 'Three, if they are slow trucks', 'One'], 3,
      'Passing a line of cars leaves you nowhere to go.', 45, 'As a rule, only pass one vehicle at a time.'),
    { ...q('tB22', 'Highways, weather and road types', 'On ice and snow, stopping distances can be how much greater?', ['Up to 10 times greater', 'About the same as on dry pavement', 'About twice as long', 'Just a few feet longer'], 0,
      'Leave far more room in winter.', 61, 'Stopping distances can be 10 times greater in ice and snow.'), num: true },
    q('tB23', 'Highways, weather and road types', 'A snowplow is clearing the road ahead. Where should you never pass it?', ['On the left, in the passing lane of a two-lane road', 'On the shoulder side', 'Anywhere on the interstate', 'Behind it, at a safe distance'], 1,
      'Plows push snow to the shoulders.', 61, 'Never pass on the shoulder side of a plow.'),
    q('tB24', 'Highways, weather and road types', 'Where are a large truck’s blind spots, or no-zones?', ['Only directly behind the trailer', 'Only beside the cab on the right side', 'In front, behind and along both sides', 'Nowhere, since trucks have big mirrors'], 2,
      'If you can’t see the driver in their mirror, they can’t see you.', 57, 'Large trucks have blind spots, or “no-zones,” around the front, back, and sides of the vehicle.'),
    q('tB25', 'Highways, weather and road types', 'You’re on the interstate and a car is merging from the ramp. What should you do?', ['Move over, slow down or speed up so it can get in', 'Keep your speed and lane; the merging car must wait', 'Honk to warn it', 'Stop in your lane'], 0,
      'Help merging traffic in safely.', 51, 'Traffic already on an interstate or highway should move over, slow down, or speed up to allow ramp traffic to enter.')
  ]
};

// Sittings, in order. Each uses one form (a new form every sitting). A sitting opens on its `from` date and/or once the
// lesson named in `after` (a unit test) is finished.
export const SITTINGS = [
  { id: 'base', form: 'A', title: 'Baseline knowledge test', from: '2026-11-18' },
  { id: 'p1', form: 'B', title: 'Progress test 1', after: 'w2d5' }
];

// Pass mark of Iowa DOT's online practice test (25 questions, 80%).
export const PASS = 0.8;
