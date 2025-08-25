/**
 * Use ServerCalls to hold the url path to the needed
 * backend calls as a dictionary. This allows for
 * the url paths to change on the backend without
 * effecting the frontend
 */
var ServerCalls = {};

let BASE_URL = "http://127.0.0.1:5000";

let RunOrderNumber = 0;

// These functions are not immediately used in seperate files, but they
// are general enough to grant them their own place

const BuildURI = (ServerCallsKey) => {
  return BASE_URL + ServerCalls[ServerCallsKey];
};

const getRunOrderNumber = () => {
  return RunOrderNumber;
};

const incrementRunOrderNumber = () => {
  RunOrderNumber += 1;
};

const resetRunOrderNumber = () => {
  RunOrderNumber = 0;
};
/**
 * Check the status of the server.
 * If the server is active, also get the
 * JSON file of paths
 *
 * @return {boolean} true -> server is online. false -> server is offline
 */
const CheckServerStatus = async () => {
  try {
    const response = await fetch(BASE_URL + "/", { method: "GET" });

    // If server responds but status is not 200-299
    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    ServerCalls = data;
    return true;

  } catch (error) {
    // This runs if the server is offline or network request fails
    return false;
  }
};

/**
 * Check if the server is active
 *
 * @return {Boolean} If the server is online
 */
const CheckData = async () => {
  if (!ServerCalls) {
    return CheckServerStatus().then((response) => {
      return response;
    });
  }
  return true;
};

export {
  BuildURI,
  CheckServerStatus,
  CheckData,
  ServerCalls,
  getRunOrderNumber,
  incrementRunOrderNumber,
  resetRunOrderNumber,
};
