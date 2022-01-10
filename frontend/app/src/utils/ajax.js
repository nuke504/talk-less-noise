import axios from "axios";
import { API_ADDRESS } from "../config";

export const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const request = async function ({
  method,
  relativeUrl,
  data = null,
  params = null,
  errorHandler = null,
}) {
  try {
    // console.log("Posting", data);
    // return {};
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
    if (error?.response) {
      if (errorHandler) {
        errorHandler(
          `Server responded with invalid status ${JSON.stringify(
            error.response.status
          )}`,
          `Response data: ${JSON.stringify(
            error.response.data
          )}. Response headers: ${JSON.stringify(
            error.response.headers
          )}. Error config ${JSON.stringify(error.config)}`
        );
      } else {
        console.error("Server responded with invalid status");
        console.error(`You tried to ${method}`, data);
        console.error("Response data: ", error.response.data);
        console.error("Response status: ", error.response.status);
        console.error("Response headers: ", error.response.headers);
      }
    } else if (error?.request) {
      if (errorHandler) {
        errorHandler(
          `Server did not respond ${JSON.stringify(error.response?.status)}`,
          `Error config ${JSON.stringify(error?.config)}`
        );
      } else {
        console.error("Server did not respond");
        console.error("Response status: ", error.response.status);
      }
    } else {
      if (errorHandler) {
        errorHandler(
          `Other error ${JSON.stringify(error?.message)}`,
          `Error config ${JSON.stringify(error?.config)}`
        );
      } else {
        console.error("Other error: ", error.message);
      }
    }
    if (!errorHandler) {
      console.log(error.config);
    }
  }
};

// Get methods
export const getNoiseCollation = function (errorHandler, ...columns) {
  const params =
    columns.length > 0
      ? "?" + columns.map((n) => `group_by_columns=${n}`).join("&")
      : "";
  return request({
    method: "GET",
    relativeUrl: `/survey/noiseCollation${params}`,
    errorHandler,
  });
};

export const getQuietHours = function (errorHandler, ...columns) {
  const params =
    columns.length > 0
      ? "?" + columns.map((n) => `group_by_columns=${n}`).join("&")
      : "";
  return request({
    method: "GET",
    relativeUrl: `/survey/quietHours${params}`,
    errorHandler,
  });
};

export const getThreshold = function (errorHandler, ...columns) {
  const params =
    columns.length > 0
      ? "?" + columns.map((n) => `group_by_columns=${n}`).join("&")
      : "";
  return request({
    method: "GET",
    relativeUrl: `/survey/threshold${params}`,
    errorHandler,
  });
};

// Post methods
export const postStartAttempt = function (attemptId, startTime, errorHandler) {
  request({
    method: "POST",
    relativeUrl: "/usage/attempt/start",
    data: {
      attemptId,
      startTime,
    },
    errorHandler,
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
  errorHandler,
}) {
  request({
    method: "POST",
    relativeUrl: `/survey/noiseCollation`,
    data: {
      attemptId,
      area,
      documentTime,
      numFamilyMembers,
      ageGroup,
      neighbourNoiseIsProblem,
      noiseCategory,
    },
    errorHandler,
  }).then((response) => console.log("Received response: ", response));
};

export const postQuietHours = function ({
  attemptId,
  area,
  documentTime,
  numFamilyMembers,
  ageGroup,
  neighbourNoiseIsProblem,
  hours,
  errorHandler,
}) {
  request({
    method: "POST",
    relativeUrl: `/survey/quietHours`,
    data: {
      attemptId,
      area,
      documentTime,
      numFamilyMembers,
      ageGroup,
      neighbourNoiseIsProblem,
      hours,
    },
    errorHandler,
  }).then((response) => console.log("Received response: ", response));
};

export const postThreshold = function ({
  attemptId,
  area,
  documentTime,
  numFamilyMembers,
  ageGroup,
  neighbourNoiseIsProblem,
  noiseCategory,
  noisyThreshold,
  niceThreshold,
  errorHandler,
}) {
  request({
    method: "POST",
    relativeUrl: `/survey/threshold`,
    data: {
      attemptId,
      area,
      documentTime,
      numFamilyMembers,
      ageGroup,
      neighbourNoiseIsProblem,
      noiseCategory,
      noisyThreshold,
      niceThreshold,
    },
    errorHandler,
  }).then((response) => console.log("Received response: ", response));
};

// Put methods
export const putCheckpoint = function (
  attemptId,
  description,
  time,
  errorHandler,
  isStart = true
) {
  let data = { attemptId, description };

  if (isStart) {
    data.start = time;
  } else {
    data.end = time;
  }

  request({
    method: "PUT",
    relativeUrl: `/usage/checkpoint/${isStart ? "start" : "end"}`,
    data,
    errorHandler,
  }).then((response) => console.log("Received response: ", response));
};

export const putEndAttempt = function (
  attemptId,
  endTime,
  complete,
  errorHandler,
  failReason = null
) {
  const data = {
    attemptId,
    endTime,
    complete,
  };

  if (failReason) data.failReason = failReason;

  request({
    method: "PUT",
    relativeUrl: `/usage/attempt/end`,
    data,
    errorHandler,
  }).then((response) => console.log("Received response: ", response));
};
