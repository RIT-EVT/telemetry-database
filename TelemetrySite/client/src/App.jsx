import { Route, Routes } from "react-router-dom";
import ContextForm from "./ContextForm/ContextForm.jsx"; // Import other components
import DataUpload from "./DataUpload/DataUpload.jsx";
import { LoginPage, SignupPage } from "LoginPage/LoginPage.jsx";
import "./App.css";
import Page404 from "./404/404.jsx";
import { useEffect, useState, useCallback } from "react";
import { Container, Row } from "reactstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckServerStatus } from "Utils/ServerUtils.jsx";
import ErrorModal from "Modal/Error/Error.jsx";
import Header from "./Header/Header.jsx"

/**
 * Render the main application and contain all the logic for what to display
 */
function App() {
  const [ServerStatus, setStatus] = useState(false);

  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  // Allow the user to ignore server error
  // Mostly for testing reasons
  const [ignoreError, setIgnoreError] = useState(false);

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
   * Call to the backend and ensure the server is online.
   */
  const CheckBackendConnection = useCallback(() => {
    if (!ignoreError) {
      CheckServerStatus().then((response) => {
        if (!response) {
          setErrorMsg("Server is offline");
          setIsErrorOpen(true);
        }
        setStatus(response);
      });
    }
  }, [ignoreError, setErrorMsg, setIsErrorOpen, setStatus]);

  const toggleErrorModal = () => setIsErrorOpen(!isErrorOpen);
  const ignoreErrorModal = () => { setIgnoreError(true); toggleErrorModal(); }


  // Run this effect until the server is online
  useEffect(() => {

    // Only check backend if the server is offline
    if (!ServerStatus && !ignoreError) {
      CheckBackendConnection();
    }


  }, [ServerStatus, ignoreError, location, navigate, CheckBackendConnection]);

  useEffect(() => {
    const savedToken = "testing";//TODO uncomment when done testing sessionStorage.getItem("authToken");

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
      <Header onLogout={handleSignout} authToken={authToken} />
      <Container className='ContextSelect'>
        {/*TODO uncomment when done testing {ServerStatus ? ( } */}
        <Row className='Components'>

          <Routes>
            <Route path='/context-form' element={<ContextForm authToken={authToken} />} />
            <Route path='/new-run' element={<ContextForm authToken={authToken} />} />
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

        </Row>
        {/*TODO uncomment when done testing  ) : null}*/}
      </Container>
      <ErrorModal
        isOpen={isErrorOpen}
        toggle={toggleErrorModal}
        ignore={ignoreErrorModal}
        errorMessage={errorMsg}
      />
    </div>
  );
}

export default App;
