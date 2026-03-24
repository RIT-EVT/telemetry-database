import "./BasicQuery.css";

import { useEffect, useState, useRef } from "react";
import FilterEvent from "./FilterEvent";
import FilterMessages from "./FilterMessages";

import { Card, Form } from "reactstrap";

import { QueryStep, QueryFunctions } from "./BasicQueryDataTypes";
import NavigationButtons from "./Navigation.tsx";
import { getMaxEnumValue } from "Utils/EnumUtils.ts";

function BasicQuery() {
    const [queryStep, setQueryStep] = useState<QueryStep>(() => {
        const stored = sessionStorage.getItem("QueryStep");
        return stored !== null ? (Number(stored) as QueryStep) : QueryStep.FilterEvent; // Convert from string to number to QueryStep
    });
    const [currentDocId, setCurrentQueryDocument] = useState<String>(window.sessionStorage.getItem("DocId") as String);
    const handleSubmitRef = useRef<(e: React.FormEvent) => void>((e) => {});

    // Update the handler
    const setHandleSubmit = (callbackFunction: (e: React.FormEvent) => void) => {
        handleSubmitRef.current = callbackFunction;
    };

    const updateQueryStep = (newQuery: QueryStep) => {
        setQueryStep(newQuery);
        window.sessionStorage.setItem("QueryStep", newQuery.toString());
    };

    const updateQueryDocument = (newQueryDocID: String) => {
        setCurrentQueryDocument(newQueryDocID);
        window.sessionStorage.setItem("DocId", newQueryDocID.toString());
    };

    const queryFunctions: QueryFunctions = {
        updateQueryStep,
        updateQueryDocument,
        setHandleSubmit,
        currentDocId,
    };

    const queryBody = () => {
        switch (queryStep) {
            case QueryStep.FilterEvent:
                return <FilterEvent {...queryFunctions} />;
            case QueryStep.FilterCanMessages:
                return <FilterMessages {...queryFunctions} />;

            default:
                return <div></div>;
        }
    };

    useEffect(() => {
        if (!currentDocId) {
            updateQueryDocument("NULL");
            updateQueryStep(QueryStep.FilterEvent);
        } else if (!queryStep) {
            updateQueryStep(QueryStep.FilterEvent);
        }
    }, [queryStep, currentDocId]);

    return (
        <Form
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmitRef.current(e);
            }}
        >
            <Card className='p-3'>{queryBody()}</Card>
            <NavigationButtons previousStep={queryStep !== 0} nextStep={getMaxEnumValue(QueryStep) !== queryStep} />
        </Form>
    );
}

export default BasicQuery;
