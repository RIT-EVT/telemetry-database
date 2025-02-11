/**
 * All fetch calls should appear in this file.
 *
 * Use ServerCalls to hold the url path to the needed
 * backend calls as a dictionary. This allows for
 * the url paths to change on the backend without
 * effecting the frontend
 */
var ServerCalls = {};

let BASE_URL = "http://127.0.0.1:5000";

/* -------------------------------------------------------------------------- */
/* ---------------------------- Data Upload Calls --------------------------- */
/* -------------------------------------------------------------------------- */

const PostDataFile = async (mf4File, dbcFile, contextData) => {
  // Ensure CheckData() completes before proceeding
  if (!ServerCalls) {
    try {
      const response = await CheckData(); // Await the result
      if (!response) {
        console.error("CheckData failed or returned an invalid response.");
        return false; // Stop execution if CheckData fails
      }
    } catch (error) {
      console.error("Error in CheckData:", error);
      return false;
    }
  }

  const formData = new FormData();
  formData.append("mf4File", mf4File);
  formData.append("dbcFile", dbcFile);
  formData.append("contextData", contextData);

  try {
    const response = await fetch(BASE_URL + ServerCalls["data_upload"], {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const jsonResponse = await response.json();
      console.error(
        "Error occurred on server side. Error message: " + jsonResponse.error
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("Network or server error:", error);
    return false;
  }
};
/**
 * Fetch the progress of the current upload
 *
 * @param {int} contextId - id to get progress off
 * @return {int} decimal of how much has been uploaded
 */
const FetchProgress = async () => {
  try {
    const response = await fetch(BASE_URL + ServerCalls["data_upload"], {
      method: "GET",
    });

    if (!response.ok) {
      console.error("Network response was not ok: " + response.statusText);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Failed to fetch progress:", error);
    return { error: error.message };
  }
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

export { PostDataFile, FetchProgress, CheckServerStatus };
