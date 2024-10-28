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

/* -------------------------------------------------------------------------- */
/* --------------------------- Context Data Calls --------------------------- */
/* -------------------------------------------------------------------------- */

/**
 * Fetch the saved config names
 *
 * @return {Dictionary} key: board name, value: saved names
 */
const FetchConfigData = async () => {
  await CheckData();
  try {
    const response = await fetch(BASE_URL + ServerCalls["context"]);

    if (!response.ok) {
      console.error("Network response was not ok: " + response.statusText);
    }

    const jsonResponse = await response.json(); // await here

    return jsonResponse;
  } catch (error) {
    throw new Error(
      "Error has occurred while fetching config data: " + error.message
    );
  }
};

/**
 * Send the given data to the backend
 *
 * @param {Object} postData - data to post to the backend. Formatted as an object
 * @return {Object} - response from server
 */
const PostContextData = async (postData) => {
  await CheckData();

  try {
    const response = await fetch(BASE_URL + ServerCalls["context"], {
      //post data to the server
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData), // Convert the data to JSON
    });
    if (!response.ok) {
      return false;
    }
    const jsonResponse = await response.json();

    return jsonResponse;
  } catch (error) {
    return false;
  }
};

/* -------------------------------------------------------------------------- */
/* ---------------------------- Event Data Calls ---------------------------- */
/* -------------------------------------------------------------------------- */

const FetchEventDataCall = async (searchContextId) => {
  await CheckData();
  try {
    const response = await fetch(
      BASE_URL + ServerCalls["event_data"] + "/" + searchContextId
    );

    const jsonResponse = await response.json(); // await here

    return jsonResponse;
  } catch (error) {
    throw new Error(
      "Error has occurred while fetching config data: " + error.message
    );
  }
};

/* -------------------------------------------------------------------------- */
/* ---------------------------- Data Upload Calls --------------------------- */
/* -------------------------------------------------------------------------- */

const PostDataFile = async (file, contextID) => {
  await CheckData();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("contextID", contextID);

  const response = await fetch(BASE_URL + ServerCalls["data_upload"], {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const jsonResponse = await response.json(); // await here
    console.error(
      "Error occurred on server side. Error message:" + jsonResponse.error
    );
    return false;
  } else {
    return true;
  }
};

const FetchData = async () => {
  await fetch(BASE_URL + ServerCalls["data_upload"], {
    method: "GET",
  });
};

/* -------------------------------------------------------------------------- */
/* -------------------------- Server Status Checks -------------------------- */
/* -------------------------------------------------------------------------- */

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
    return CheckServerStatus().then(() => {
      return true;
    });
  }
  return true;
};

export {
  FetchConfigData,
  PostContextData,
  PostDataFile,
  FetchData,
  CheckServerStatus,
  FetchEventDataCall,
};
