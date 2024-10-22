import { useState } from "react";
import "./DataUpload.css";
import { PostDataFile, FetchData } from "../ServerCall";
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
import { useParams } from "react-router-dom";

function DataUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const { contextID } = useParams();

  const HandleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const SubmitFile = (event) => {
    event.preventDefault(); // Prevent page reload

    if (selectedFile) {
      PostDataFile(selectedFile, contextID);
    } else {
      console.error("No file selected.");
    }
  };

  return (
    <Form
      className='DataUploadForm'
      onSubmit={SubmitFile}
      encType='multipart/form-data'
    >
      <Container fluid className='outer-container'>
        <Row className='inner-row'>
          <Col md='6' lg='4'>
            <Card className='upload-card'>
              <CardBody className='text-center'>
                <h4 className='mb-3'>Upload File</h4>
                <Input
                  type='file'
                  className='file-input'
                  onChange={HandleFileChange}
                />
                <Button color='primary' className='submit-btn'>
                  Submit
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </Form>
  );
}

export default DataUpload;
