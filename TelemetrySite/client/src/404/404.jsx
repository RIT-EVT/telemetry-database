import { useNavigate } from "react-router-dom";
import "./404.css";
const Page404 = () => {
  let nav = useNavigate();
  const ReturnToMainScreen = () => {
    nav("/");
  };

  return (
    <div className='wholeThing'>
      <p className='welcomeTitle'>Welcome To The</p>

      <div className='mfTitle'>
        <h1 className='titleMain'>Context 404 Page</h1>
      </div>

      <button className='buttonReturn' onClick={ReturnToMainScreen}>
        Return to Home
      </button>
    </div>
  );
};

export default Page404;
