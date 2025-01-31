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
    const contextData = sessionStorage.getItem("BikeData");

    if (!contextData) {
      console.error("No data from context saved");
      return;
    }

    const mf4File = document.getElementById("fileUploadMF4").files[0];
    const dbcFile = document.getElementById("fileUploadDBC").files[0];
    const response = PostDataFile(mf4File, dbcFile, contextData, contextID);

    var fileUpload = false;
    var lastProgress = -1;
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
      //get the progress passed from the backend

      const currentProgress = data.progress;
      if (currentProgress > lastProgress) {
        // Update the UI with the formatted estimated time remaining
        setProgressBar(
          <div style={{ display: "flex", alignItems: "center" }}>
            <progress value={currentProgress} style={{ marginRight: "10px" }} />
            <div>{Math.round(currentProgress * 100)}%</div>
          </div>
        );

        if (currentProgress >= 1 || currentProgress < 0 || fileUpload) {
          //stop calling to the backend
          clearInterval(interval);
          setProgressBar(null);
        }
        lastProgress = currentProgress;
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
        setProgressBar(null);
        setBodyDisplay(
          <Container className='button-container'>
            <Col>
              <Button
                className='newContext'
                color='primary'
                onClick={() => RedirectToContext(contextID)}
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
