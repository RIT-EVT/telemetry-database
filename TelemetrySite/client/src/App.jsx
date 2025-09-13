import { Route, Routes } from "react-router-dom";
import ContextForm from "./ContextForm/ContextForm.jsx"; // Import other components
import DataUpload from "./DataUpload/DataUpload.jsx";
import { LoginPage, SignupPage } from "LoginPage/LoginPage.jsx";
import "./App.css";
import Page404 from "./404/404.jsx";
import { useEffect, useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckServerStatus } from "Utils/ServerUtils.jsx";
function App() {
  const [ServerStatus, setStatus] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [authToken, setToken] = useState(null);

  const handleLogin = (loginData) => {
    setToken(loginData);
    sessionStorage.setItem("authToken", loginData);
    navigate("/context-form");
  };

  const handleSignup = (signupData) => {
    setToken(signupData);
    sessionStorage.setItem("authToken", signupData);
    navigate("/context-form");
  };

  const handleSignout = () => {
    sessionStorage.removeItem("authToken");
    setToken(null);
    navigate("/login");
  };

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
  }, [ServerStatus, location, navigate]); // Add serverOnline as a dependency to stop interval when it's true

  useEffect(() => {
    const savedToken = sessionStorage.getItem("authToken");
    if (savedToken) {
      setToken(savedToken);
      if (location.pathname === "/") {
        navigate("/context-form");
      }
    } else if (
      location.pathname !== "/signup" &&
      location.pathname !== "/login"
    ) {
      navigate("/login");
    }
  }, [navigate, location]);

  return (
    <div className='MainBody'>
      <Container className='ContextSelect'>
        <Col className='ContextHeader'>
          <center>
            <Col className='ContextHeaderText'>Context Creator</Col>
          </center>
          {authToken ? (
            <button onClick={handleSignout} className='SignOutButton'>
              Sign Out
            </button>
          ) : null}
        </Col>

        {ServerStatus ? (
          <Row className='Components'>
            <Col>
              <Routes>
                <Route path='/context-form' element={<ContextForm />} />
                <Route path='/new-run' element={<ContextForm />} />
                <Route path='/data-upload' element={<DataUpload />} />
                <Route
                  path='/login'
                  element={<LoginPage onLogin={handleLogin} />}
                />
                <Route
                  path='/signup'
                  element={<SignupPage onSignup={handleSignup} />}
                />
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
