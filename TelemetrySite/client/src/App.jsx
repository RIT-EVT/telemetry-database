import { Route, Routes } from "react-router-dom";
import ContextForm from "./ContextForm/ContextForm.jsx"; // Import other components
import DataUpload from "./DataUpload/DataUpload.jsx";
import "./App.css";
import Page404 from "./404/404.jsx";
import { CheckServerStatus } from "./ServerCall/ServerCall.jsx";
import { useEffect, useState } from "react";

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
      <div className='ContextSelect'>
        <header className='ContextHeader'>
          <center>
            <div className='ContextHeaderText'>Context Creator</div>
          </center>
        </header>

        {ServerStatus ? (
          <Routes>
            <Route path='404Page' element={<Page404 />} />
            <Route path='/:contextID?' element={<ContextForm />} />
            <Route path='/DataUpload/:contextID' element={<DataUpload />} />
            <Route path='*' element={<Page404 />} />
          </Routes>
        ) : null}
      </div>
    </div>
  );
}

export default App;
