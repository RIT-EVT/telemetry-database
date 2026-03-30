import { NavButtonsInput } from "./BasicQueryDataTypes";
import { Container, Col, Row } from "reactstrap";

const NavigationButtons = ({ nextStep, previousStep, submitQuery }: NavButtonsInput) => {
    let nextButton;
    let previousButton;

    if (nextStep) {
        nextButton = (
            <button value="next-step" type="submit" className="nav-buttons">
                Next Step
            </button>
        );
    }

    if (previousStep) {
        previousButton = (
            <button value="previous-step" type="submit" className="nav-buttons">
                Previous Step
            </button>
        );
    }
    if (submitQuery) {
        nextButton = (
            <button value="submit" type="submit" className="nav-buttons">
                Finish Query
            </button>
        );
    }

    return (
        <Container className="top-padding ">
            <Row xs="2" className="vertical-align">
                <Col className="align-center">{previousButton}</Col>
                <Col className="align-center">{nextButton}</Col>
            </Row>
        </Container>
    );
};

export default NavigationButtons;
