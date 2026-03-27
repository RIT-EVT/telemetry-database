import { QueryFunctions, QueryDataFormat } from "./BasicQueryDataTypes";
import { BuildURI } from "Utils/ServerUtils.ts";
import React, { useEffect, useState } from "react";
import { Input, Row, Col, Container, Label, InputGroup, CardHeader } from "reactstrap";
import { saveItem, getItem } from "Utils/SessionStorageLoader.ts";

const FilterMessages = ({ updateQueryStep, updateQueryDocument, setHandleSubmit, currentDocId }: QueryFunctions) => {
    const auth_token = getItem("authToken");
    const [canFrameCheckBoxes, setCANCheckBoxes] = useState<React.ReactElement>();
    const [selectedBoxes, setBoxesChecked] = useState<Map<string, boolean>>();
    const [currentQueryData, setCurrentQueryData] = useState<QueryDataFormat>();

    const updateSelectedCheckBox = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newMap = selectedBoxes;
        const targetElement = e.target as HTMLInputElement;

        const checked: boolean = targetElement.value === "checked";

        newMap?.set(targetElement.id, checked);

        setBoxesChecked(newMap);
    };

    const handleMessageFilterGet = async (response: Response): Promise<void> => {
        if (response.ok) {
            const responseData = await response.json();
            // Update the current displayed check boxes
            setCANCheckBoxes(
                responseData.response.map((element: string) => {
                    return (
                        <Col key={element}>
                            <InputGroup className='align-items-center'>
                                <Input id={element} type='checkbox' onInput={updateSelectedCheckBox} />{" "}
                                <Label check className='mx-1 my-0 white'>
                                    {element}
                                </Label>
                            </InputGroup>
                        </Col>
                    );
                }),
            );
            // Clear any previously checked boxes from the tracker to prevent outdated checked boxes
            setBoxesChecked(new Map<string, boolean>());
        }
    };

    const handleSubmit = (e: React.FormEvent) => {};

    useEffect(() => {
        setHandleSubmit(handleSubmit);

        fetch(`${BuildURI("message_filter")}?doc_id=${currentDocId}&auth_token=${auth_token}`, {
            method: "get",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(handleMessageFilterGet);
    }, []);
    return (
        <>
            <CardHeader className='center-align'>
                <h1 className='query-selector'>Filter Messages</h1>
            </CardHeader>
            <Container>
                <Row xs={3}>{canFrameCheckBoxes}</Row>
            </Container>
        </>
    );
};

export default FilterMessages;
