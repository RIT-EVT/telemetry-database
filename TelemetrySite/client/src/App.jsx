import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import ContextForm from "./contextForm/ContextForm"; // Import other components
import "./App.css";
import Page404 from "./404/404";
import { CheckServerStatus } from "./ServerCall";
import { useEffect, useState } from "react";

function App() {
  const [ServerStatus, setStatus] = useState(false);

  useEffect(() => {
    CheckServerStatus().then((response) => {
      setStatus(response);
    });
  }, []);

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
            <Route path='/' element={<ContextForm />} />
            <Route path='*' element={<Page404 />} />
          </Routes>
        ) : null}
      </div>
    </div>
  );
}

export default App;
