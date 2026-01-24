import { useState } from "react";
import { Button, Container, Row, Col } from "reactstrap";
import AdvancedQuery from "./QuerySystem/AdvancedQuery";

import "./DataVisualizer.css";
import BasicQuery from "./QuerySystem/BasicQuery";

function DataVisualizer() {
    const [mode, setMode] = useState("basic");

    return (
        <>
            <Container className='query-mode-bar'>
                <Row xs='2'>
                    <Col className='align-center'>
                        <Button
                            className={`${mode === "basic" ? "current-mode" : "query-mode-button"}`}
                            onClick={() => {
                                if (mode !== "basic") setMode("basic");
                            }}
                        >
                            Simple Query
                        </Button>
                    </Col>
                    <Col className='align-center'>
                        <Button
                            className={`${mode === "advanced" ? "current-mode" : "query-mode-button"}`}
                            onClick={() => {
                                if (mode !== "advanced") setMode("advanced");
                            }}
                        >
                            Advanced Query
                        </Button>
                    </Col>
                </Row>
            </Container>
            {mode === "basic" ? <BasicQuery /> : <AdvancedQuery />}
        </>
    );
}

export default DataVisualizer;
