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

let APP_NAME;
if (process.env.REACT_APP_NAME) {
  APP_NAME = process.env.REACT_APP_NAME;
} else {
  APP_NAME = "talk-less-noise-dev";
}
export { APP_NAME };

let API_ADDRESS;
if (process.env.REACT_APP_API_ADDRESS) {
  API_ADDRESS = process.env.REACT_APP_API_ADDRESS;
} else {
  API_ADDRESS = "http://localhost:8000/api";
}
export { API_ADDRESS };

export const TIMEOUT_SECONDS = 9000;
export const INITIAL_STATE = {
  errorTitle: null,
  errorMessage: null,

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
  hours: [],
  noisyThreshold: null,
  niceThreshold: null,
};
