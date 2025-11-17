import "./Header.css";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Logo from "./EVT_Logo.png";
/**
 * Generate a header element that displays a logout button can calls back to a function when pressed
 */
const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const clicked = (clickedLink) => {
        navigate(clickedLink);
    };

    const [links, setLinks] = useState(null);

    useEffect(() => {
        const headerLinks = {
            "Data Upload": "/context-upload",
            "Data Access": "/data-access",
            Documentation: "/doc",
        };
        setLinks(
            <div>
                {Object.keys(headerLinks).map((key) => {
                    return (
                        <Link
                            className={
                                location.pathname === headerLinks[key]
                                    ? "activeLink"
                                    : ""
                            }
                            to={headerLinks[key]}
                            key={key}
                        >
                            {key}
                        </Link>
                    );
                })}
            </div>
        );
    }, [location]);

    return (
        <div className='Header'>
            <Link to='/'>
                <img src={Logo} alt='Electric Vehicle Team Logo' />
            </Link>
            {links}
            {/* {props.authToken ? (
                <button
                    onClick={() => {
                        props.onLogout();
                    }}
                    className='SignOutButton'
                >
                    Sign Out
                </button>
            ) : null} */}
        </div>
    );
};

export default Header;
