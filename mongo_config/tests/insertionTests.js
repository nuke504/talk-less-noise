// Test these inserts

// noiseCollation Tests
let noiseCollationInserts = [
  {
    attemptId: "testApp-1",
    area: "angMoKio",
    documentTime: new Date(),
    noiseCategory: "baby",
  },
  {
    attemptId: "testApp-2",
    area: "angMoKio",
    documentTime: new Date(),
  },
  {
    attemptId: "testApp-3",
    area: "bedok",
    documentTime: new Date(),
    noiseCategory: "fan",
  },
];

db.noiseCollation.insertOne(noiseCollationInserts[0]); // Works
db.noiseCollation.insertOne(noiseCollationInserts[1]); // Fail
db.noiseCollation.insertOne(noiseCollationInserts[2]); // Fail

// quietHours Tests
let quietHoursInserts = [
  {
    attemptId: "testApp-1",
    area: "angMoKio",
    documentTime: new Date(),
    hours: [
      { start: new NumberInt("0"), end: new NumberInt("8") },
      { start: new NumberInt("3"), end: new NumberInt("10") },
    ],
  },
  {
    attemptId: "testApp-2",
    area: "angMoKio",
    documentTime: new Date(),
    hours: [
      { start: new NumberInt("0"), end: new NumberInt("8") },
      { start: new NumberInt("24"), end: new NumberInt("10") },
    ],
  },
  {
    attemptId: "testApp-3",
    area: "angMoKio",
    documentTime: new Date(),
    hours: { start: new NumberInt("0"), end: new NumberInt("8") },
  },
  {
    attemptId: "testApp-4",
    area: "sembawang",
    documentTime: new Date(),
    hours: [{ start: new NumberInt("2"), end: new NumberInt("10") }],
  },
];

db.quietHours.insertOne(quietHoursInserts[0]); // Works
db.quietHours.insertOne(quietHoursInserts[1]); // Fail
db.quietHours.insertOne(quietHoursInserts[2]); // Fail
db.quietHours.insertOne(quietHoursInserts[3]); // Works

// noiseCollation Tests
let noisyThresholdInserts = [
  {
    attemptId: "testApp-1",
    area: "angMoKio",
    documentTime: new Date(),
    noiseCategory: "baby",
    threshold: 1.5,
  },
  {
    attemptId: "testApp-2",
    area: "angMoKio",
    documentTime: new Date(),
    threshold: 9,
  },
];

db.noisyThreshold.insertOne(noisyThresholdInserts[0]); // Works
db.noisyThreshold.insertOne(noisyThresholdInserts[1]); // Fail

// noiseCollation Tests
let niceThresholdInserts = [
  {
    attemptId: "testApp-1",
    area: "angMoKio",
    documentTime: new Date(),
    threshold: 1.5,
  },
  {
    attemptId: "testApp-2",
    area: "angMoKio",
    documentTime: new Date(),
    threshold: -0.5,
  },
];

db.niceThreshold.insertOne(niceThresholdInserts[0]); // Works
db.niceThreshold.insertOne(niceThresholdInserts[1]); // Fail

// Usage Stat Test
let journeyMapSample = {
  attemptId: "testApp-1",
  area: "angMoKio",
  startTime: new Date(),
};

let journeyMapUpdate1 = [
  {
    attemptId: "testApp-1",
  },
  {
    $push: {
      checkpoints: {
        description: "noiseCollation",
        start: new Date(),
        end: new Date(),
      },
    },
  },
];

let journeyMapUpdate2 = [
  {
    attemptId: "testApp-1",
  },
  { $set: { endTime: new Date(), complete: true } },
];

db.journeyMap.insertOne(journeyMapSample); // Works
db.journeyMap.updateOne(journeyMapUpdate1[0], journeyMapUpdate1[1]);
db.journeyMap.updateOne(journeyMapUpdate2[0], journeyMapUpdate2[1]);

db.journeyMap.update(
  {
    attemptId: "test-17fdb6e4-e18f-11eb-94cc-acde48001122",
  },
  {
    $set: { "checkpoints.$[cp].end": ISODate("2021-07-10T21:28:51.860777") },
  },
  { arrayFilters: [{ "cp.description": "test-checkpoint-1" }] }
);
