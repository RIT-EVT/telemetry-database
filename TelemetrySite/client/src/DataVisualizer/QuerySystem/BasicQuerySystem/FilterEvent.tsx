import { useEffect, useState } from "react";
import {
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    FormGroup,
    Label,
    Input,
    Row,
    Col,
    Container,
} from "reactstrap";

import { ArrowRight, CheckCircle } from "react-feather";

import { BuildURI } from "Utils/ServerUtils.ts";
import QueryResponse from "./QueryResponseModal/QueryResponse";

import { ResponseData, QueryStep, QueryFunctions } from "./BasicQueryDataTypes";

const BasicOptions = ["Date", "Date Range", "Event Name", "Event Location"];

const FilterEvent = ({ updateQueryStep, updateQueryDocument, setHandleSubmit, currentDocId }: QueryFunctions) => {
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

    const queryName = "";

    // Update the drop down showing
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const toggleModal = () => setResponseData(null);

    // Update the selected element
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

    // Update the value of the fields on user change
    const handleChange = (key: string, value: string) => {
        setFormValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    };
    //#region Data Transmission

    // Form submitting
    const handleSubmit = (e: React.FormEvent) => {
        console.log("testing");
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

    // Get the events filtered out by the query
    const testQuery = async (payload: Record<string, string>) => {
        const response = await fetch(
            `${BuildURI("event_filter")}?mode=test-query&doc_id=${currentDocId}&auth_token=${sessionStorage.getItem("authToken")}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            },
        );
        if (response.ok) {
            const data = await response.json();

            setResponseData(data);
        } else {
            console.error(`An error occurred in testQuery. Fetch request returned with code ${response.status}`);
        }
    };

    // Move on to next stage
    const nextStage = async (payload: Record<string, string>) => {
        try {
            const response = await fetch(
                `${BuildURI("event_filter")}?mode=save-event-query&doc_id=${currentDocId}&auth_token=${sessionStorage.getItem("authToken")}`,
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

            updateQueryDocument(data.document_id);
            updateQueryStep(QueryStep.FilterCanMessages);
        } catch (err) {
            console.error("Submit error:", err);
        }
    };

    // Format data for sending
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

    //#endregion

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
                switch (option) {
                    case "Date":
                        return (
                            <FormGroup key={option} className='mt-3'>
                                <Label for='date'>
                                    <h2 className='basic-query-title'>Date</h2>
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

                    case "Date Range":
                        return (
                            <FormGroup key={option} className='mt-3'>
                                <Row className='vertical-align'>
                                    <Col md='5' xs='12'>
                                        <Label for='start-date'>
                                            <h2 className='basic-query-title'>Date Range</h2>
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

                                    <Col
                                        md='2'
                                        xs='12'
                                        className='text-center d-flex align-items-end justify-content-center'
                                    >
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

                    case "Event Name":
                        return (
                            <FormGroup key={option} className='mt-3'>
                                <Label for='event-name'>
                                    <h2 className='basic-query-title'>Event Name</h2>
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
                    case "Event Location":
                        return (
                            <FormGroup key={option} className='mt-3'>
                                <Label for='event-location'>
                                    <h2 className='basic-query-title'>Event Location</h2>{" "}
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

                    default:
                        return <FormGroup></FormGroup>;
                }
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

    setHandleSubmit(handleSubmit);

    return (
        <>
            {/* Dropdown for field selection*/}

            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                <DropdownToggle caret>Select Query Options</DropdownToggle>
                <DropdownMenu>
                    {BasicOptions.map((option) => (
                        <DropdownItem key={option} toggle={false} onClick={() => toggleOption(option)}>
                            <Input type='checkbox' checked={selectedOptions.includes(option)} readOnly className='me-2' />
                            {option}
                        </DropdownItem>
                    ))}
                </DropdownMenu>
            </Dropdown>

            {/* Input fields */}
            {dataFields}

            <Container className='top-padding '>
                <Row xs='1'>
                    <Col className='px-0'>
                        <button
                            disabled={selectedOptions.length === 0}
                            value='test-query'
                            type='submit'
                            className='enter-button test-query d-flex align-items-center gap-2'
                        >
                            <CheckCircle size={18} />
                            Test Query
                        </button>
                    </Col>
                </Row>
            </Container>
            <QueryResponse toggleModal={toggleModal} response={response} />
        </>
    );
};

export default FilterEvent;
