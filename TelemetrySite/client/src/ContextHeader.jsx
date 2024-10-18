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

  const navigate = useNavigate(); // Move useNavigate here

  /* -------------------------------------------------------------------------- */
  /* ------------------------- Create Const Functions ------------------------- */
  /* -------------------------------------------------------------------------- */

  /**
   * Call to the backend server.
   * If it is active clear any error.
   * If it is inactive, display error and recall every second.
   */
  const CheckBackendConnection = () => {
    CheckServerStatus().then((response) => {
      if (response) {
        setServerOnlineStatus(false);
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
  }, [serverNotOnline]);

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
    </div>
  );
}

export default ContextHeader;
