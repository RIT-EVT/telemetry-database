import { Plus, X } from "react-feather";
import QueryEntry from "./QueryEntry.ts";
import { useState } from "react";
import { Input, Button, InputGroup, Row, Col, Form, Card } from "reactstrap";
import { BuildURI } from "../Utils/ServerUtils";

const QueryTypes = ["Match", "Group", "Sample", "Sort", "Unwind"];

const AdvancedQuery = () => {
    const [stages, setStages] = useState([new QueryEntry(0)]);

    /**
     * Insert a new stage after a given stageIndex
     * @param {number} stageIndex - Stage's index
     */
    const addStageAfter = (stageIndex) => {
        const newStages = [...stages];
        const newStage = new QueryEntry(stageIndex + 1);

        for (let indexIncrease = stageIndex + 1; indexIncrease < newStages.length; indexIncrease++)
            newStages[indexIncrease].IncreaseIndex();

        newStages.splice(stageIndex + 1, 0, newStage);

        setStages(newStages);
    };

    /**
     * Remove a stage from the array of stages by stageIndex
     * @param {number} stageIndex - Stage's index
     */
    const removeStage = (stageIndex) => {
        if (stages.length === 1) return;
        const newStages = [...stages];

        for (let indexDecrease = stageIndex + 1; indexDecrease < newStages.length; indexDecrease++)
            newStages[indexDecrease].DecreaseIndex();

        newStages.splice(stageIndex, 1);

        setStages(newStages);
    };

    /**
     * Update the type of query a stage is
     * @param {number} stageIndex - Stage's index
     * @param {string} value - Type to update stage to
     */
    const handleTypeChange = (stageIndex, value) => {
        const newStages = [...stages];

        newStages[stageIndex].UpdateType(value);

        setStages(newStages);
    };

    /**
     * Add a new parameter to a stage
     * @param {number} stageIndex - Stage's index
     */
    const addParam = (stageIndex) => {
        const newStages = [...stages];

        newStages[stageIndex].AddParams();

        setStages(newStages);
    };

    /**
     * Remove a parameter from a stage
     * @param {number} stageIndex - Stage's index
     * @param {number} paramIndex - Index of parameter in the stage
     */
    const removeParam = (stageIndex, paramIndex) => {
        const newStages = [...stages];

        newStages[stageIndex].RemoveParam(paramIndex);

        setStages(newStages);
    };

    /**
     * Update the value of a parameter
     * @param {number} stageIndex - Stage's index
     * @param {number} paramIndex - Index of parameter in the stage
     * @param {string} field - Field to update
     * @param {string} newValue - New value of the field
     */
    const handleParamChange = (stageIndex, paramIndex, field, newValue) => {
        const newStages = [...stages];

        newStages[stageIndex].UpdateParamValue(paramIndex, field, newValue);

        setStages(newStages);
    };

    return (
        <Form>
            <Card>
                {stages.map((stage) => (
                    <div key={stage.index} className="mb-3 p-2 border rounded data-background">
                        <InputGroup className="mb-2 align-items-center ">
                            <Button color="danger" size="sm" onClick={() => removeStage(stage.index)}>
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

                            <Button color="success" size="sm" onClick={() => addStageAfter(stage.index)}>
                                <Plus size={14} />
                            </Button>
                        </InputGroup>

                        {stage.type !== "none" && (
                            <div className="p-2 bg-light rounded param-background">
                                <h6 className="mb-2">{stage.type} Parameters</h6>

                                {stage.params.map((param, i) => (
                                    <Row key={i} xs="3" className="align-items-center mb-2 ">
                                        {Object.keys(param).map((key) => (
                                            <Col key={key} md="4">
                                                <Input
                                                    placeholder={key}
                                                    value={param.field}
                                                    onChange={(e) =>
                                                        handleParamChange(stage.index, i, key, e.target.value)
                                                    }
                                                />
                                            </Col>
                                        ))}

                                        <Col md="1">
                                            <Button
                                                color="danger"
                                                size="sm"
                                                onClick={() => removeParam(stage.index, i)}
                                            >
                                                <X size={12} />
                                            </Button>
                                        </Col>
                                    </Row>
                                ))}

                                <Button color="secondary" size="sm" onClick={() => addParam(stage.index)}>
                                    + Add Parameter
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
            </Card>
        </Form>
    );
};

export default AdvancedQuery;
