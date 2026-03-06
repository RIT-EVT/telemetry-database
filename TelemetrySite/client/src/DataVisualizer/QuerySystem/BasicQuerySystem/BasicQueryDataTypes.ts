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

type ResponseData = {
    matchFinal_Result: ResponseFormat;
    matchDate?: ResponseFormat;
    matchName?: ResponseFormat;
    matchLocation?: ResponseFormat;
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

export { QueryStep };

export type { QueryResponseProps, ResponseData, ResponseFormat, EventData, QueryFunctions, NavButtonsInput };
