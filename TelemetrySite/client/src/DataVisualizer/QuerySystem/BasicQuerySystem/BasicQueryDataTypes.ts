enum QueryStep {
    FilterEvent,
    FilterCanMessages,
    SaveQuery,
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

type UpdateQueryStep = {
    updateQueryStep: (queryStep: QueryStep) => void;
};

export { QueryStep };

export type { QueryResponseProps, ResponseData, ResponseFormat, EventData, UpdateQueryStep };
