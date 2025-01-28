import { Route, Routes } from "react-router-dom";
import ContextForm from "./contextForm/ContextForm.jsx"; // Import other components
import DataUpload from "./DataUpload/DataUpload.jsx";
import "./App.css";
import Page404 from "./404/404.jsx";
import { CheckServerStatus } from "./ServerCall/ServerCall.jsx";
import { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";

function App() {
  const [ServerStatus, setStatus] = useState(false);

  /**
   * Call to the backend and ensure the server is online
   */
  const CheckBackendConnection = () => {
    CheckServerStatus().then((response) => {
      setStatus(response);
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Only check backend if the server is offline
      if (!ServerStatus) {
        CheckBackendConnection();
      } else {
        clearInterval(interval); // Stop interval when server is online
      }
    }, 1000);

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }, [ServerStatus]); // Add serverOnline as a dependency to stop interval when it's true

  return (
    <div className='MainBody'>
      <Container className='ContextSelect'>
        <Row className='ContextHeader'>
          <center>
            <Col className='ContextHeaderText'>Context Creator</Col>
          </center>
        </Row>

        {ServerStatus ? (
          <Row className='Components'>
            <Col>
              <Routes>
                <Route path='404Page' element={<Page404 />} />
                <Route path='/' element={<ContextForm />} />
                <Route path='/DataUpload' element={<DataUpload />} />
                <Route path='*' element={<Page404 />} />
              </Routes>
            </Col>
          </Row>
        ) : null}
      </Container>
    </div>
  );
}

export default App;
