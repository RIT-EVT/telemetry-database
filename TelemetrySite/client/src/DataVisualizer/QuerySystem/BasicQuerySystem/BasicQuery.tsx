import "./BasicQuery.css";

import { useEffect, useState } from "react";
import FilterEvent from "./FilterEvent";
import FilterMessages from "./FilterMessages";

import { Card, CardHeader } from "reactstrap";

import { QueryStep, QueryFunctions } from "./BasicQueryDataTypes";

function BasicQuery() {
    const [queryStep, setQueryStep] = useState<QueryStep>(window.sessionStorage.getItem("QueryStep") as QueryStep);
    const [currentDocId, setCurrentQueryDocument] = useState<String>(window.sessionStorage.getItem("DocId") as String);

    const updateQueryStep = (newQuery: QueryStep) => {
        setQueryStep(newQuery);
        window.sessionStorage.setItem("QueryStep", newQuery);
    };

    const updateQueryDocument = (newQueryDocID: String) => {
        setCurrentQueryDocument(newQueryDocID);
        window.sessionStorage.setItem("DocId", newQueryDocID.toString());
    };

    const queryFunctions: QueryFunctions = { updateQueryStep, updateQueryDocument, currentDocId };

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
        if (currentDocId) {
            updateQueryDocument("NULL");
            updateQueryStep(QueryStep.FilterEvent);
        } else if (!queryStep) {
            updateQueryStep(QueryStep.FilterEvent);
        }
    }, [queryStep, currentDocId]);

    // TODO add back button

    return (
        <Card className='p-3'>
            <CardHeader className='center-align'>
                <h1 className='query-selector'></h1>
            </CardHeader>
            {queryBody()}
        </Card>
    );
}

export default BasicQuery;
