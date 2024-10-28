/**
 * Upload a mf4 file to the backend sever
 * as well as the context id passed through
 * the url. All file authentications are
 * conducted on the backend
 */

import { useEffect, useState } from "react";
import "./DataUpload.css";
import { PostDataFile, FetchData } from "../ServerCall/ServerCall";
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

function DataUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [bodyDisplay, setBodyDisplay] = useState(null);
  const { contextID } = useParams();

  let navigate = useNavigate();

  const HandleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const RedirectToContext = (id) => {
    if (!id) {
      navigate("/");
    } else {
      navigate("/" + id);
    }
  };

  const SubmitFile = (event) => {
    event.preventDefault(); // Prevent page reload

    PostDataFile(selectedFile, contextID).then((response) => {
      if (response === true) {
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
          className='file-input'
          onChange={HandleFileChange}
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
            <CardBody className='text-center'>{bodyDisplay}</CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default DataUpload;
