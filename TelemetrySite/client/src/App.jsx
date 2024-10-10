import {
    Route,
    Routes,
    BrowserRouter as Router,

} from "react-router-dom";
import ContextForm from './contextForm/ContextForm'; // Import other components
import "./App.css"

function App() {

    return (

        <div className='MainBody'>
            <div className='ContextSelect'>
                <header className='ContextHeader'>
                    <center>
                        <div className='ContextHeaderText'>Context Creator</div>
                    </center>
                </header>

                <Router>

                    <Routes>
                        <Route path="/" element={<ContextForm />} /> \
                    </Routes>
                </Router>
            </div>
        </div>
    );
}

export default App;