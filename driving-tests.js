// Eli's knowledge tests: practice for Iowa's written permit test, kept apart from the daily lessons.
// A form is a fixed set of 25 questions with a fixed number per topic, so scores from different sittings
// can be compared (overall and per topic). Topic weights follow Iowa DOT's online practice test, whose
// questions are mostly from chapter 2 (signs, signals, school buses, emergency vehicles, railroad crossings).
// Every answer comes from the Iowa Driver's License Manual: each quote is checked against its page
// (tests/driving.test.mjs). Answers are stored like lesson answers: answers/<question>/<sitting>.
// APPEND ONLY: never change a question once a sitting has used it (old scores are rebuilt from it).

const q = (id, topic, question, choices, answer, why, page, quote) => ({ id, topic, q: question, choices, answer, why, ref: "Iowa Driver's Manual p." + page, quote });

export const TOPICS = ['Signs', 'Signals and markings', 'Right of way', 'School buses and emergency vehicles', 'Railroad crossings and work zones', 'Alcohol and phones', 'Speed, turns, passing and lights', 'Highways, weather and road types'];

export const FORMS = {
  A: [
    q('tA01', 'Signs', 'A fluorescent yellow-green sign warns you about:', ['Road work', 'Pedestrians, bicycles, or a school', 'A recreation area', 'A hospital nearby'], 1,
      'Yellow-green is used for pedestrian, bicycle and school warnings.', 6, 'Pedestrian, bicycle, and school warning signs.'),
    q('tA02', 'Signs', 'An eight-sided (octagon) sign always means:', ['Yield', 'Railroad crossing ahead', 'Stop', 'No passing zone'], 2,
      'The octagon shape is used only for stop signs.', 7, 'Shape is reserved for a stop sign only.'),
    q('tA03', 'Signs', 'A round (circle) warning sign means:', ['Stop ahead', 'Railroad crossing ahead', 'Rest area ahead', 'Speed limit changes'], 1,
      'A circle warns of a railroad crossing ahead.', 7, 'Railroad crossing ahead.'),
    q('tA04', 'Signs', 'An orange triangle on the back of a vehicle means it is going:', ['35 mph or less', 'Over the speed limit', 'Carrying a wide load', 'To an emergency'], 0,
      'It’s a slow-moving vehicle sign: farm equipment, road equipment or a horse-drawn wagon.', 11, 'A reflective orange triangle on the rear of a vehicle means it is traveling 35 mph or less.'),
    q('tA05', 'Signals and markings', 'A flashing red traffic light means:', ['Slow down and go with caution', 'Treat it the same as a stop sign', 'The light is broken, so go if no one is coming', 'Stop only if other cars are there'], 1,
      'Come to a full stop, then go when it’s clear.', 11, 'Flashing red Treat it the same as a stop sign.'),
    q('tA06', 'Signals and markings', 'A flashing yellow traffic light means:', ['Stop and wait for green', 'Speed up before it turns red', 'Proceed with caution; yield to vehicles and pedestrians', 'The lane is closed'], 2,
      'You may go, carefully, after yielding.', 11, 'Flashing yellow Proceed with caution.'),
    q('tA07', 'Signals and markings', 'Yellow lines painted on the road separate:', ['Traffic moving in the same direction', 'Bike lanes from car lanes', 'Parking spaces', 'Traffic moving in opposite directions'], 3,
      'White lines separate traffic going the same way; yellow lines separate opposite directions.', 15, 'Yellow lines separate traffic moving in opposite directions.'),
    q('tA08', 'Right of way', 'You’re turning left, and an oncoming car is going straight. Who must yield?', ['The oncoming car', 'You, the driver turning left', 'Whichever vehicle is bigger', 'Whoever gets there second'], 1,
      'Left turns yield to oncoming traffic going straight.', 19, 'Drivers turning left must yield to oncoming cars that are going straight ahead.'),
    q('tA09', 'Right of way', 'Two cars reach an all-way stop at the same time. Who goes first?', ['The car on the left', 'The faster car', 'The car on the right', 'The car turning left'], 2,
      'Same time: the vehicle on the right goes first.', 19, 'For vehicles arriving at the same time, the vehicle to the right gets to go first.'),
    q('tA10', 'School buses and emergency vehicles', 'On a two-lane road, a school bus coming toward you has its amber (yellow) lights flashing. You must:', ['Slow to no more than 20 mph and be prepared to stop', 'Keep going; amber means the bus is leaving', 'Pass it quickly before it stops', 'Honk to warn the children'], 0,
      'Amber lights mean the bus is about to stop; red lights and the stop arm mean stop.', 20, 'you must slow your vehicle to no more than 20 mph and be prepared to stop.'),
    q('tA11', 'School buses and emergency vehicles', 'On a road with four or more lanes, you meet a stopped school bus with its stop arm out in the opposite lanes. Do you have to stop?', ['Yes, always', 'No: this is the only time you may pass a stopped school bus with its stop arm out', 'Only if you see children', 'Only on school days'], 1,
      'Four or more lanes and you’re meeting it from the front: you don’t stop. From behind, you always stop.', 20, 'This is the only time you may pass a school bus that is stopped and has its stop arm extended.'),
    q('tA12', 'School buses and emergency vehicles', 'An ambulance with its siren on is coming toward you on an undivided road. You should:', ['Pull over to the right edge of the road', 'Stop right where you are', 'Speed up to get out of its way', 'Pull over to the left'], 0,
      'Pull to the right for an emergency vehicle coming from any direction (drive through an intersection first).', 19, 'Pull over to the right edge of the road, or as near to the right as possible, when you see or hear an emergency vehicle approaching from any direction.'),
    q('tA13', 'School buses and emergency vehicles', 'A tow truck is stopped on the shoulder with its lights flashing. Iowa’s Move Over law says to:', ['Honk as you go by', 'Change lanes; if you can’t safely, slow down and be prepared to stop', 'Keep your speed, since it’s on the shoulder', 'Stop behind it'], 1,
      'This applies to emergency, tow, maintenance and other stopped vehicles with flashing lights, and any car with its hazard lights on.', 22, 'If a lane change is not possible, prohibited by law, or unsafe, you must slow down and be prepared to stop.'),
    q('tA14', 'Railroad crossings and work zones', 'You stop at a railroad crossing. How much room should you leave between your car and the nearest rail?', ['At least 3 feet', 'At least 15 feet', 'At least 100 feet', 'None; pull right up to it'], 1,
      'Trains are wider than the tracks.', 12, 'When stopped, leave at least 15 feet between the front and rear of your vehicle and the nearest rail.'),
    q('tA15', 'Railroad crossings and work zones', 'What is the basic color of work zone signs?', ['Yellow', 'Orange', 'Red', 'Brown'], 1,
      'Orange means road work: watch for lower speed limits and workers.', 14, 'Orange is the basic color of these signs and warning devices.'),
    q('tA16', 'Alcohol and phones', 'A driver under 21 is considered to be driving while intoxicated at what blood alcohol level?', ['.08 or more', '.10 or more', '.02 or more', 'Only if they fail a walking test'], 2,
      'The limit is much stricter for underage drivers.', 37, 'with a BAC of .02 or more.'),
    q('tA17', 'Alcohol and phones', 'With an instruction permit (under 18), when may you talk on the phone while driving?', ['Only hands-free', 'Only on country roads', 'Only when stopped off the traveled part of the road', 'Any time if the call is short'], 2,
      'Permit and intermediate drivers can’t make or take calls while driving, even hands-free.', 36, 'unless their vehicle is at a complete stop off the traveled portion of the roadway.'),
    q('tA18', 'Speed, turns, passing and lights', 'If no speed limit is posted, what is the limit in a residential district?', ['20 mph', '25 mph', '35 mph', '45 mph'], 1,
      'Business district 20, residential or school district 25, suburban 45.', 42, '25 mph in a residential district or school district'),
    q('tA19', 'Speed, turns, passing and lights', 'The speed limit is 45 mph or less. How far before a turn must you signal?', ['At least 50 feet', 'At least 100 feet', 'At least 300 feet', 'Only when other cars are around'], 1,
      'Faster than 45 mph: at least 300 feet.', 43, 'Iowa law requires you to signal at least 100 feet before a turn if the speed limit is 45 mph or less'),
    q('tA20', 'Speed, turns, passing and lights', 'After passing a car, when should you move back into your lane?', ['As soon as your back bumper is past its front bumper', 'When you see the front of the passed car in your rearview mirror and you’re well clear', 'When the other driver flashes their lights', 'After counting to ten'], 1,
      'Signal, then move back gently.', 45, 'When you see the front of the passed car in the rearview mirror and your vehicle is well clear'),
    q('tA21', 'Speed, turns, passing and lights', 'Iowa law requires headlights from sunset to sunrise and whenever visibility is:', ['1,000 feet or less', '500 feet or less', '100 feet or less', 'Never during the day'], 1,
      'Rule of thumb: wipers on, headlights on.', 49, 'Iowa law requires the use of both headlights from sunset to sunrise or whenever visibility is 500 feet or less'),
    q('tA22', 'Highways, weather and road types', 'On a freeway entrance ramp, what do you do in the acceleration area?', ['Stop and wait for a big gap', 'Bring your speed up to the speed of traffic and merge when safe', 'Drive slowly so others can see you', 'Merge right away at any speed'], 1,
      'Don’t stop on the ramp unless you absolutely must.', 51, 'Use this area to bring your vehicle up to the speed of traffic and merge when safe to do so.'),
    q('tA23', 'Highways, weather and road types', 'On a loose gravel road you should:', ['Brake hard and turn quickly', 'Slow down, avoid sudden turns, and increase your following distance', 'Drive at the speed limit in the middle of the road', 'Follow closely to see through the dust'], 1,
      'Tires have less grip on gravel.', 55, 'Slow down, avoid sudden turning, accelerate and brake slowly, and increase your following distance.'),
    q('tA24', 'Highways, weather and road types', 'How much following distance should you leave behind a motorcycle?', ['1 second', 'At least 3 to 4 seconds', 'Half a car length', 'None; motorcycles stop slowly'], 1,
      'Motorcycles can stop quickly.', 58, 'When driving behind a motorcycle, allow at least a 3-4 second following'),
    q('tA25', 'Highways, weather and road types', 'What causes hydroplaning?', ['Water on the road deeper than your tire tread', 'Driving too slowly in the rain', 'Cold tires', 'Using your headlights in rain'], 0,
      'The tires ride on the water and lose grip. Slow down when you see deep water.', 60, 'Hydroplaning occurs as a result of water on the road that is deeper than the tire tread.')
  ]
};

// Sittings, in order. Each uses one form. A sitting opens on its `from` date (and, later ones, once the
// lesson named in `after` is finished). Progress tests every two weeks will be added here.
export const SITTINGS = [
  { id: 'base', form: 'A', title: 'Baseline knowledge test', from: '2026-11-18' }
];

// Pass mark of Iowa DOT's online practice test (25 questions, 80%).
export const PASS = 0.8;
