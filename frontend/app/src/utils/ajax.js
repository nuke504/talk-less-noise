import axios from "axios";
import { API_ADDRESS } from "../config";

export const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const request = async function (
  method,
  relativeUrl,
  data = null,
  params = null
) {
  try {
    console.log("Posting", data);
    return {};
    const apiUrl = `${API_ADDRESS}${relativeUrl}`;
    let response;
    switch (method) {
      case "GET":
        response = await axios.get(apiUrl, { params });
        break;
      case "POST":
        if (!data) throw new Error("postData cannot be null for POST request");

        response = await axios.post(apiUrl, data);
        if (!response.data?.acknowledged) {
          throw new Error(
            `POST Successful but server not updated ${response.data}`
          );
        }

        break;

      case "PUT":
        response = await axios.put(apiUrl, data);

        if (!response.data?.acknowledged) {
          throw new Error(
            `POST Successful but server not updated ${response.data}`
          );
        }

        break;
      default:
        throw new Error(
          `${method} is not a valid method. Must be POST, GET or PUT`
        );
    }

    console.log("Valid response: ", response);

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("Server responded with invalid status");
      console.error(`You tried to ${method}`, data);
      console.error("Response data: ", error.response.data);
      console.error("Response status: ", error.response.status);
      console.error("Response headers: ", error.response.headers);
    } else if (error.request) {
      console.error("Server did not respond");
      console.error("Response status: ", error.response.status);
    } else {
      console.error("Other error: ", error.message);
    }
    console.log(error.config);
  }
};

// Post methods
export const postStartAttempt = function (attemptId, startTime) {
  request("POST", "/usage/attempt/start", {
    attemptId,
    startTime,
  }).then((response) => console.log("Received response: ", response));
};

// Put methods
export const putCheckpoint = function (
  attemptId,
  description,
  time,
  isStart = true
) {
  let data = { attemptId, description };

  if (isStart) {
    data.start = time;
  } else {
    data.end = time;
  }

  request("PUT", `/usage/checkpoint/${isStart ? "start" : "end"}`, data).then(
    (response) => console.log("Received response: ", response)
  );
};

export const putEndAttempt = function (attemptId, endTime, complete) {
  request("PUT", `/usage/attempt/end`, {
    attemptId,
    endTime,
    complete,
  }).then((response) => console.log("Received response: ", response));
};

export const postNoiseCollation = function ({
  attemptId,
  area,
  documentTime,
  numFamilyMembers,
  ageGroup,
  neighbourNoiseIsProblem,
  noiseCategory,
}) {
  request("POST", `/survey/noiseCollation`, {
    attemptId,
    area,
    documentTime,
    numFamilyMembers,
    ageGroup,
    neighbourNoiseIsProblem,
    noiseCategory,
  }).then((response) => console.log("Received response: ", response));
};
