import { Form, Input, Label, FormGroup, Button } from "reactstrap";
import { useState } from "react";
import "./DataUpload.css";
import { PostDataFile } from "../ServerCall";

function DataUpload() {
  const [selectedFile, setSelectedFile] = useState(null);

  const HandleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const SubmitFile = (event) => {
    event.preventDefault(); // Prevent page reload
    if (selectedFile) {
      PostDataFile(selectedFile);
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
      <center>
        <div className='FileInputBox'>
          <FormGroup className='FormGroup'>
            <Label for='exampleFile'>File</Label>
            <Input
              className='FileInput'
              id='dataFile'
              name='file'
              type='file'
              onChange={HandleFileChange}
            />
          </FormGroup>
        </div>
      </center>
      <Button type='submit'>Upload</Button>
    </Form>
  );
}

export default DataUpload;
