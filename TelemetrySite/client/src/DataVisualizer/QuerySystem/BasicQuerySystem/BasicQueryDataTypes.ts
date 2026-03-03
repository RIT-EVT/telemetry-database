enum QueryStep {
    FilterEvent = "EVENT",
    FilterCanMessages = "MESSAGE",
    SaveQuery = "SAVE",
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
    currentDocId: String;
};

type NavButtonsInput = {
    nextStep: boolean;
    previousStep: boolean;
};

export { QueryStep };

export type { QueryResponseProps, ResponseData, ResponseFormat, EventData, QueryFunctions, NavButtonsInput };
