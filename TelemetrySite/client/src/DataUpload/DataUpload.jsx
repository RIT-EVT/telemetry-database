import { useEffect, useState } from "react";

import "./DataUpload.css";
import { PostDataFile, FetchProgress } from "../ServerCall/ServerCall";
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
import { json, useNavigate } from "react-router-dom";

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
   * Set the path to redirect the user to. User can choose
   * to create a new context or a new run with the same event
   * @param {string} url - url to redirect the user to
   */
  const RedirectToContext = (url) => {
    sessionStorage.setItem("DataSubmitted", false);
    sessionStorage.removeItem("BikeData");
    navigate(url);
  };

  const DisplayRedirect = () => {
    setBodyDisplay(
      <Container className='button-container'>
        <Col>
          <Button
            className='redirectButton'
            onClick={() => {
              RedirectToContext("/new-run");
            }}
          >
            New Run
          </Button>
        </Col>
        <Col>
          <Button
            className='redirectButton'
            onClick={() => {
              sessionStorage.clear("EventData");
              RedirectToContext("/context-form");
            }}
          >
            New Context
          </Button>
        </Col>
      </Container>
    );
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

    const mf4File = document.getElementById("fileUploadMF4").files[0];
    const dbcFile = document.getElementById("fileUploadDBC").files[0];
    const eventData = sessionStorage.getItem("EventData");
    const mongoDocId = eventData ? JSON.parse(eventData)["documentId"] : null;
    const response = PostDataFile(mf4File, dbcFile, contextData, mongoDocId);

    var lastProgress = -1;
    var lastResponseString = "";
    setBodyDisplay(null);
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
        //clearing the bar is done when back end responds to submitting data
      }
    }, 1000);

    /**
     * When the backend responds, display buttons
     * to bring the user back to the context page
     * with the option of keeping the same event data
     */
    response.then((responseValue) => {
      if (responseValue != false) {
        sessionStorage.setItem("DataSubmitted", true);

        clearInterval(interval);
        setProgressBar(null);

        const parsedContextData = JSON.parse(contextData);

        //save the needed event details to be displayed on the next page
        const eventObject = {
          documentId: responseValue["id"],
          eventName: parsedContextData["event"]["name"],
          eventDate: parsedContextData.event.date,
          eventType: parsedContextData.event.type,
          eventLocation: parsedContextData.event.location,
        };

        sessionStorage.setItem("EventData", JSON.stringify(eventObject));

        DisplayRedirect();
      }
    });
  };

  useEffect(() => {
    //make sure a refresh doesn't make the user resubmit data
    if (sessionStorage.getItem("DataSubmitted") !== null) {
      DisplayRedirect();
    } else {
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
            Submit {sessionStorage.getItem("EventData") ? "Run" : null}
          </Button>
        </Form>
      );
    }
  }, []);

  return (
    <Container fluid className='outer-container'>
      <Card className='upload-card'>
        <CardBody fluid className='text-center'>
          {bodyDisplay}
          <center>{progressBar}</center>
        </CardBody>
      </Card>
    </Container>
  );
}

export default DataUpload;
