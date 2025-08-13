
import "./Header.css"

/**
 * Generate a header element that displays a logout button can calls back to a function when pressed
 */
const Header = (props) => {
    return (
        <div className='ContextHeader'>
            <center>
                <div className='ContextHeaderText'>Context Creator</div>
            </center>
            {props.authToken ? (
                <button onClick={() => { props.onLogout(); }} className='SignOutButton'>
                    Sign Out
                </button>
            ) : null
            }
        </div >);
}

export default Header;