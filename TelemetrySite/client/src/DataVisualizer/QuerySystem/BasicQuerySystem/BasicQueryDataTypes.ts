enum QueryStep {
    FilterEvent = 0,
    FilterCanMessages = 1,
    SaveQuery = 2,
}

type EventData = {
    name: string;
    date: string;
    location: string;
};

type ResponseFormat = {
    count: number;
    events: [EventData];
};

type QueryResponseResult = {
    matchFinal_Result: ResponseFormat;
    matchDate?: ResponseFormat;
    matchName?: ResponseFormat;
    matchLocation?: ResponseFormat;
};

type ResponseData = {
    query_data: QueryResponseResult;
    query_name: {
        name_passed: boolean;
        name_valid: boolean;
        name: string;
    };
};

type QueryResponseProps = {
    toggleModal: () => void;
    response: ResponseData | null;
};

type QueryFunctions = {
    updateQueryStep: (queryStep: QueryStep) => void;
    updateQueryDocument: (newQueryDoc: String) => void;
    setHandleSubmit: (callbackFunction: (e: React.FormEvent) => void) => void; // A function that accepts a callback function to handle submits
    currentDocId: String;
};

type NavButtonsInput = {
    nextStep: boolean;
    previousStep: boolean;
};

/**
 * Formatted data for how we save the query and pass it to the backend
 */
interface QueryDataFormat {
    query_event: {
        event_start_date?: Date;
        event_end_date?: Date;
        event_date_single_day?: boolean;
        event_name?: string;
        event_location?: string;
    };
    query_data: {
        can_name: [string]; // TODO add more advanced customizability for graphing
    };
    query_name: string;
}

export { QueryStep };

export type {
    QueryResponseProps,
    ResponseData,
    QueryResponseResult,
    ResponseFormat,
    EventData,
    QueryFunctions,
    NavButtonsInput,
    QueryDataFormat,
};
