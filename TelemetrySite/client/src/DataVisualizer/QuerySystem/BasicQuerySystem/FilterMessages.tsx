import { QueryFunctions, QueryDataFormat, QueryStep } from "./BasicQueryDataTypes";
import { BuildURI } from "Utils/ServerUtils.ts";
import React, { useEffect, useState, useRef } from "react";
import { Input, Row, Col, Container, Label, InputGroup, CardHeader } from "reactstrap";
import { saveItem, getItem } from "Utils/SessionStorageLoader.ts";

const FilterMessages = ({ updateQueryStep, updateQueryDocument, setHandleSubmit, currentDocId }: QueryFunctions) => {
    const auth_token = getItem("authToken");

    // List of CAN frame names fetched from the server
    const [canNames, setCanNames] = useState<string[]>([]);

    // Map of CAN frame name to whether it is checked
    const [selectedBoxes, setBoxesChecked] = useState<Map<string, boolean>>(new Map());

    // The current query being built, loaded from session storage
    const [currentQueryData, setCurrentQueryData] = useState<QueryDataFormat>();

    const currentQueryDataRef = useRef<QueryDataFormat>();

    const updateSelectedCheckBox = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const targetElement = e.target as HTMLInputElement;
        const checked: boolean = targetElement.checked;

        // Copy the map so React detects the state change
        const newMap = new Map(selectedBoxes);
        newMap.set(targetElement.id, checked);
        setBoxesChecked(newMap);

        // Add or remove the CAN name from the query data
        setCurrentQueryData((prev) => {
            if (!prev) return prev;
            const updatedNames = checked
                ? [...prev.query_data.can_name, targetElement.id]
                : prev.query_data.can_name.filter((name) => name !== targetElement.id);
            return { ...prev, query_data: { ...prev.query_data, can_name: updatedNames } };
        });
    };

    // Returns true only if both arrays contain exactly the same elements
    const haveSameElementsSorted = (arr1: any[], arr2: any[]): boolean => {
        if (!arr1?.length || !arr2?.length || arr1.length !== arr2.length) return false;
        return JSON.stringify([...arr1].sort()) === JSON.stringify([...arr2].sort());
    };

    const handleMessageFilterGet = async (response: Response): Promise<void> => {
        if (!response.ok) {
            console.error(`message_filter fetch failed with status ${response.status}`);
            return;
        }

        const responseData = await response.json();
        const names: string[] = responseData.response;

        // Store the raw names so the JSX below can render them reactively
        setCanNames(names);

        // Update possible_can_names in the query data if they differ from what we have
        setCurrentQueryData((prev) => {
            if (!prev) return prev;
            if (haveSameElementsSorted(prev.query_data.possible_can_names, names)) return prev;
            return { ...prev, query_data: { ...prev.query_data, possible_can_names: names } };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = currentQueryDataRef.current;
        if (!data) return;

        const clickedButton = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
        console.log(currentDocId);
        if (clickedButton.value === "submit") {
            saveItem("QueryData", data);
            updateQueryStep(QueryStep.FilterCanMessages);
            console.log(data);
            const response = await fetch(
                `${BuildURI("message_filter")}?doc_id=${currentDocId}&auth_token=${getItem("authToken")}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                },
            );

            if (!response.ok) {
                throw new Error(`Request failed with code ${response.status} and text ${response.statusText}`);
            }
        } else if (clickedButton.value === "previous-step") {
            saveItem("QueryData", data);
            updateQueryStep(QueryStep.FilterEvent);
        }
    };

    useEffect(() => {
        // Register this step's submit handler with the parent
        setHandleSubmit(handleSubmit);

        const queryData = getItem("QueryData") as QueryDataFormat;

        if (queryData) {
            setCurrentQueryData(queryData);

            // Fetch the available CAN frame names for this document
            fetch(`${BuildURI("message_filter")}?doc_id=${currentDocId}&auth_token=${auth_token}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }).then(handleMessageFilterGet);
        } else {
            // No query data means the user skipped the first step — send them back
            updateQueryStep(QueryStep.FilterEvent);
        }
    }, []);

    useEffect(() => {
        if (!currentQueryData?.query_data.possible_can_names) return;
        currentQueryDataRef.current = currentQueryData;

        saveItem("QueryData", currentQueryData);
        const newCheckBoxMap = new Map<string, boolean>();
        currentQueryData.query_data.possible_can_names.forEach((name) => {
            // A name is checked if it appears in the can_name selection list
            newCheckBoxMap.set(name, currentQueryData.query_data.can_name.includes(name));
        });
        setBoxesChecked(newCheckBoxMap);
    }, [currentQueryData]);

    return (
        <>
            <CardHeader className="center-align">
                <h1 className="query-selector">Filter Messages</h1>
            </CardHeader>
            <Container>
                <Row xs={3}>
                    {canNames.map((element: string) => (
                        <Col key={element}>
                            <InputGroup className="align-items-center">
                                <Input
                                    id={element}
                                    type="checkbox"
                                    checked={selectedBoxes.get(element) ?? false}
                                    onChange={updateSelectedCheckBox}
                                />
                                <Label check className="mx-1 my-0 white">
                                    {element}
                                </Label>
                            </InputGroup>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
};

export default FilterMessages;
