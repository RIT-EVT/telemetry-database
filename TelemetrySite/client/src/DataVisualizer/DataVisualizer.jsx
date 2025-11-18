import { useState } from "react";
import { Input, Button, Form, InputGroup } from "reactstrap";
import { Plus, X } from "react-feather";

const QueryTypes = ["Match", "Group", "Sample", "Sort", "Unwind"];

function DataVisualizer() {
    const [stages, setStages] = useState([{ id: Date.now(), type: "none" }]);

    /**
     * Add a new stage after the one that has its + button pressed
     */
    const addStageAfter = (afterId) => {
        setStages((prev) => {
            const newStage = { id: Date.now(), type: "none" };
            const index = prev.findIndex((stage) => stage.id === afterId); // Search for the index of the one pressed
            const newStages = [...prev];
            newStages.splice(index + 1, 0, newStage);
            return newStages;
        });
    };

    const removeStage = (id) => {
        if (stages.length == 1) return; // never allow the user to remove all stages
        setStages((prev) => prev.filter((stage) => stage.id !== id));
    };

    const handleTypeChange = (id, value) => {
        setStages((prev) =>
            prev.map((stage) =>
                stage.id === id ? { ...stage, type: value } : stage
            )
        );
    };

    return (
        <Form>
            {stages.map((stage) => (
                <InputGroup key={stage.id} className='mb-2 align-items-center'>
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
                        <option selected value='none'>
                            Select Stage
                        </option>
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
            ))}
        </Form>
    );
}

export default DataVisualizer;
