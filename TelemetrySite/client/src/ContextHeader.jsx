import { Button, Alert } from "reactstrap";
import React, { useEffect, useState } from "react";
import "./ContextHeader.css";
import ContextForm from "./contextForm/ContextForm.jsx";

function ContextHeader() {
  /* -------------------------------------------------------------------------- */
  /* -------------------------- Establish State Hooks ------------------------- */
  /* -------------------------------------------------------------------------- */
  const [serverOnline, setServerOnline] = useState(false);
  const [ButtonsForSelect, updateButtons] = useState(null);

  const [body, updateBody] = useState(null);

  const [error, setError] = useState(null);

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
        <Alert className='Error' color='danger'>
          <center> Server appears to be offline</center>
          <center>Turn on sever and wait for page to read the response</center>
        </Alert>
      </center>
    );
  };
  /**
   * Call to the backend server.
   * If it is active clear any error.
   * If it is inactive, display error and recall every second.
   */
  const CheckBackendConnection = () => {
    fetch("http://127.0.0.1:5000/Test")
      .then(() => {
        setServerOnline(true);
        clearError();
      })

      .catch(() => {
        setServerOnline(false);
        setErrorMessage();
      });
  };

  /* -------------------------------------------------------------------------- */
  /* -------------------------- Establish Effect Hooks ------------------------ */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      // Only check backend if the server is offline
      if (!serverOnline) {
        CheckBackendConnection();
      } else {
        clearInterval(interval); // Stop interval when server is online
      }
    }, 1000);

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  }, [serverOnline]); // Add serverOnline as a dependency to stop interval when it's true

  useEffect(() => {
    updateButtons(
      <div className='ButtonDisplayBody'>
        <center>
          <Button
            className='ButtonBody'
            disabled={!serverOnline}
            onClick={() => {
              updateBody(<ContextForm />);
            }}
          >
            New Context
          </Button>
        </center>
      </div>
    );
  }, [serverOnline, error]);

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
      {body}
    </div>
  );
}

export default ContextHeader;
