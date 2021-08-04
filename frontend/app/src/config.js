export const AGE_GROUP = ["<20", "20-29", "30-39", "40-49", "50-59", ">60"];
export const AREAS = ["northeast", "north", "central", "west", "east"];
export const NOISE_CATEGORIES = [
  "pets",
  "furniture",
  "baby",
  "works",
  "music",
  "others",
];

export const NOISE_DESCRIPTION = new Map([
  ["pets", "pets"],
  ["furniture", "furniture"],
  ["baby", "baby cries"],
  ["works", "renovation"],
  ["music", "music"],
  ["others", "others"],
]);

export const KEY_MAPPING = ["1", "2", "3", "4", "5", "6"];
export const APP_NAME = "talk-less-noise-testing";
export const API_ADDRESS = "http://localhost:8000/api";
// export const API_ADDRESS = "https://talk-less-noise.azurewebsites.net/api";
export const TIMEOUT_SECONDS = 30;
export const INITIAL_STATE = {
  attemptId: null,
  area: null,
  numFamilyMembers: null,
  ageGroup: null,
  neighbourNoiseIsProblem: null,

  // For usageStats
  startTime: null,
  endTime: null,
  checkpoints: [],
  complete: null,
  incompleteReason: null,

  // All survey answers
  noiseCategory: null,
  quietHours: [],
  noisyThreshold: null,
  niceThreshold: null,
};
