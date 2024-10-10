import { Button } from "reactstrap";
import React, { useEffect, useState } from "react";
import "./ContextHeader.css";
import { CheckServerStatus } from "./ServerCall.jsx";
import { useNavigate } from "react-router-dom";

function ContextHeader() {
  /* -------------------------------------------------------------------------- */
  /* -------------------------- Establish State Hooks ------------------------- */
  /* -------------------------------------------------------------------------- */
  const [serverNotOnline, setServerOnlineStatus] = useState(true);
  const [ButtonsForSelect, updateButtons] = useState(null);

  const [error, setError] = useState(null);

  const navigate = useNavigate(); // Move useNavigate here

  /* -------------------------------------------------------------------------- */
  /* ------------------------- Create Const Functions ------------------------- */
  /* -------------------------------------------------------------------------- */

  /**
   * Clear any errors
   */
  const clearError = () => {
    setError(null);
  };
  /**
   * Display the error message
   */
  const setErrorMessage = () => {
    setError(
      <center>
        <div className='Error' color='danger'>
          <center> Server appears to be offline</center>
          <center>Turn on sever and wait for page to read the response</center>
        </div>
      </center>
    );
  };
  /**
   * Call to the backend server.
   * If it is active clear any error.
   * If it is inactive, display error and recall every second.
   */
  const CheckBackendConnection = () => {
    CheckServerStatus().then((response) => {
      if (response) {
        setServerOnlineStatus(false);
        clearError();
      } else {
        setServerOnlineStatus(true);
        setErrorMessage();
      }
    });
  };

  const UpdatePath = (path) => {
    navigate(path);
  };

  /* -------------------------------------------------------------------------- */
  /* -------------------------- Establish Effect Hooks ------------------------ */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      // Only check backend if the server is offline
      if (serverNotOnline) {
        CheckBackendConnection();
      } else {
        clearInterval(interval); // Stop interval when server is online
      }
    }, 1000);

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }, [serverNotOnline]); // Add serverOnline as a dependency to stop interval when it's true
  useEffect(() => {
    updateButtons(
      <div className='ButtonDisplayBody'>
        <center>
          <Button
            className='ButtonBody'
            disabled={serverNotOnline}
            onClick={() => {
              UpdatePath("/Context");
            }}
          >
            New Context
          </Button>
        </center>
      </div>
    );
  }, [serverNotOnline, error]);

  /* -------------------------------------------------------------------------- */
  /* --------------------------- Return Final Object -------------------------- */
  /* -------------------------------------------------------------------------- */

  return (
    <div className='MainBody'>
      <div className='ContextSelect'>
        <header className='ContextHeader'>
          <center>
            <div className='ContextHeaderText'>Context Creator</div>
          </center>
        </header>

        {ButtonsForSelect}
      </div>
      {error}
    </div>
  );
}

export default ContextHeader;
