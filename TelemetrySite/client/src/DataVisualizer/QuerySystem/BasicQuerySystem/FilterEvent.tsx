import { useEffect, useState } from "react";
import {
    Card,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Form,
    FormGroup,
    Label,
    Input,
    Row,
    Col,
    Container,
    CardHeader,
} from "reactstrap";

import { ArrowRight } from "react-feather";

import { BuildURI } from "Utils/ServerUtils.ts";
import { QueryResponse } from "./QueryResponseModal/QueryResponse";

import { ResponseData, QueryStep, UpdateQueryStep } from "./BasicQueryDataTypes";

const BasicOptions = ["Date", "Date Range", "Event Name", "Event Location"];

const FilterEvent = ({ updateQueryStep }: UpdateQueryStep) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [response, setResponseData] = useState<ResponseData | null>(null);

    const [dataFields, setDataFields] = useState<React.ReactElement[]>([]);

    const [formValues, setFormValues] = useState({
        date: "",
        startDate: "",
        endDate: "",
        eventName: "",
        eventLocation: "",
    });

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const toggleModal = () => setResponseData(null);

    const toggleOption = (option: string) => {
        setSelectedOptions((prev: string[]) => {
            const isCurrentlySelected = prev.includes(option);

            if (!isCurrentlySelected) {
                if (option === "Date") {
                    // Filter out Date Range and include Date
                    return [...prev.filter((previousOption) => previousOption !== "Date Range"), "Date"];
                } else if (option === "Date Range") {
                    // Filter out Date and enable DateRange
                    return [...prev.filter((previousOption) => previousOption !== "Date"), "Date Range"];
                }

                return [...prev, option];
            }

            return prev.filter((o) => o !== option);
        });
    };

    const formatPayload = (): Record<string, string> => {
        // Format payload for backend
        const payload: Record<string, string> = {};

        if (selectedOptions.includes("Date")) {
            const start = new Date(formValues.date);

            const end = new Date(formValues.date);
            // Check the whole first day
            end.setDate(end.getDate() + 1);

            payload.dateRange = JSON.stringify({ start, end });
        }

        if (selectedOptions.includes("Date Range")) {
            const start = new Date(formValues.startDate);

            const end = new Date(formValues.endDate);
            // Inclusive search of last date
            end.setDate(end.getDate() + 1);

            payload.dateRange = JSON.stringify({ start, end });
        }

        if (selectedOptions.includes("Event Name")) {
            payload.eventName = formValues.eventName;
        }

        if (selectedOptions.includes("Event Location")) {
            payload.eventLocation = formValues.eventLocation;
        }

        return payload;
    };

    const handleChange = (key: string, value: string) => {
        setFormValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const testQuery = async (payload: Record<string, string>) => {
        const response = await fetch(`${BuildURI("event_filter")}/test-query/${sessionStorage.getItem("authToken")}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        if (response.ok) {
            const data = await response.json();

            setResponseData(data);
        } else {
            console.error(`An error occurred in testQuery. Fetch request returned with code ${response.status}`);
        }
    };

    const nextStage = async (payload: Record<string, string>) => {
        console.log("running");
        try {
            const response = await fetch(
                `${BuildURI("event_filter")}/save-event-query/${sessionStorage.getItem("authToken")}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                },
            );

            if (!response.ok) {
                throw new Error(`Request failed with code ${response.status} and text ${response.statusText}`);
            }

            const data = await response.json();
            updateQueryStep(QueryStep.FilterEvent);
        } catch (err) {
            console.error("Submit error:", err);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Get the button that caused the submit
        const clickedButton = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;

        const payload = formatPayload();

        if (clickedButton.value === "test-query") {
            testQuery(payload);
            return;
        } else if (clickedButton.value === "next-step") {
            nextStage(payload);
            return;
        }
    };

    useEffect(() => {
        const getCurrentDate = () => {
            const date = new Date();

            return `${date.getFullYear()}-${(date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1)}-${
                (date.getDay() < 9 ? "0" : "") + (date.getDay() + 1)
            }`;
        };
        let currentDate = getCurrentDate();

        // Updates the displayed inputs when the selections a new option
        setDataFields(
            selectedOptions.map((option) => {
                if (option === "Date") {
                    return (
                        <FormGroup key={option} className='mt-3'>
                            <h2 className='basic-query-title'>Date</h2>
                            <Label className='label' for='date'>
                                Date
                            </Label>
                            <Input
                                type='date'
                                id='date'
                                value={formValues.date}
                                onChange={(e) => handleChange("date", e.target.value)}
                                required
                                max={currentDate}
                            />
                        </FormGroup>
                    );
                }

                if (option === "Date Range") {
                    return (
                        <FormGroup key={option} className='mt-3'>
                            <h2 className='basic-query-title'>Date Range</h2>
                            <Row className='vertical-align'>
                                <Col md='5' xs='12'>
                                    <Label className='label' for='start-date'>
                                        Start Date
                                    </Label>
                                    <Input
                                        type='date'
                                        id='start-date'
                                        value={formValues.startDate}
                                        max={formValues.endDate || currentDate}
                                        onChange={(e) => handleChange("startDate", e.target.value)}
                                        required
                                    />
                                </Col>

                                <Col md='2' xs='12' className='text-center d-flex align-items-end justify-content-center'>
                                    <ArrowRight className='arrow' />
                                </Col>

                                <Col md='5' xs='12'>
                                    <Label className='label' for='end-date'>
                                        End Date
                                    </Label>
                                    <Input
                                        type='date'
                                        id='end-date'
                                        value={formValues.endDate}
                                        min={formValues.startDate || "2000-01-01"}
                                        max={currentDate}
                                        onChange={(e) => handleChange("endDate", e.target.value)}
                                        required
                                    />
                                </Col>
                            </Row>
                        </FormGroup>
                    );
                }

                if (option === "Event Name") {
                    return (
                        <FormGroup key={option} className='mt-3'>
                            <h2 className='basic-query-title'>Event Name</h2>
                            <Label className='label' for='event-name'>
                                Event Name
                            </Label>
                            <Input
                                type='text'
                                placeholder='Enter Name'
                                id='event-name'
                                value={formValues.eventName}
                                onChange={(e) => handleChange("eventName", e.target.value)}
                                required
                            />
                        </FormGroup>
                    );
                }

                if (option === "Event Location") {
                    return (
                        <FormGroup key={option} className='mt-3'>
                            <h2 className='basic-query-title'>Event Location</h2>
                            <Label className='label' for='event-location'>
                                Event Location
                            </Label>
                            <Input
                                type='text'
                                id='event-location'
                                placeholder='Enter Location'
                                value={formValues.eventLocation}
                                onChange={(e) => handleChange("eventLocation", e.target.value)}
                                required
                            />
                        </FormGroup>
                    );
                }

                return <FormGroup></FormGroup>;
            }),
        );
    }, [
        selectedOptions,
        formValues.eventLocation,
        formValues.startDate,
        formValues.endDate,
        formValues.date,
        formValues.eventName,
    ]);

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Card className='p-3'>
                    <CardHeader className='center-align'>
                        <h1 className='query-selector'>Basic Query Constructor</h1>
                    </CardHeader>

                    {/* Dropdown for field selection*/}

                    <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                        <DropdownToggle caret>Select Query Options</DropdownToggle>
                        <DropdownMenu>
                            {BasicOptions.map((option) => (
                                <DropdownItem key={option} toggle={false} onClick={() => toggleOption(option)}>
                                    <Input
                                        type='checkbox'
                                        checked={selectedOptions.includes(option)}
                                        readOnly
                                        className='me-2'
                                    />
                                    {option}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>

                    {/* Input fields */}
                    {dataFields}

                    <Container className='top-padding '>
                        <Row xs='2' className='vertical-align'>
                            <Col className='align-center'>
                                <button
                                    disabled={selectedOptions.length === 0}
                                    value='test-query'
                                    type='submit'
                                    className='enter-button test-query'
                                >
                                    Test Query
                                </button>
                            </Col>
                            <Col className='align-center'>
                                <button
                                    disabled={selectedOptions.length === 0}
                                    value='next-step'
                                    className='enter-button next-step'
                                >
                                    Next Step
                                </button>
                            </Col>
                        </Row>
                    </Container>
                </Card>
            </Form>
            <QueryResponse toggleModal={toggleModal} response={response} />
        </>
    );
};

export default FilterEvent;
