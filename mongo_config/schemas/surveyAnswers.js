// Commands to be run in the mongoDB shell for configuration
// use surveyAnswers;

// Create collection with dataschema
// Create collection for noiseCollation

// These fields are meant to be included in all surveyResults collections but not in usageStatistics
const AREAS = [
  "sembawang",
  "woodlands",
  "yishun",
  "angMoKio",
  "hougang",
  "punggol",
  "sengkang",
  "serangoon",
  "bedok",
  "pasirRis",
  "tampines",
  "bukitBatok",
  "bukitPanjang",
  "choaChuKang",
  "clementi",
  "jurongEast",
  "jurongWest",
  "tengah",
  "bishan",
  "bukitMerah",
  "bukitTimah",
  "centralBusinessDistrict",
  "geylang",
  "whampoa",
  "kallang",
  "marineParade",
  "queenstown",
  "toaPayoh",
];
const NOISE_CATEGORIES = [
  "pets",
  "furniture",
  "baby",
  "works",
  "music",
  "others",
];
const GENERIC_FIELDS = ["attemptId", "area", "documentTime"];
const GENERIC_PROPERTIES = {
  attemptId: {
    title: "AttemptID of Attempt",
    bsonType: "string",
    description:
      "Should be in the form of <appID>-<attemptId>. Same AttemptID for all records belonging to the same attempt",
  },
  area: {
    title: "Area where participant stays",
    enum: AREAS,
    description:
      "String that describes the generic town that the participant is from",
  },
  documentTime: {
    title: "Document Datetime",
    bsonType: "date",
    description: "Datetime when document was added",
  },
};
const schemas = {
  noiseCollation: {
    bsonType: "object",
    required: [...GENERIC_FIELDS, "noiseCategory"],
    properties: {
      ...GENERIC_PROPERTIES,
      noiseCategory: {
        title: "Most Annoying Noise Category",
        enum: NOISE_CATEGORIES,
        description:
          "String that describes the the most annoying noise category",
      },
    },
  },
  quietHours: {
    bsonType: "object",
    required: [...GENERIC_FIELDS, "hours"],
    properties: {
      ...GENERIC_PROPERTIES,
      hours: {
        title: "Quiet Hours",
        bsonType: "array",
        description: "Array of quiet hour sections",
        items: {
          bsonType: "object",
          required: ["start", "end"],
          properties: {
            start: {
              title: "Start of quiet hours",
              bsonType: "int",
              minimum: 0,
              maximum: 23,
              description: "Start of a section of quiet hours",
            },
            end: {
              title: "End of quiet hours",
              bsonType: "int",
              minimum: 0,
              maximum: 23,
              description: "End of a section of quiet hours",
            },
          },
        },
      },
    },
  },
  threshold: {
    bsonType: "object",
    required: [
      ...GENERIC_FIELDS,
      "noiseCategory",
      "noisyThreshold",
      "niceThreshold",
    ],
    properties: {
      ...GENERIC_PROPERTIES,
      noiseCategory: {
        title: "Most Annoying Noise Category",
        enum: NOISE_CATEGORIES,
        description:
          "String that describes the the most annoying noise category",
      },
      noisyThreshold: {
        title: "Threshold for annoying noise",
        bsonType: "double",
        minimum: 0,
        description:
          "Double that shows the threshold for the annoying noise category",
      },
      threshold: {
        title: "Threshold for nice music",
        bsonType: "double",
        minimum: 0,
        description: "Double that shows the threshold for nice music",
      },
    },
  },
};

// Create collections
db.createCollection("noiseCollation", {
  validator: {
    $jsonSchema: schemas.noiseCollation,
  },
  validationLevel: "strict",
  validationAction: "error",
});

db.createCollection("quietHours", {
  validator: {
    $jsonSchema: schemas.quietHours,
  },
  validationLevel: "strict",
  validationAction: "error",
});

db.createCollection("threshold", {
  validator: {
    $jsonSchema: schemas.threshold,
  },
  validationLevel: "strict",
  validationAction: "error",
});

// Create index
db.noiseCollation.createIndex({ attemptId: 1 }, { unique: true });
db.quietHours.createIndex({ attemptId: 1 }, { unique: true });
db.threshold.createIndex({ attemptId: 1 }, { unique: true });

// Aggregate tests
// let total = db.noiseCollation.count();
// db.noiseCollation.aggregate([
//   {
//     $group: {
//       _id: { noiseCategory: "$noiseCategory", area: "$area" },
//       count: { $sum: 1 },
//     },
//   },
//   {
//     $project: {
//       count: 1,
//       percentage: {
//         $multiply: [{ $divide: ["$count", { $literal: total }] }, 100],
//       },
//     },
//   },
// ]);

// db.noiseCollation.aggregate([{ $count: "count" }]);

// db.quietHours.aggregate([
//   { $unwind: "$hours" },
//   { $project: { attemptId: 1, hours: { $objectToArray: "$hours" } } },
//   { $project: { attemptId: 1, hours: { $concatArrays: ["$hours.v"] } } },
//   {
//     $group: {
//       _id: "$_id",
//       attemptId: { $first: "$attemptId" },
//       hours: { $push: "$hours" },
//     },
//   },
//   {
//     $project: {
//       attemptId: 1,
//       collatedHours: {
//         $let: {
//           vars: { hoursArr: { $range: [0, 24, 0] } },
//           in: {},
//         },
//       },
//     },
//   },
// ]);

// db.quietHours.aggregate([
//   { $unwind: "$hours" },
//   {
//     $project: {
//       area: 1,
//       hoursArray: {
//         $cond: {
//           if: { $gt: ["$hours.start", "$hours.end"] },
//           then: {
//             $concatArrays: [
//               { $range: ["$hours.start", 24, 1] },
//               { $range: [0, "$hours.end", 1] },
//             ],
//           },
//           else: { $range: ["$hours.start", "$hours.end", 1] },
//         },
//       },
//     },
//   },
//   { $unwind: "$hoursArray" },
//   { $project: { quietHour: "$hoursArray", area: 1 } },
//   {
//     $group: {
//       _id: { quietHour: "$quietHour", area: "$area" },
//       count: { $sum: 1 },
//     },
//   },
//   {
//     $project: {
//       quietHour: "$_id.quietHour",
//       count: 1,
//       _id: 0,
//       area: "$_id.area",
//     },
//   },
//   { $sort: { area: 1, quietHour: 1 } },
// ]);

// db.niceThreshold.aggregate([
//   { $group: { _id: null, averageThreshold: { $avg: "$threshold" } } },
// ]);

// db.niceThreshold.find({}, { $avg: "$threshold" });

// {
//   $bucket: {
//     groupBy: "$quietHour",
//     boundaries: [
//       0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
//       20, 21, 22, 23, 24,
//     ],
//     default: "exception",
//   },
