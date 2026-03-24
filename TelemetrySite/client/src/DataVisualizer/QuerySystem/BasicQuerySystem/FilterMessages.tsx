import { QueryFunctions } from "./BasicQueryDataTypes";
import { BuildURI } from "Utils/ServerUtils.ts";
import React, { useEffect, useState } from "react";
import { Input, Row, Col, Container, Label, InputGroup } from "reactstrap";

const FilterMessages = ({ updateQueryStep, updateQueryDocument, setHandleSubmit, currentDocId }: QueryFunctions) => {
    const auth_token = sessionStorage.getItem("authToken");
    const [canFrameCheckBoxes, setCANCheckBoxes] = useState<React.ReactElement>();
    const [selectedBoxes, setCheckedBoxes] = useState<Map<string, boolean>>();

    const updateSelectedCheckBox = (e: {
        nativeEvent: Event;
        currentTarget: EventTarget & HTMLInputElement;
        target: EventTarget;
        bubbles: boolean;
        cancelable: boolean;
        defaultPrevented: boolean;
        eventPhase: number;
        isTrusted: boolean;
        preventDefault(): void;
        isDefaultPrevented(): boolean;
        stopPropagation(): void;
        isPropagationStopped(): boolean;
        persist(): void;
        timeStamp: number;
        type: string;
    }): void => {
        console.log("input");
        const newMap = selectedBoxes;
        const targetElement = e.target as HTMLInputElement;
        newMap?.set(targetElement.id, targetElement.value === "checked");

        setCheckedBoxes(newMap);
    };

    const handleMessageFilterGet = async (response: Response): Promise<void> => {
        if (response.ok) {
            const responseData = await response.json();

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
        <Container>
            <Row xs={3}>{canFrameCheckBoxes}</Row>
        </Container>
    );
};

export default FilterMessages;
