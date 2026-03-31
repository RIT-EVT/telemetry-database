import { QueryFunctions, QueryDataFormat, QueryStep } from "./BasicQueryDataTypes";
import { Card, Col, Row, CardHeader, CardBody, Label } from "reactstrap";
import { BuildURI } from "Utils/ServerUtils.ts";

import { getItem, saveItem, removeItem } from "Utils/SessionStorageLoader.ts";
import { useRef, useEffect } from "react";

const formatDate = (date?: Date) => (date ? new Date(date).toLocaleDateString(undefined, { dateStyle: "medium" }) : null);
const ConfirmQuery = ({ updateQueryStep, updateQueryDocument, setHandleSubmit, currentDocId }: QueryFunctions) => {
    const { query_event, query_data, query_name } = getItem("QueryData");
    const isSingleDay = query_event.event_date_single_day;
    const currentQueryDataRef = useRef<QueryDataFormat>(getItem("QueryData"));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = currentQueryDataRef.current;
        if (!data) return;

        const clickedButton = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
        if (clickedButton.value === "submit") {
            const response = await fetch(
                `${BuildURI("confirm_query")}?doc_id=${currentDocId}&auth_token=${getItem("authToken")}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`Request failed with code ${response.status} and text ${response.statusText}`);
            }
            saveItem("QueryName", query_name);
            removeItem("QueryData");
            updateQueryDocument("NULL");

            updateQueryStep(QueryStep.ConfirmationOfSubmission);
        } else if (clickedButton.value === "previous-step") {
            updateQueryStep(QueryStep.FilterCanMessages);
        }
    };

    useEffect(() => {
        // Register this step's submit handler with the parent
        setHandleSubmit(handleSubmit);
    }, []);

    return (
        <div>
            <CardHeader className='center-align'>
                <h1 className='query-selector'>Filter Messages</h1>
            </CardHeader>

            <CardBody className='d-flex flex-column gap-3'>
                <Row className='gy-3'>
                    {/* Event Details */}
                    <Col xs={12} md={6}>
                        <Card className='h-100'>
                            <h2>Event Details</h2>
                            <CardBody>
                                <Row className='gy-2'>
                                    {query_event.event_name && (
                                        <Col xs={12}>
                                            <Label className='text-white-50 d-block'>Event name</Label>
                                            <span className='d-block white'>{query_event.event_name}</span>
                                        </Col>
                                    )}
                                    {query_event.event_location && (
                                        <Col xs={12}>
                                            <Label className='text-white-50 d-block'>Location</Label>
                                            <span className='d-block white'>{query_event.event_location}</span>
                                        </Col>
                                    )}
                                    <Col xs={12}>
                                        <Label className='text-white-50 d-block'>
                                            {isSingleDay ? "Date" : "Start date"}
                                        </Label>
                                        <span className='d-block white'>
                                            {formatDate(query_event.event_start_date) ?? "—"}
                                        </span>
                                    </Col>
                                    {!isSingleDay && (
                                        <Col xs={12}>
                                            <small className='text-white-50 d-block'>End date</small>
                                            <span className='d-block white'>
                                                {formatDate(query_event.event_end_date) ?? "—"}
                                            </span>
                                        </Col>
                                    )}
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>

                    {/* Selected Candidates */}
                    <Col xs={12} md={6}>
                        <Card className='h-100'>
                            <h2>CAN Messages</h2>
                            <CardBody>
                                <Row className='gy-2'>
                                    {query_data.can_name.length > 0 ? (
                                        query_data.can_name.map((name: string) => (
                                            <Col xs={12} key={name}>
                                                <p className='d-block white'>{name}</p>
                                            </Col>
                                        ))
                                    ) : (
                                        <Col xs={12}>
                                            <span className='text-white-50 fst-italic'>No CAN messages selected</span>
                                        </Col>
                                    )}
                                </Row>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </CardBody>
        </div>
    );
};

export default ConfirmQuery;
