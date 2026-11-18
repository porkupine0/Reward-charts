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
    q('tA01', 'Signs', 'A fluorescent yellow-green sign warns you about:', ['Road work and lane closures ahead', 'A park or recreation area', 'Pedestrians, bicycles, or a school', 'A hospital nearby'], 2,
      'Yellow-green is used for pedestrian, bicycle and school warnings.', 6, 'Pedestrian, bicycle, and school warning signs.'),
    q('tA02', 'Signs', 'An eight-sided (octagon) sign always means:', ['Stop', 'Yield', 'Railroad crossing ahead', 'No passing zone'], 0,
      'The octagon shape is used only for stop signs.', 7, 'OCTAGON DIAMOND Shape is reserved for a stop sign only.'),
    q('tA03', 'Signs', 'A round (circle) warning sign means:', ['A stop sign is ahead', 'A rest area is ahead', 'The speed limit changes soon', 'Railroad crossing ahead'], 3,
      'A circle warns of a railroad crossing; a triangle means yield.', 7, 'CIRCLE Yield the right of way. Railroad crossing ahead.'),
    q('tA04', 'Signs', 'An orange triangle on the back of a vehicle means the vehicle:', ['Is carrying a wide load', 'Travels 35 mph or less', 'Is going to an emergency', 'Has hazardous materials'], 1,
      'It’s a slow-moving vehicle sign: farm equipment, road equipment or a horse-drawn wagon.', 11, 'A reflective orange triangle on the rear of a vehicle means it is traveling 35 mph or less.'),
    q('tA05', 'Signals and markings', 'A flashing red traffic light means:', ['Treat it the same as a stop sign', 'Slow down and go on with caution', 'It’s broken, so go if it looks clear', 'Stop only if other cars are there'], 0,
      'Come to a full stop, then go when it’s clear.', 11, 'Flashing red Treat it the same as a stop sign.'),
    q('tA06', 'Signals and markings', 'A flashing yellow traffic light means:', ['Stop and wait for the green light', 'Speed up before it turns red', 'Go with caution, yielding first', 'The lane ahead is closed to traffic'], 2,
      'Yield to vehicles and pedestrians, then go carefully.', 11, 'Flashing yellow Proceed with caution.'),
    q('tA07', 'Right of way', 'You’re turning left, and an oncoming car is going straight. Who must yield?', ['The oncoming car going straight', 'Whichever of the two is bigger', 'Whoever got to the intersection last', 'You, the driver turning left'], 3,
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
    q('tA14', 'Alcohol and phones', 'A driver under 21 is considered to be driving while intoxicated at what blood alcohol level?', ['.08 or more', '.02 or more', '.10 or more', 'Only after failing a walking test'], 1,
      'The limit is much stricter for underage drivers.', 37, 'IMPLIED CONSENT TO TESTING with a BAC of .02 or more. An underage driver'),
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
    q('tA20', 'Speed, turns, passing and lights', 'When backing up, what about mirrors and backup cameras?', ['Use them alone, since they show everything', 'Watch only the rear camera the whole time', 'Check them once before you start backing', 'Don’t rely on them alone; turn your head'], 3,
      'They don’t show everything and can fool you about distance.', 43, 'Do not depend on mirrors or backup cameras alone as they don’t provide a full view'),
    q('tA21', 'Speed, turns, passing and lights', 'Posted maximum speed limits are meant for:', ['Ideal driving conditions', 'Any weather, day or night', 'Daytime driving only', 'Cars, but not trucks'], 0,
      'In rain, snow or fog you must slow down below the limit.', 8, 'Maximum speed limits are for ideal driving conditions.'),
    q('tA22', 'Highways, weather and road types', 'On a freeway entrance ramp, what do you do in the acceleration area?', ['Stop and wait for a big gap', 'Drive slowly so others see you', 'Match traffic’s speed and merge', 'Merge right away at any speed you like'], 2,
      'Don’t stop on the ramp unless you absolutely must.', 51, 'Use this area to bring your vehicle up to the speed of traffic and merge when safe to do so.'),
    q('tA23', 'Highways, weather and road types', 'On a loose gravel road you should:', ['Brake hard and turn quickly', 'Slow down and leave more room', 'Drive the limit in the middle', 'Follow close to see through dust'], 1,
      'Tires have less grip on gravel: avoid sudden turns, and speed up and brake slowly.', 55, 'Slow down, avoid sudden turning, accelerate and brake slowly, and increase your following distance.'),
    q('tA24', 'Highways, weather and road types', 'How much following distance should you leave behind a motorcycle?', ['About 1 second', 'Half of one car length', 'Very little; they stop slowly', 'At least 3 to 4 seconds'], 3,
      'Motorcycles can stop quickly.', 58, 'When driving behind a motorcycle, allow at least a 3-4 second following'),
    q('tA25', 'Highways, weather and road types', 'What causes hydroplaning?', ['Water deeper than your tire tread', 'Driving too slowly in the rain', 'Tires that are still cold', 'Using cruise control on dry roads'], 0,
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
