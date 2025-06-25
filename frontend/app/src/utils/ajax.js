import axios from "axios";
import { API_ADDRESS, DEFAULT_HEADERS } from "../config";
import { appInsights } from "../appInsights";

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
  token = null,
}) {
  const startTime = Date.now();
  const requestId = `${method}_${relativeUrl}_${startTime}`;
  
  try {
    // Track dependency call start (use trackDependencyData, not trackDependency)
    appInsights.trackDependencyData({
      target: API_ADDRESS,
      name: `${method} ${relativeUrl}`,
      data: relativeUrl,
      duration: 0,
      success: true,
      id: requestId,
      type: "Ajax",
      dependencyTypeName: "HTTP"
    });

    // Track custom event for API call initiation
    appInsights.trackEvent({
      name: 'APIRequestStarted',
      properties: {
        method: method,
        endpoint: relativeUrl,
        hasToken: !!token,
        hasData: !!data,
        requestId: requestId
      }
    });

    const apiUrl = `${API_ADDRESS}${relativeUrl}`;
    let response;
    const actualToken = await token;

    // Merge headers: DEFAULT_HEADERS + x-client-name + Authorization
    const headers = {
      ...DEFAULT_HEADERS,
      "x-client-name": "talk-less-noise-frontend",
      ...(actualToken && { Authorization: `Bearer ${actualToken}` }),
    };

    switch (method) {
      case "GET":
        response = await axios.get(apiUrl, { params, headers });
        break;
      case "POST":
        if (!data) throw new Error("postData cannot be null for POST request");

        response = await axios.post(apiUrl, data, {
          headers,
        });
        if (!response.data?.acknowledged) {
          throw new Error(
            `POST Successful but server not updated ${response.data}`
          );
        }
        break;

      case "PUT":
        response = await axios.put(apiUrl, data, {
          headers,
        });

        if (!response.data?.acknowledged) {
          throw new Error(
            `PUT Successful but server not updated ${response.data}`
          );
        }
        break;
      default:
        throw new Error(
          `${method} is not a valid method. Must be POST, GET or PUT`
        );
    }

    const duration = Date.now() - startTime;

    // Track successful dependency call
    appInsights.trackDependencyData({
      target: API_ADDRESS,
      name: `${method} ${relativeUrl}`,
      data: relativeUrl,
      duration: duration,
      success: true,
      id: requestId,
      type: "Ajax",
      dependencyTypeName: "HTTP",
      properties: {
        statusCode: response.status,
        responseSize: JSON.stringify(response.data).length
      }
    });

    // Track successful API call completion
    appInsights.trackEvent({
      name: 'APIRequestCompleted',
      properties: {
        method: method,
        endpoint: relativeUrl,
        statusCode: response.status,
        duration: duration,
        requestId: requestId,
        success: true
      },
      measurements: {
        responseTime: duration,
        responseSize: JSON.stringify(response.data).length
      }
    });

    console.log("Valid response: ", response);
    return response.data;

  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Track failed dependency call
    appInsights.trackDependencyData({
      target: API_ADDRESS,
      name: `${method} ${relativeUrl}`,
      data: relativeUrl,
      duration: duration,
      success: false,
      id: requestId,
      type: "Ajax",
      dependencyTypeName: "HTTP",
      properties: {
        errorType: error?.response ? 'ServerError' : error?.request ? 'NetworkError' : 'ClientError',
        statusCode: error?.response?.status,
        errorMessage: error.message
      }
    });

    // Track exception with detailed context
    appInsights.trackException({
      exception: error,
      properties: {
        method: method,
        endpoint: relativeUrl,
        requestId: requestId,
        apiUrl: `${API_ADDRESS}${relativeUrl}`,
        hasToken: !!token,
        hasData: !!data,
        errorType: error?.response ? 'ServerError' : error?.request ? 'NetworkError' : 'ClientError',
        statusCode: error?.response?.status,
        responseData: error?.response?.data ? JSON.stringify(error.response.data) : null
      },
      measurements: {
        requestDuration: duration
      }
    });

    // Track failed API call event
    appInsights.trackEvent({
      name: 'APIRequestFailed',
      properties: {
        method: method,
        endpoint: relativeUrl,
        requestId: requestId,
        errorType: error?.response ? 'ServerError' : error?.request ? 'NetworkError' : 'ClientError',
        statusCode: error?.response?.status,
        errorMessage: error.message
      },
      measurements: {
        failureDuration: duration
      }
    });

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
        console.error("Response status: ", error.response?.status);
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
export const getNoiseCollation = function ({
  errorHandler,
  columns = [],
  token,
}) {
  const params =
    columns.length > 0
      ? "?" + columns.map((n) => `group_by_columns=${n}`).join("&")
      : "";
  return request({
    method: "GET",
    relativeUrl: `/survey/noiseCollation${params}`,
    errorHandler,
    token,
  });
};

export const getQuietHours = function ({ errorHandler, columns = [], token }) {
  const params =
    columns.length > 0
      ? "?" + columns.map((n) => `group_by_columns=${n}`).join("&")
      : "";
  return request({
    method: "GET",
    relativeUrl: `/survey/quietHours${params}`,
    errorHandler,
    token,
  });
};

// Post methods
export const postStartAttempt = function (
  attemptId,
  startTime,
  errorHandler,
  token
) {
  request({
    method: "POST",
    relativeUrl: "/usage/attempt/start",
    data: {
      attemptId,
      startTime,
    },
    errorHandler,
    token,
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
  token,
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
    token,
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
  token,
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
    token,
  }).then((response) => console.log("Received response: ", response));
};

// Put methods
export const putCheckpoint = function (
  attemptId,
  description,
  time,
  errorHandler,
  token,
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
    token,
  }).then((response) => console.log("Received response: ", response));
};

export const putEndAttempt = function (
  attemptId,
  endTime,
  complete,
  errorHandler,
  token,
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
    token,
  }).then((response) => console.log("Received response: ", response));
};
