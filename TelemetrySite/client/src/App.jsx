import { Route, Routes } from "react-router-dom";
import ContextForm from "./ContextForm/ContextForm.jsx";
import DataUpload from "./DataUpload/DataUpload.jsx";
import { LoginPage, SignupPage } from "LoginPage/LoginPage.jsx";
import "./App.css";
import Page404 from "./404/404.jsx";
import { useEffect, useState, useCallback } from "react";
import { Container, Row } from "reactstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckServerStatus } from "Utils/ServerUtils.jsx";
import ErrorModal from "Modal/Error/Error.jsx";
import Header from "./Header/Header.jsx";

/**
 * Render the main application and contain all the logic for what to display
 */
function App() {
  const [ServerStatus, SetStatus] = useState(false);

  const [IsErrorOpen, SetIsErrorOpen] = useState(false);
  const [ErrorMsg, SetErrorMsg] = useState("");
  // Allow the user to ignore server error
  // Mostly for testing reasons
  const [IgnoreError, SetIgnoreError] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const [AuthToken, SetToken] = useState(null);

  function HandleLogin(loginData) {
    SetToken(loginData);
    sessionStorage.setItem("authToken", loginData);
    navigate("/context-form");
  }

  function HandleSignup(signupData) {
    SetToken(signupData);
    sessionStorage.setItem("authToken", signupData);
    navigate("/context-form");
  }

  function HandleSignout() {
    sessionStorage.removeItem("authToken");
    SetToken(null);
    navigate("/login");
  }

  /**
   * Call to the backend and ensure the server is online.
   */
  const CheckBackendConnection = useCallback(() => {
    if (!IgnoreError) {
      CheckServerStatus().then((response) => {
        if (!response) {
          SetErrorMsg("Server is offline");
          SetIsErrorOpen(true);
        }
        SetStatus(response);
      });
    }
  }, [IgnoreError, SetErrorMsg, SetIsErrorOpen, SetStatus]);

  const toggleErrorModal = () => SetIsErrorOpen(!IsErrorOpen);
  const ignoreErrorModal = () => {
    SetIgnoreError(true);
    toggleErrorModal();
  };

  // Run this effect until the server is online
  useEffect(() => {
    // Only check backend if the server is offline or the user has ignored the warning
    if (!ServerStatus && !IgnoreError) {
      CheckBackendConnection();
    }
  }, [ServerStatus, IgnoreError, location, navigate, CheckBackendConnection]);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("authToken");

    if (savedToken) {
      SetToken(savedToken);
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
      <Header onLogout={HandleSignout} authToken={AuthToken} />
      <Container className='ContextSelect'>
        {ServerStatus ? (
          <Row className='Components'>
            <Routes>
              <Route
                path='/context-form'
                element={<ContextForm authToken={AuthToken} />}
              />
              <Route
                path='/new-run'
                element={<ContextForm authToken={AuthToken} />}
              />
              <Route path='/data-upload' element={<DataUpload />} />
              <Route
                path='/login'
                element={<LoginPage onLogin={HandleLogin} />}
              />
              <Route
                path='/signup'
                element={<SignupPage onSignup={HandleSignup} />}
              />
              <Route path='*' element={<Page404 />} />
            </Routes>
          </Row>
        ) : null}
      </Container>
      <ErrorModal
        isOpen={IsErrorOpen}
        toggle={toggleErrorModal}
        ignore={ignoreErrorModal}
        errorMessage={ErrorMsg}
      />
    </div>
  );
}

export default App;
