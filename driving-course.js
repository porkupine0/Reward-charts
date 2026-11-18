// APPEND ONLY: never reorder or remove lessons. Past days (his streak) are rebuilt from this order.
// Eli's driving course content. Each lesson is checked by checkCourse() in driving.js, every question's
// quote is checked against the saved Iowa Driver's License Manual (docs/iowa/drivers-manual.txt, page
// numbers as printed), and a parent previews and approves each lesson before Eli sees it.
// Video titles and channels were confirmed with YouTube (scripts/check-videos.mjs); lengths are approximate.

const q = (id, question, choices, answer, why, page, quote) => ({ id, q: question, choices, answer, why, ref: "Iowa Driver's Manual p." + page, quote });

export const LESSONS = [
  {
    id: 'w1d1', title: 'Look ahead: scanning the road',
    videos: [{ yt: 'nVWq4P1WMZQ', title: 'Vision in Driving - How to Scan Your Surroundings Correctly', channel: 'Zutobi Drivers Ed', len: '10:18',
      iowa: 'Iowa’s manual says to check your mirrors often and scan conditions 20 to 30 seconds ahead of you, keeping your eyes moving.' }],
    questions: [
      q('w1d1q1', 'How far ahead does Iowa’s manual say to scan conditions while you drive?', ['About 5 seconds ahead', '20 to 30 seconds ahead', 'Only to the car in front of you', 'As far as your headlights reach'], 1,
        'Looking well ahead gives you time to see trouble coming and react early.', 47, 'Check your mirrors frequently and scan conditions 20 to 30 seconds ahead of you.'),
      q('w1d1q2', 'Another driver near you is driving aggressively. What does the manual say to do?', ['Speed up to get away from them', 'Slow down or pull over to avoid them', 'Honk so they know you see them', 'Stay close so they can’t cut in'], 1,
        'Give an aggressive driver room; you can’t control them, only the space around you.', 47, 'If another driver is showing signs of aggressive driving, slow down or pull over to avoid them.'),
      q('w1d1q3', 'You have a green light. What should you assume about drivers on the cross street?', ['They will always stop for their red light', 'They will wave you through', 'One might run the red light, so be ready to react', 'Nothing; the green light protects you'], 2,
        'Defensive driving means not depending on other drivers to do the right thing.', 47, 'Assume that drivers will run through red lights or stop signs and be prepared to react.'),
      q('w1d1q4', 'What is the “escape route” the manual tells you to always leave yourself?', ['A place to move your vehicle if your path is suddenly blocked', 'The fastest way home', 'The shoulder you use to pass slow cars', 'The nearest exit ramp'], 0,
        'If the car ahead stops suddenly, having somewhere to go can keep you out of a crash.', 47, 'a place to move your vehicle if your immediate path of travel is suddenly blocked'),
      q('w1d1q5', 'Besides other cars, what does the manual say to keep an eye on along the road?', ['Only traffic lights', 'Billboards and signs', 'Pedestrians, bicyclists, and animals', 'Nothing else; watch the cars'], 2,
        'People, bikes and animals can move into the road quickly; scanning catches them early.', 47, 'Also, keep an eye on pedestrians, bicyclists, and animals along the road.')
    ]
  },
  {
    id: 'w1d2', title: 'Space ahead: following distance',
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
        'Counting seconds works at any speed; car lengths don’t.', 41, 'Watch the vehicle ahead of you pass a landmark, such as a sign, and begin slowly counting.'),
      q('w1d2q4', 'Someone is tailgating you. What does the manual suggest?', ['Move slightly to the right and signal early for turns, stops, or lane changes', 'Brake hard so they back off', 'Speed up to get away', 'Stop in your lane'], 0,
        'Give the tailgater a better view and plenty of warning; never brake-check.', 48, 'If you are being tailgated, move slightly to the right and give the tailgater a better view of what is ahead and signal early for turns, stops, or lane changes.'),
      q('w1d2q5', 'Why do faster speeds need more following distance?', ['Higher speeds require greater stopping distances', 'Fast cars have weaker brakes', 'It only matters at night', 'They don’t; distance is the same at any speed'], 0,
        'The faster you go, the farther you travel before you can stop.', 48, 'Higher speeds require greater stopping distances.')
    ]
  },
  {
    id: 'w1d3', title: 'Blind spots and mirrors',
    videos: [{ yt: 'uJ4w63wZyFQ', title: 'How to Shoulder (Head) Check When Turning & Changing Lanes', channel: 'Smart Drive Test', len: '5:45',
      iowa: 'Iowa’s manual: blind spots are areas you can’t see in your mirrors. Don’t drive in another driver’s blind spot, and never stay alongside a truck or bus.' }],
    questions: [
      q('w1d3q1', 'What is a blind spot?', ['An area outside your vehicle that can’t be seen using your mirrors', 'A dark spot on the windshield', 'The inside of the trunk', 'A stretch of road with no streetlights'], 0,
        'That’s why you turn your head to check before changing lanes.', 34, 'Blind spots are areas outside your vehicle that cannot be seen using mirrors.'),
      q('w1d3q2', 'You notice you’re driving in another car’s blind spot. What should you do?', ['Stay there; it’s their job to see you', 'Speed up or slow down so the driver can see you', 'Honk to let them know', 'Turn on your hazard lights'], 1,
        'If they can’t see you, they might move into your lane.', 34, 'Either speed up or slow down so the other driver can see your vehicle.'),
      q('w1d3q3', 'Why should you never stay alongside a truck or bus?', ['It’s against the law', 'They always speed up suddenly', 'They have large blind spots and it’s hard for them to see you', 'Their mirrors are smaller'], 2,
        'Big vehicles have big blind spots; get past or drop back.', 34, 'These vehicles have large blind spots and it is hard for them to see you.'),
      q('w1d3q4', 'How does the manual say to set your left-side mirror?', ['So you can see the whole side of your car', 'Lean your head toward the left window, then set it so you can barely see the side of the car', 'Point it at the road right behind you', 'So you can see the back seat'], 1,
        'Set this way, the mirror shows the next lane instead of your own car.', 25, 'Lean your head toward the left-side window, and set the left mirror so you can barely see the side of the car.'),
      q('w1d3q5', 'Where does sun glare most often create a blind spot?', ['The rear window', 'The front windshield', 'The side mirrors', 'The dashboard lights'], 1,
        'Sunglasses or the sun visor help when glare is bad.', 34, 'The front windshield is the most common place for glaring reflections and blind spots.')
    ]
  },
  {
    id: 'w1d4', title: 'Seeing hazards at intersections',
    videos: [{ yt: 'v0Soc-kicOQ', title: 'Scanning And Moving Through Intersections Safely', channel: 'Smart Drive Test', len: '7:27',
      iowa: 'Iowa’s manual: look left, right, and left again. Failure to yield the right-of-way is the number one cause of traffic deaths in Iowa.' }],
    questions: [
      q('w1d4q1', 'Before you go through an intersection, which way should you look for vehicles and pedestrians?', ['Right only', 'Left, right, and left again', 'Straight ahead only', 'Just in your mirror'], 1,
        'Traffic from the left reaches you first, so you look left again last.', 50, 'Look left, right, and left again for approaching vehicles and pedestrians.'),
      q('w1d4q2', 'An oncoming car has its turn signal on. Can you pull out in front of it?', ['No: wait until it actually starts to turn, then go if it’s safe', 'Yes, the signal means it’s turning', 'Yes, if you honk first', 'Only if it’s a motorcycle'], 0,
        'The driver may turn later or forgot the signal was on.', 50, 'Do not turn just because an approaching vehicle has a turn signal on.'),
      q('w1d4q3', 'Which of these counts as an intersection?', ['Only places with traffic lights', 'Only where two highways cross', 'Any place traffic merges or crosses, including driveways and parking lots', 'Only four-way stops'], 2,
        'Driveways and parking lot exits need the same careful look as a street corner.', 50, 'Intersections are any place where traffic merges or crosses.'),
      q('w1d4q4', 'What does the law about right-of-way do?', ['It says who must yield; it doesn’t give anyone the right-of-way', 'It gives bigger vehicles the right-of-way', 'It lets whoever arrives first go no matter what', 'It only applies to trucks'], 0,
        'Even when it’s the other driver’s turn to yield, do everything you can to avoid a crash.', 18, 'The law says who must yield the right-of-way'),
      q('w1d4q5', 'According to the manual, what is the number one cause of traffic-related deaths in Iowa?', ['Speeding', 'Failure to yield the right-of-way', 'Deer on the road', 'Bad weather'], 1,
        'Most of those crashes happen at intersections, which is why the careful look matters.', 18, 'FAILURE TO YIELD THE RIGHT-OF-WAY IS THE #1 CAUSE OF TRAFFIC-RELATED FATALITIES IN IOWA.')
    ]
  },
  { id: 'w1d5', title: 'Week 1 review', review: true, videos: [], questions: [] }
];
