import { Plus, X } from "react-feather";
import QueryEntry, { ParamFields } from "./QueryEntry.ts";
import { useState } from "react";
import {
    Input,
    Button,
    InputGroup,
    Row,
    Col,
    Form,
    Card,
    Alert,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "reactstrap";
import { BuildURI } from "Utils/ServerUtils.ts";
import { getItem } from "Utils/SessionStorageLoader.ts";

const QueryTypes = Object.keys(ParamFields);

type TestResult = { count: number; sample: unknown[] };

const AdvancedQuery = () => {
    const [stages, setStages] = useState([new QueryEntry(0)]);
    const [queryName, setQueryName] = useState("");
    const [docId, setDocId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<TestResult | null>(null);

    /**
     * Insert a new stage after a given stageIndex
     * @param {number} stageIndex - Stage's index
     */
    const addStageAfter = (stageIndex: number) => {
        const newStages = [...stages];
        const newStage = new QueryEntry(stageIndex + 1);

        for (let indexIncrease = stageIndex + 1; indexIncrease < newStages.length; indexIncrease++)
            newStages[indexIncrease]?.IncreaseIndex();

        newStages.splice(stageIndex + 1, 0, newStage);

        setStages(newStages);
    };

    /**
     * Remove a stage from the array of stages by stageIndex
     * @param {number} stageIndex - Stage's index
     */
    const removeStage = (stageIndex: number) => {
        if (stages.length === 1) return;
        const newStages = [...stages];

        for (let indexDecrease = stageIndex + 1; indexDecrease < newStages.length; indexDecrease++)
            newStages[indexDecrease]?.DecreaseIndex();

        newStages.splice(stageIndex, 1);

        setStages(newStages);
    };

    /**
     * Update the type of query a stage is
     * @param {number} stageIndex - Stage's index
     * @param {string} value - Type to update stage to
     */
    const handleTypeChange = (stageIndex: number, value: string) => {
        const newStages = [...stages];

        newStages[stageIndex]?.UpdateType(value);

        setStages(newStages);
    };

    /**
     * Add a new parameter to a stage
     * @param {number} stageIndex - Stage's index
     */
    const addParam = (stageIndex: number) => {
        const newStages = [...stages];

        newStages[stageIndex]?.AddParams();

        setStages(newStages);
    };

    /**
     * Remove a parameter from a stage
     * @param {number} stageIndex - Stage's index
     * @param {number} paramIndex - Index of parameter in the stage
     */
    const removeParam = (stageIndex: number, paramIndex: number) => {
        const newStages = [...stages];

        newStages[stageIndex]?.RemoveParam(paramIndex);

        setStages(newStages);
    };

    /**
     * Update the value of a parameter
     * @param {number} stageIndex - Stage's index
     * @param {number} paramIndex - Index of parameter in the stage
     * @param {string} field - Field to update
     * @param {string} newValue - New value of the field
     */
    const handleParamChange = (stageIndex: number, paramIndex: number, field: string, newValue: string) => {
        const newStages = [...stages];

        newStages[stageIndex]?.UpdateParamValue(paramIndex, field, newValue);

        setStages(newStages);
    };

    //#region Data Transmission

    const sendQuery = async (mode: "test-query" | "save-query") => {
        setErrorMessage(null);
        setSuccessMessage(null);

        if (stages.some((stage) => stage.type === "none")) {
            setErrorMessage("Every stage needs a type. Select one or remove the empty stage.");
            return;
        }
        if (mode === "save-query" && queryName.trim() === "") {
            setErrorMessage("Enter a query name before saving.");
            return;
        }

        try {
            const response = await fetch(
                `${BuildURI("advanced_query")}?mode=${mode}&doc_id=${docId ?? "NULL"}&auth_token=${getItem("authToken")}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        query_name: queryName.trim(),
                        stages: stages.map((stage) => stage.toPayload()),
                    }),
                },
            );
            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                setErrorMessage(body.error ?? body.invalid ?? `Request failed (error ${response.status}).`);
                return;
            }

            if (mode === "test-query") {
                setTestResult(body as TestResult);
            } else {
                setDocId(body.document_id);
                setSuccessMessage(`Query "${queryName.trim()}" saved.`);
            }
        } catch (err) {
            console.error("Advanced query error:", err);
            setErrorMessage("Could not reach the server.");
        }
    };

    //#endregion

    return (
        <Form onSubmit={(e) => e.preventDefault()}>
            <Card>
                {stages.map((stage) => (
                    <div key={stage.id} className="mb-3 p-2 border rounded data-background">
                        <InputGroup className="mb-2 align-items-center ">
                            <Button type="button" color="danger" size="sm" onClick={() => removeStage(stage.index)}>
                                <X size={14} />
                            </Button>

                            <Input
                                type="select"
                                value={stage.type}
                                onChange={(e) => handleTypeChange(stage.index, e.target.value)}
                            >
                                <option value="none">Select Stage</option>
                                {QueryTypes.map((queryType) => (
                                    <option key={queryType} value={queryType}>
                                        {queryType}
                                    </option>
                                ))}
                            </Input>

                            <Button type="button" color="success" size="sm" onClick={() => addStageAfter(stage.index)}>
                                <Plus size={14} />
                            </Button>
                        </InputGroup>

                        {stage.type !== "none" && (
                            <div className="p-2 bg-light rounded param-background">
                                <h6 className="mb-2">{stage.type} Parameters</h6>
                                {stage.type === "Group" && (
                                    <small className="d-block mb-2 text-white-50">
                                        Use Output Name <code>_id</code> for the group key. Leave its Field Path empty
                                        to group everything together.
                                    </small>
                                )}

                                {stage.params.map((param, i) => (
                                    <Row key={i} xs="3" className="align-items-center mb-2 ">
                                        {Object.keys(param).map((key) => {
                                            const options = ParamFields[stage.type]?.options[key];
                                            return (
                                                <Col key={key} md="4">
                                                    {options ? (
                                                        <Input
                                                            type="select"
                                                            value={param[key]}
                                                            onChange={(e) =>
                                                                handleParamChange(stage.index, i, key, e.target.value)
                                                            }
                                                        >
                                                            {options.map((option) => (
                                                                <option key={option} value={option}>
                                                                    {option}
                                                                </option>
                                                            ))}
                                                        </Input>
                                                    ) : (
                                                        <Input
                                                            placeholder={key}
                                                            value={param[key]}
                                                            onChange={(e) =>
                                                                handleParamChange(stage.index, i, key, e.target.value)
                                                            }
                                                        />
                                                    )}
                                                </Col>
                                            );
                                        })}

                                        <Col md="1">
                                            <Button
                                                type="button"
                                                color="danger"
                                                size="sm"
                                                onClick={() => removeParam(stage.index, i)}
                                            >
                                                <X size={12} />
                                            </Button>
                                        </Col>
                                    </Row>
                                ))}

                                <Button type="button" color="secondary" size="sm" onClick={() => addParam(stage.index)}>
                                    + Add Parameter
                                </Button>
                            </div>
                        )}
                    </div>
                ))}

                <Row className="align-items-center p-2">
                    <Col md="6">
                        <Input
                            id="advanced-query-name"
                            placeholder="Query name"
                            value={queryName}
                            onChange={(e) => setQueryName(e.target.value)}
                        />
                    </Col>
                    <Col md="6" className="d-flex gap-2 justify-content-end">
                        <Button type="button" color="info" onClick={() => sendQuery("test-query")}>
                            Test Query
                        </Button>
                        <Button
                            type="button"
                            className="nav-buttons"
                            style={{ width: "auto" }}
                            onClick={() => sendQuery("save-query")}
                        >
                            Save Query
                        </Button>
                    </Col>
                </Row>

                {errorMessage && (
                    <Alert color="danger" className="m-2">
                        {errorMessage}
                    </Alert>
                )}
                {successMessage && (
                    <Alert color="success" className="m-2">
                        {successMessage}
                    </Alert>
                )}
            </Card>

            <Modal isOpen={testResult !== null} toggle={() => setTestResult(null)} size="xl">
                <ModalHeader toggle={() => setTestResult(null)}>Query Test Result</ModalHeader>
                <ModalBody>
                    <p>
                        <strong>{testResult?.count ?? 0}</strong> document(s) matched.
                    </p>
                    {testResult && testResult.sample.length > 0 && (
                        <>
                            <h6>Sample (first {testResult.sample.length})</h6>
                            <pre style={{ maxHeight: "50vh", overflow: "auto" }}>
                                {JSON.stringify(testResult.sample, null, 2)}
                            </pre>
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="danger" onClick={() => setTestResult(null)}>
                        Exit
                    </Button>
                </ModalFooter>
            </Modal>
        </Form>
    );
};

export default AdvancedQuery;
