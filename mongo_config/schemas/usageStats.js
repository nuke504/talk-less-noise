// Use usageStats

let schemasUs = {
  journeyMap: {
    bsonType: "object",
    required: ["attemptId", "startTime"],
    properties: {
      attemptId: {
        title: "AttemptID of Attempt",
        bsonType: "string",
        description:
          "Should be in the form of <appID>-<attemptId>. Same AttemptID for all records belonging to the same attempt",
      },
      startTime: {
        title: "Attempt Start Time",
        bsonType: "date",
        description: "Attempt Start Time",
      },
      checkpoints: {
        title: "Checkpoints of Attempt",
        bsonType: "array",
        description:
          "Array of checkpoints, each checkpoint having a description, start time and end time",
        items: {
          bsonType: "object",
          required: ["description", "start"],
          properties: {
            description: {
              title: "Checkpoint Description",
              bsonType: "string",
              description: "Description of checkpoint",
            },
            start: {
              title: "Start of checkpoint",
              bsonType: "date",
              description: "Time where checkpoint start",
            },
            end: {
              title: "End of quiet hours",
              bsonType: "date",
              description: "Time where checkpoint ends",
            },
          },
        },
      },
      endTime: {
        title: "Attempt End Time",
        bsonType: "date",
        description: "Attempt End Time",
      },
      complete: {
        title: "Completed?",
        bsonType: "bool",
        description: "Whether attempt completed",
      },
      incompleteReason: {
        title: "Reason for incomplete attempt",
        bsonType: "string",
        description: "Reason for incomplete attempt",
      },
    },
  },
};

// Create collections
db.createCollection("journeyMap", {
  validator: {
    $jsonSchema: schemasUs.journeyMap,
  },
  validationLevel: "strict",
  validationAction: "error",
});

// Create index
db.journeyMap.createIndex({ attemptId: 1 }, { unique: true });
