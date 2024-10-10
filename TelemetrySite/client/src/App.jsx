import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import ContextForm from "./contextForm/ContextForm"; // Import other components
import "./App.css";
import Page404 from "./404/404";
import { CheckServerStatus } from "./ServerCall";

function App() {
  CheckServerStatus();
  return (
    <div className='MainBody'>
      <div className='ContextSelect'>
        <header className='ContextHeader'>
          <center>
            <div className='ContextHeaderText'>Context Creator</div>
          </center>
        </header>

        <Routes>
          <Route path='/' element={<ContextForm />} />
          <Route path='*' element={<Page404 />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
