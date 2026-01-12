import { useState } from "react";
import { Form, Button, Container, Row, Col } from "reactstrap";
import AdvancedQuery from "./AdvancedQuery";

import "./DataVisualizer.css";
import BasicQuery from "./BasicQuery";

function DataVisualizer() {
    const [mode, setMode] = useState("basic");

    return (
        <>
            <Container className="query-mode-bar">
                <Row xs="2">
                    <Col className="align-center">
                        <button
                            className={`${mode == "basic" ? "current-mode" : "query-mode-button"}`}
                            onClick={() => {
                                if (mode !== "basic") setMode("basic");
                            }}
                        >
                            Simple Query
                        </button>
                    </Col>
                    <Col className="align-center">
                        <button
                            className={`${mode == "advanced" ? "current-mode" : "query-mode-button"}`}
                            onClick={() => {
                                if (mode !== "advanced") setMode("advanced");
                            }}
                        >
                            Advanced Query
                        </button>
                    </Col>
                </Row>
            </Container>
            {mode === "basic" ? <BasicQuery /> : <AdvancedQuery />}
        </>
    );
}

export default DataVisualizer;
