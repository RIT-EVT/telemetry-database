import { useState } from "react";
import { Input, Button, Form, InputGroup, Row, Col } from "reactstrap";
import { Plus, X } from "react-feather";

const QueryTypes = ["Match", "Group", "Sample", "Sort", "Unwind"];

function DataVisualizer() {
    const [stages, setStages] = useState([
        { id: Date.now(), type: "none", params: [] },
    ]);

    const addStageAfter = (afterId) => {
        setStages((prev) => {
            const newStage = { id: Date.now(), type: "none", params: [] };
            const index = prev.findIndex((stage) => stage.id === afterId);
            const newStages = [...prev];
            newStages.splice(index + 1, 0, newStage);
            return newStages;
        });
    };

    const removeStage = (id) => {
        if (stages.length === 1) return;
        setStages((prev) => prev.filter((stage) => stage.id !== id));
    };

    const handleTypeChange = (id, value) => {
        setStages((prev) =>
            prev.map((stage) =>
                stage.id === id ? { ...stage, type: value, params: [] } : stage
            )
        );
    };

    const addParam = (stageId) => {
        setStages((prev) =>
            prev.map((stage) =>
                stage.id === stageId
                    ? {
                          ...stage,
                          params: [
                              ...stage.params,
                              { field: "", operator: "", value: "" },
                          ],
                      }
                    : stage
            )
        );
    };

    const removeParam = (stageId, index) => {
        setStages((prev) =>
            prev.map((stage) =>
                stage.id === stageId
                    ? {
                          ...stage,
                          params: stage.params.filter((_, i) => i !== index),
                      }
                    : stage
            )
        );
    };

    const handleParamChange = (stageId, index, field, newValue) => {
        setStages((prev) =>
            prev.map((stage) =>
                stage.id === stageId
                    ? {
                          ...stage,
                          params: stage.params.map((p, i) =>
                              i === index ? { ...p, [field]: newValue } : p
                          ),
                      }
                    : stage
            )
        );
    };

    return (
        <Form>
            {stages.map((stage) => (
                <div key={stage.id} className='mb-3 p-2 border rounded'>
                    <InputGroup className='mb-2 align-items-center'>
                        <Button
                            color='danger'
                            size='sm'
                            onClick={() => removeStage(stage.id)}
                        >
                            <X size={14} />
                        </Button>

                        <Input
                            type='select'
                            value={stage.type}
                            onChange={(e) =>
                                handleTypeChange(stage.id, e.target.value)
                            }
                        >
                            <option value='none'>Select Stage</option>
                            {QueryTypes.map((queryType) => (
                                <option key={queryType} value={queryType}>
                                    {queryType}
                                </option>
                            ))}
                        </Input>

                        <Button
                            color='success'
                            size='sm'
                            onClick={() => addStageAfter(stage.id)}
                        >
                            <Plus size={14} />
                        </Button>
                    </InputGroup>

                    {stage.type !== "none" && (
                        <div className='p-2 bg-light rounded'>
                            <h6 className='mb-2'>{stage.type} Parameters</h6>

                            {stage.params.map((param, i) => (
                                <Row
                                    key={i}
                                    className='align-items-center mb-2'
                                >
                                    <Col md='4'>
                                        <Input
                                            placeholder='Field'
                                            value={param.field}
                                            onChange={(e) =>
                                                handleParamChange(
                                                    stage.id,
                                                    i,
                                                    "field",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Col>
                                    <Col md='3'>
                                        <Input
                                            placeholder='Operator'
                                            value={param.operator}
                                            onChange={(e) =>
                                                handleParamChange(
                                                    stage.id,
                                                    i,
                                                    "operator",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Col>
                                    <Col md='4'>
                                        <Input
                                            placeholder='Value'
                                            value={param.value}
                                            onChange={(e) =>
                                                handleParamChange(
                                                    stage.id,
                                                    i,
                                                    "value",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </Col>
                                    <Col md='1'>
                                        <Button
                                            color='danger'
                                            size='sm'
                                            onClick={() =>
                                                removeParam(stage.id, i)
                                            }
                                        >
                                            <X size={12} />
                                        </Button>
                                    </Col>
                                </Row>
                            ))}

                            <Button
                                color='secondary'
                                size='sm'
                                onClick={() => addParam(stage.id)}
                            >
                                + Add Parameter
                            </Button>
                        </div>
                    )}
                </div>
            ))}
        </Form>
    );
}

export default DataVisualizer;
