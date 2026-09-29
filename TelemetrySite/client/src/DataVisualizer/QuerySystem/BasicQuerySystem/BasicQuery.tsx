import "./BasicQuery.css";

import { useEffect, useState, useRef } from "react";
import FilterEvent from "./FilterEvent";
import FilterMessages from "./FilterMessages";
import ConfirmQuery from "./ConfirmQuery.tsx";
import BasicQueryConfirmation from "./BasicQueryConfirmation.tsx";

import { Card, Form } from "reactstrap";

import { QueryStep, QueryFunctions } from "./BasicQueryDataTypes";
import NavigationButtons from "./Navigation.tsx";
import { getMaxEnumValue } from "Utils/EnumUtils.ts";
import { saveItem, getItem, removeItem } from "Utils/SessionStorageLoader.ts";

function BasicQuery() {
    const [queryStep, setQueryStep] = useState<QueryStep>(() => {
        const stored = getItem("QueryStep");
        return stored !== null ? (Number(stored) as QueryStep) : QueryStep.FilterEvent; // Convert from string to number to QueryStep
    });
    const [currentDocId, setCurrentQueryDocument] = useState<String>(getItem("DocId") as String);
    const handleSubmitRef = useRef<(e: React.FormEvent) => void>((e) => {});

    // Update the handler
    const setHandleSubmit = (callbackFunction: (e: React.FormEvent) => void) => {
        handleSubmitRef.current = callbackFunction;
    };

    const updateQueryStep = (newQuery: QueryStep) => {
        setQueryStep(newQuery);
        saveItem("QueryStep", newQuery.toString());
    };

    const updateQueryDocument = (newQueryDocID: String) => {
        setCurrentQueryDocument(newQueryDocID);
        saveItem("DocId", newQueryDocID.toString());
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
            case QueryStep.ConfirmQuery:
                return <ConfirmQuery {...queryFunctions} />;
            default:
                return <BasicQueryConfirmation {...queryFunctions} />;
        }
    };

    useEffect(() => {
        if (!currentDocId) {
            updateQueryDocument("NULL");
            if (QueryStep.FilterEvent !== queryStep && QueryStep.ConfirmationOfSubmission !== queryStep) {
                updateQueryStep(QueryStep.FilterEvent);
                removeItem("QueryData");
            }
        } else if (!queryStep && queryStep !== QueryStep.ConfirmationOfSubmission) {
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
            <NavigationButtons
                previousStep={queryStep > 1}
                nextStep={getMaxEnumValue(QueryStep) !== queryStep && queryStep > 0}
                submitQuery={getMaxEnumValue(QueryStep) === queryStep}
            />
        </Form>
    );
}

export default BasicQuery;
