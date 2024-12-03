import { useEffect, useState, useRef } from "react";

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
import { useParams, useNavigate } from "react-router-dom";

/**
 * Upload a mf4 file to the backend sever as
 * well as the context id passed through the url.
 * All file authentications are conducted on the backend
 */
function DataUpload() {
  const [bodyDisplay, setBodyDisplay] = useState(null);

  const { contextID } = useParams();

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
      navigate("/");
    } else {
      navigate("/" + id);
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
    const file = document.getElementById("fileUpload").files[0];
    const response = PostDataFile(file, contextID);

    let lastProgress = 0; // Store previous progress percentage
    let lastTimestamp = Date.now(); // Store previous timestamp

    /**
     * Helper function to convert seconds to hours and minutes
     *
     * @param {int} seconds - seconds to convert
     * @return {string} formatted data
     */
    const formatTime = (seconds) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = Math.floor(seconds % 60);

      return `${hrs > 0 ? hrs + "h " : ""}${
        mins > 0 ? mins + "m " : ""
      }${secs}s remaining`;
    };
    /**
     * Create an interval to update the progress bar every
     * second. Call to the backend and fetch the value
     * based off the context id and update the
     */
    const interval = setInterval(async () => {
      const data = await FetchProgress(contextID);

      if (data.error) {
        console.error("Error fetching progress:", data.error);
        return;
      }
      //get the progress and the current time
      const currentProgress = data.progress;
      const currentTime = Date.now();
      //get how much progress was made and how ling it took
      const progressDelta = currentProgress - lastProgress;
      const timeDelta = (currentTime - lastTimestamp) / 1000;

      lastProgress = currentProgress;
      lastTimestamp = currentTime;
      //calculate an estimate to how much time is left in upload
      const progressRate = progressDelta / timeDelta;
      const remainingProgress = 1 - currentProgress;
      const estimatedTimeRemaining =
        progressRate > 0 ? remainingProgress / progressRate : Infinity;

      // Update the UI with the formatted estimated time remaining
      setProgressBar(
        <div style={{ display: "flex", alignItems: "center" }}>
          <progress value={currentProgress} style={{ marginRight: "10px" }} />
          <div>{formatTime(estimatedTimeRemaining)}</div>
        </div>
      );

      if (currentProgress >= 1 || currentProgress < 0) {
        //stop calling to the backend
        clearInterval(interval);
      }
    }, 1000);

    /**
     * When the backend responds, display buttons
     * to bring the user back to the context page
     * with the option of keeping the same event data
     */
    response.then((responseValue) => {
      if (responseValue === true) {
        setProgressBar(null);
        setBodyDisplay(
          <div>
            <Button
              className='newContext'
              onClick={() => {
                RedirectToContext(contextID);
              }}
            >
              Same Event
            </Button>
            <Button
              className='newContext'
              onClick={() => {
                RedirectToContext(null);
              }}
            >
              New Context
            </Button>
          </div>
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
        <h4 className='mb-3'>Upload MF4 File</h4>
        <Input
          type='file'
          id='fileUpload'
          className='file-input'
          required
          accept='.mf4'
        />
        <Button color='primary' className='submit-btn'>
          Submit
        </Button>
      </Form>
    );
  }, []);

  return (
    <Container fluid className='outer-container'>
      <Row className='inner-row'>
        <Col md='6' lg='4'>
          <Card className='upload-card'>
            <CardBody className='text-center'>
              {bodyDisplay}
              {progressBar}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DataUpload;
