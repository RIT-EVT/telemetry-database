import { useEffect, useState } from "react";

import "./DataUpload.css";
import { BuildURI, CheckData, ServerCalls } from "../server_utils";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  Button,
  Form,
} from "reactstrap";
import { useNavigate } from "react-router-dom";

/**
 * Upload a mf4 file to the backend sever as
 * well as the context id passed through the url.
 * All file authentications are conducted on the backend
 */
function DataUpload() {
  const [bodyDisplay, setBodyDisplay] = useState(null);

  const [progressBar, setProgressBar] = useState(null);

  let navigate = useNavigate();

  /**
   * Set the new path back to the context creation
   * page. Send back to basic page if id is null
   *
   * @param {id} id - context id to get the event data
   */
  const RedirectToContext = (id) => {
    if (!id) {
      navigate("/context-form");
    } else {
      navigate("/context-form" + id);
    }
  };

  /**
   * Submit the current file selected by the user.
   * Send the context id with the file to the back
   * end, then start the progress bar and wait for
   * the response from the backend
   *
   * @param {Event} event -Event details from the form
   */
  const SubmitFile = async (event) => {
    event.preventDefault(); // Prevent page reload
    const contextData = sessionStorage.getItem("BikeData");

    if (!contextData) {
      console.error("No data from context saved");
      return;
    }

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
        const response = await fetch( await BuildURI(), {
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

    const mf4File = document.getElementById("fileUploadMF4").files[0];
    const dbcFile = document.getElementById("fileUploadDBC").files[0];
    const response = PostDataFile(mf4File, dbcFile, contextData);

    /**
     * Fetch the progress of the current upload
     *
     * @return {int} decimal of how much has been uploaded
     */
    const FetchProgress = async () => {
      try {
        const response = await fetch(BuildURI, {
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

    var fileUpload = false;
    var lastProgress = -1;
    var lastResponseString = "";
    /**
     * Create an interval to update the progress bar every
     * second. Call to the backend and fetch the value
     * based off the context id and update the
     */
    const interval = setInterval(async () => {
      const data = await FetchProgress();

      if (data.error) {
        console.error("Error fetching progress:", data.error);
        return;
      }

      //get the progress passed from the backend
      const responseString = Object.keys(data)[0];

      if (responseString != "Finished") {
        const currentProgress = data[responseString];
        if (
          currentProgress > lastProgress ||
          currentProgress < 0 ||
          responseString != lastResponseString
        ) {
          // Update the UI with the formatted estimated time remaining
          setProgressBar(
            <div style={{ display: "flex", alignItems: "center" }}>
              <progress
                value={currentProgress}
                style={{ marginRight: "10px" }}
              />
              <div>
                {responseString}:{Math.round(currentProgress * 100)}%
              </div>
            </div>
          );
          lastProgress = currentProgress;
          lastResponseString = responseString;
        }
      } else {
        //stop calling to the backend
        clearInterval(interval);
        setProgressBar(null);
      }
    }, 1000);

    /**
     * When the backend responds, display buttons
     * to bring the user back to the context page
     * with the option of keeping the same event data
     */
    response.then((responseValue) => {
      if (responseValue === true) {
        fileUpload = true;
        clearInterval(interval);
        setProgressBar(null);
        sessionStorage.removeItem("BikeData");

        setBodyDisplay(
          <Container className='button-container'>
            <Col>
              <Button
                className='newContext'
                color='primary'
                onClick={() => RedirectToContext()}
              >
                Same Event
              </Button>
            </Col>
            <Col>
              <Button
                className='newContext'
                color='success'
                onClick={() => RedirectToContext(null)}
              >
                New Context
              </Button>
            </Col>
          </Container>
        );
      }
    });
  };

  useEffect(() => {
    setBodyDisplay(
      <Form
        className='DataUploadForm'
        onSubmit={SubmitFile}
        encType='multipart/form-data'
      >
        <Container>
          <Col>
            <h4 className='mb-3'>Upload MF4 File</h4>
            <Input
              type='file'
              id='fileUploadMF4'
              className='file-input'
              required
              accept='.mf4'
              bsSize='sm'
            />
          </Col>
          <Col>
            <h4 className='mb-3'>Upload DBC File</h4>
            <Input
              type='file'
              id='fileUploadDBC'
              className='file-input'
              required
              accept='.dbc'
              bsSize='sm'
            />
          </Col>
        </Container>
        <Button color='primary' className='submit-btn'>
          Submit
        </Button>
      </Form>
    );
  }, []);

  return (
    <Container fluid className='outer-container'>
      <Card className='upload-card'>
        <CardBody fluid className='text-center'>
          {bodyDisplay}
          {progressBar}
        </CardBody>
      </Card>
    </Container>
  );
}

export default DataUpload;
