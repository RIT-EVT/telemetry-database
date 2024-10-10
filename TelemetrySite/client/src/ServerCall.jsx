/**
 * All fetch calls should appear in this file.
 *
 * Use SeverCalls to hold the url path to the needed
 * backend calls as a dictionary. This allows for
 * the url paths to change on the backend without
 * effecting the front end
 */
var ServerCalls = {};

let BASE_URL = "http://127.0.0.1:5000";

/**
 * Fetch the saved config names
 *
 * @return {Dictionary} key: board name, value: saved names
 */
const FetchConfigData = async () => {
  try {
    const response = await fetch(BASE_URL + ServerCalls["context"]);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = CleanInput(response).json();
    return data;
  } catch (error) {
    throw new Error(
      "Error has occurred while fetching config data " + error.error
    );
  }
};

/**
 * Send the given data to the backend
 *
 * @param {Object} postData - data to post to the backend. Formatted as an object
 */
const PostContextData = async (postData) => {
  try {
    const response = await fetch(BASE_URL + ServerCalls["context"], {
      //post data to the server
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData), // Convert the data to JSON
    });
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
  } catch (error) {
    throw new Error("Error has occurred while submitting data " + error.error);
  }
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
    //only hard code this call
    fetch(BASE_URL + "/")
      .then((response) => response.json())
      .then((data) => {
        ServerCalls = data;
      });
    return true;
  } catch {
    return false;
  }
};

/**
 * Clean while(1); from json input
 * @param {string} input - stringified json object with while(1);
 * @return {string} stringified json object without while(1);
 */
const CleanInput = (input) => input.slice(9);

export {
  FetchServerPaths,
  FetchConfigData,
  PostContextData,
  CheckServerStatus,
};
