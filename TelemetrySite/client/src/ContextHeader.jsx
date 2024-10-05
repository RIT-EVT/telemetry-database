import { Button, Alert } from "reactstrap";
import React, { useEffect, useState } from "react";
import "./ContextHeader.css";
import ContextForm from "./contextForm/ContextForm.jsx";

function ContextHeader() {
  const [serverOnline, setServerOnline] = useState(false);
  const [ButtonsForSelect, updateButtons] = useState(null);

  const [body, updateBody] = useState(null);

  const [error, setError] = useState(null);

  const clearError = () => {
    setError(null);
  };

  const CheckBackendConnection = () => {
    fetch("http://127.0.0.1:5000/Test")
      .then((data) => {
        setServerOnline(true);
        clearError();
      })

      .catch((error) => {
        setServerOnline(false);
        setError(<Alert color="danger">An error has occurred</Alert>);
      });
  };

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
      <div className="ButtonDisplayBody">
        <center>
          <Button
            className="ButtonBody"
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

  return (
    <div className="MainBody">
      <div className="ContextSelect">
        <header className="ContextHeader">
          <center>
            <div className="ContextHeaderText">Context Creator</div>
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
