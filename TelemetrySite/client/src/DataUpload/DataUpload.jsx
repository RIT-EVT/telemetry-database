/**
 * Upload a mf4 file to the backend sever
 * as well as the context id passed through
 * the url. All file authentications are
 * conducted on the backend
 */

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
import ProgressBar from "progressbar.js";

function DataUpload() {
  const [bodyDisplay, setBodyDisplay] = useState(null);

  const { contextID } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressBarRef = useRef(null);

  let navigate = useNavigate();

  const RedirectToContext = (id) => {
    if (!id) {
      navigate("/");
    } else {
      navigate("/" + id);
    }
  };

  const SubmitFile = async (event) => {
    event.preventDefault(); // Prevent page reload
    const file = document.getElementById("fileUpload").files[0];
    const response = PostDataFile(file, contextID);
    //TODO progress bar
    //setIsLoading(true);
    // const interval = setInterval(async () => {
    //   const response = await FetchProgress(contextID);
    //   const data = await response.json();
    //   setProgress(data.progress);

    //   // Stop polling when progress reaches 100%
    //   if (data.progress >= 1) {
    //     clearInterval(interval);
    //     setIsLoading(false);
    //   }
    // }, 1000); // Poll every second

    response.then((responseValue) => {
      if (responseValue === true) {
        setIsLoading(false);
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

  useEffect(() => {
    let bar;
    if (isLoading) {
      // Initialize the progress bar
      bar = new ProgressBar.Line(progressBarRef.current, {
        strokeWidth: 4,
        color: "#4A90E2",
        trailColor: "#eee",
        trailWidth: 1,
        svgStyle: { width: "100%", height: "100%" },
        text: {
          style: {
            color: "#999",
            position: "absolute",
            right: "0",
            top: "30px",
          },
          autoStyleContainer: false,
        },
        from: { color: "#FFEA82" },
        to: { color: "#ED6A5A" },
        step: (state, bar) => {
          bar.setText(Math.round(bar.value() * 100) + " %");
        },
      });
    }

    return () => {
      if (bar) bar.destroy();
    };
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) {
      // Update the bar's value based on progress
      if (progressBarRef.current) {
        progressBarRef.current.animate(progress); // Convert percentage to 0-1 range
      }
    }
  }, [progress]);
  return (
    <Container fluid className='outer-container'>
      <Row className='inner-row'>
        <Col md='6' lg='4'>
          <Card className='upload-card'>
            <CardBody className='text-center'>
              {bodyDisplay}
              {isLoading ? (
                <div
                  ref={progressBarRef}
                  style={{ height: "10px", marginBottom: "20px" }}
                ></div>
              ) : null}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DataUpload;
