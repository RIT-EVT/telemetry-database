import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "reactstrap";
import "./404.css";
const Page404 = () => {
    let nav = useNavigate();
    const ReturnToMainScreen = () => {
        nav("/");
    };

    return (
        <Container>
            <Col>
                <Row>
                    <p className='welcomeTitle'>Welcome To The</p>
                </Row>
                <Row>
                    <div className='mfTitle'>
                        <h1 className='titleMain'>Telemetry DB 404 Page</h1>
                    </div>
                </Row>
                <Row>
                    <Button onClick={ReturnToMainScreen} id='buttonReturn'>
                        Return to Home Page
                    </Button>
                </Row>
            </Col>
        </Container>
    );
};

export default Page404;
