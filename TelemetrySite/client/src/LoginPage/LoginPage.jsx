import {
    Button,
    Card,
    Col,
    Row,
    Container,
    Form,
    Input,
    InputGroup,
    Label,
    Modal,
    ModalHeader,
    ModalBody,
} from "reactstrap";
import { useEffect, useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "./LoginPage.css";

import { useNavigate } from "react-router-dom";
import { BuildURI } from "../Utils/ServerUtils";

/**
 * Display a username password prompt to verify who the user is
 */
const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [invalidCredentialsModal, setInvalidCredModal] = useState(false);

    const toggleInvalidCredentialsModal = () => setInvalidCredModal(!invalidCredentialsModal);

    const navigate = useNavigate();

    /*
     * Check the username and password the user
     * entered against the data in the nrdb.
     * If there is a match, get the auth token
     * and redirect the user to the context upload page
     */
    const LoginChallenge = async (e) => {
        e.preventDefault();
        fetch(BuildURI("user_auth"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: username,
                password: password,
                action: "login",
            }),
        }).then(async (response) => {
            if (!response.ok) {
                if (response.status === 404) {
                    setInvalidCredModal(true);
                    return;
                }
            } else {
                let data = await response.json();
                onLogin(data["auth_token"]);
            }
        });
    };

    useEffect(() => {
        if (sessionStorage.getItem("authToken")) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <Card className='card'>
            <center>
                <h2>Login</h2>
                <Form onSubmit={LoginChallenge}>
                    <Container>
                        <Row>
                            <Col>
                                <InputGroup>
                                    <Label className='Label' htmlFor='username'>
                                        Username:
                                    </Label>
                                    <Input
                                        type='text'
                                        id='username'
                                        value={username}
                                        className='Input'
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </InputGroup>
                            </Col>
                            <Col>
                                <InputGroup>
                                    <Label className='Label' htmlFor='password'>
                                        Password:
                                    </Label>
                                    <Input
                                        type='password'
                                        id='password'
                                        className='Input'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </InputGroup>
                            </Col>
                        </Row>
                    </Container>

                    <Button className='SubmitButton' type='submit'>
                        Login
                    </Button>
                    <Button className='SwitchButton' onClick={() => navigate("/signup")}>
                        Signup
                    </Button>
                </Form>
            </center>
            <Modal isOpen={invalidCredentialsModal} toggle={toggleInvalidCredentialsModal}>
                <ModalHeader toggle={toggleInvalidCredentialsModal}>Invalid credentials</ModalHeader>
                <ModalBody>Invalid username or password</ModalBody>
            </Modal>
        </Card>
    );
};

const SignupPage = ({ onSignup }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [challengeInt, setChallengeInt] = useState(null);

    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [challengeIntModalOpen, setChallengeIntOpen] = useState(false);

    const passwordModalToggle = () => setPasswordModalOpen(!passwordModalOpen);
    const challengeModalToggle = () => setChallengeIntOpen(!challengeIntModalOpen);

    const navigate = useNavigate();

    const HandleSignup = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            passwordModalToggle();
            return;
        }
        // Pass all value to the backend to check if user's input is valid
        // and there aren't conflicting usernames
        fetch(BuildURI("user_auth"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: username,
                password: password,
                secureNum: challengeInt,
                action: "signup",
            }),
        }).then(async (response) => {
            if (!response.ok) {
                // Catch an invalid challenge input or error on the backend
                if (response.status === 400) {
                    const jsonData = await response.json();
                    if (jsonData["error"] === "Incorrect challenge number") {
                        challengeModalToggle();
                    } else {
                        console.error(jsonData["error"]);
                    }
                    return;
                }
            } else {
                const jsonData = await response.json();

                onSignup(jsonData["authToken"]);
            }
        });
    };

    useEffect(() => {
        if (sessionStorage.getItem("authToken")) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <Card className='card'>
            <center>
                <h2>Signup</h2>
            </center>
            <Form onSubmit={HandleSignup} className='form'>
                <Container>
                    <Row>
                        <Col>
                            <Row>
                                <InputGroup className='InputGroup'>
                                    <Input
                                        type='text'
                                        id='username'
                                        className='Input'
                                        value={username}
                                        placeholder='Username'
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </InputGroup>
                            </Row>

                            <Row>
                                <InputGroup className='InputGroup'>
                                    <Input
                                        type='number'
                                        id='challenge-value'
                                        className='Input'
                                        value={challengeInt}
                                        placeholder='Challenge Value'
                                        onChange={(e) => setChallengeInt(e.target.value)}
                                        required
                                    />
                                </InputGroup>
                            </Row>
                        </Col>
                        <Col>
                            <Row>
                                <InputGroup className='InputGroup'>
                                    <Input
                                        type='password'
                                        id='password'
                                        className='Input'
                                        value={password}
                                        placeholder='Create Password'
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </InputGroup>
                            </Row>
                            <Row>
                                <InputGroup className='InputGroup'>
                                    <Input
                                        type='password'
                                        id='confirm-password'
                                        className='Input'
                                        value={confirmPassword}
                                        placeholder='Confirm Password'
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </InputGroup>
                            </Row>
                        </Col>
                    </Row>
                </Container>
                <center>
                    <Button type='submit' className='SubmitButton'>
                        Signup
                    </Button>

                    <Button className='SwitchButton' onClick={() => navigate("/login")}>
                        Login
                    </Button>
                </center>
            </Form>

            {/* Modals for error handling */}
            <Modal isOpen={passwordModalOpen} toggle={passwordModalToggle}>
                <ModalHeader toggle={passwordModalToggle}>Passwords do not match</ModalHeader>
                <ModalBody>Looks like your passwords do not match, please try again.</ModalBody>
            </Modal>
            <Modal isOpen={challengeIntModalOpen} toggle={challengeModalToggle}>
                <ModalHeader toggle={challengeModalToggle}>Invalid challenge value</ModalHeader>
                <ModalBody>Your inputted challenge value does not match the expected value</ModalBody>
            </Modal>
        </Card>
    );
};

export { LoginPage, SignupPage };
