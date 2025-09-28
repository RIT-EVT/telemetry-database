import "./Header.css";

/**
 * Generate a header element that displays a logout button can calls back to a function when pressed
 */
const Header = (props) => {
  return (
    <header className='ContextHeader'>
      <center>
        <h1 className='ContextHeaderText'>Context Creator</h1>
      </center>
      {props.authToken ? (
        <button
          onClick={() => {
            props.onLogout();
          }}
          className='SignOutButton'
        >
          Sign Out
        </button>
      ) : null}
    </header>
  );
};

export default Header;
