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
    return await fetch(BASE_URL + "/")
      .then((response) => response.json())
      .then((data) => {
        ServerCalls = data;

        return true;
      })
      .catch(() => {
        return false;
      });
  } catch {
    //if there is an error
    return false;
  }
};

/**
 * Check if the server us active
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
