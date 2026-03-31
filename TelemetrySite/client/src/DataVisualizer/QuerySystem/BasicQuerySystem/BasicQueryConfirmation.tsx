import { getItem } from "Utils/SessionStorageLoader.ts";
import { useNavigate } from "react-router-dom";
import { Button, Col } from "reactstrap";
import { QueryFunctions, QueryStep } from "./BasicQueryDataTypes";

const QuerySubmitted = ({ updateQueryStep, updateQueryDocument, setHandleSubmit, currentDocId }: QueryFunctions) => {
    let nav = useNavigate();
    const ReturnToMainScreen = () => {
        updateQueryStep(QueryStep.FilterEvent);
        nav("/");
    };

    return (
        <Col className='justify-content-center align-items-center h-100 gap-3'>
            <h2 className='text-center'>
                Query <span className='text-primary'>{getItem("QueryName")}</span> has been submitted
            </h2>
            <Button onClick={ReturnToMainScreen} id='buttonReturn'>
                Return to Home Page
            </Button>
        </Col>
    );
};

export default QuerySubmitted;
