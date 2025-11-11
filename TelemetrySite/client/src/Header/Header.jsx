import "./Header.css";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * Generate a header element that displays a logout button can calls back to a function when pressed
 */
const Header = (props) => {
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
            Documentation: "/documentation",
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
            <h1
                onClick={() => {
                    clicked("/");
                }}
            >
                Telemetry DB
            </h1>
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
