import { useState } from "react";
import { Button, Container, Row, Col } from "reactstrap";
import AdvancedQuery from "./QuerySystem/AdvancedQuerySystem/AdvancedQuery";

import "./DataVisualizer.css";
import BasicQuery from "./QuerySystem/BasicQuerySystem/BasicQuery";

enum QueryMode {
    basic,
    advanced,
}

function DataVisualizer() {
    const [mode, setMode] = useState(QueryMode.basic);

    return (
        <>
            <Container className='query-mode-bar'>
                <Row xs='2'>
                    <Col className='align-center'>
                        <Button
                            className={`${mode === QueryMode.basic ? "current-mode" : "query-mode-button"}`}
                            onClick={() => setMode(QueryMode.basic)}
                        >
                            Simple Query
                        </Button>
                    </Col>
                    <Col className='align-center'>
                        <Button
                            className={`${mode === QueryMode.advanced ? "current-mode" : "query-mode-button"}`}
                            onClick={() => setMode(QueryMode.advanced)}
                        >
                            Advanced Query
                        </Button>
                    </Col>
                </Row>
            </Container>
            {mode === QueryMode.basic ? <BasicQuery /> : <AdvancedQuery />}
        </>
    );
}

export default DataVisualizer;
