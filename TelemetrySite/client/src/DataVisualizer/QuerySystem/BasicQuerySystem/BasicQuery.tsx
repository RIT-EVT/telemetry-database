import "./BasicQuery.css";

import { useState } from "react";
import FilterEvent from "./FilterEvent";
import FilterMessages from "./FilterMessages";

import { QueryStep } from "./BasicQueryDataTypes";

function BasicQuery() {
    const [currentQueryStep, setCurrentQueryStep] = useState<QueryStep>(QueryStep.FilterEvent);

    const updateQueryStep = (newQuery: QueryStep) => {
        setCurrentQueryStep(newQuery);
    };

    switch (currentQueryStep) {
        case QueryStep.FilterEvent:
            return <FilterEvent updateQueryStep={updateQueryStep} />;
        case QueryStep.FilterCanMessages:
            return <FilterMessages updateQueryStep={updateQueryStep} />;
        default:
            break;
    }
}

export default BasicQuery;
