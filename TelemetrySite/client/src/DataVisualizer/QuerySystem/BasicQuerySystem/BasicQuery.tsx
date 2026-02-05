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
    Button,
    Container,
} from "reactstrap";
import { BuildURI } from "Utils/ServerUtils.ts";
import QueryResponse from "./QueryResponseModal/QueryResponse";

import "./BasicQuery.css";

const BasicOptions = ["Date", "Date Range", "Event Name", "Event Location"];

function BasicQuery() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [response, setResponseData] = useState<object>({});

    const [dataFields, setDataFields] = useState<React.ReactElement[]>([]);

    const [formValues, setFormValues] = useState({
        date: "",
        startDate: "",
        endDate: "",
        eventName: "",
        eventLocation: "",
    });

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const toggleModal = () => setResponseData({});

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

    const formatPayload = () => {
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

    const testQuery = async () => {
        const payload = formatPayload();

        const response = await fetch(BuildURI("basic_query") + "/" + sessionStorage.getItem("authToken") + "/test-query", {
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

    const saveQuery = async () => {};

    const handleSubmit = async () => {
        const payload = formatPayload();
        try {
            const response = await fetch(
                BuildURI("basic_query") + "/" + sessionStorage.getItem("authToken") + "/submit-query",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                },
            );

            if (!response.ok) {
                throw new Error("Request failed");
            }

            const data = await response.json();
            console.log("Backend response:", data);
        } catch (err) {
            console.error("Submit error:", err);
        }
    };

    useEffect(() => {
        const getCurrentDate = () => {
            const date = new Date();

            return `${date.getFullYear()}-${(date.getMonth() < 9 ? "0" : "") + (date.getMonth() + 1)}-${(date.getDay() < 9 ? "0" : "") + (date.getDay() + 1)}`;
        };
        let currentDate = getCurrentDate();

        // Updates the displayed inputs when the selections a new option
        setDataFields(
            selectedOptions.map((option) => {
                if (option === "Date") {
                    return (
                        <FormGroup key={option} className='mt-3'>
                            <Label className='basic-query-title'>Date</Label>
                            <Input
                                type='date'
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
                            <Label className='basic-query-title'>Date Range</Label>
                            <Row>
                                <Col md={6}>
                                    <Input
                                        type='date'
                                        value={formValues.startDate}
                                        max={formValues.endDate != "" ? formValues.endDate : currentDate}
                                        onChange={(e) => handleChange("startDate", e.target.value)}
                                        required
                                    />
                                </Col>
                                <Col md={6}>
                                    <Input
                                        type='date'
                                        value={formValues.endDate}
                                        onChange={(e) => handleChange("endDate", e.target.value)}
                                        min={formValues.startDate != "" ? formValues.startDate : "2000-1-1"}
                                        max={currentDate}
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
                            <Label className='basic-query-title'>Event Name</Label>
                            <Input
                                type='text'
                                placeholder='Enter Name'
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
                            <Label className='basic-query-title'>Event Location</Label>
                            <Input
                                type='text'
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
        formValues.startDate,
        formValues.eventName,
    ]);

    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Card className='p-3'>
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

                    {/* Inputs */}
                    {dataFields}

                    <Container className='top-padding'>
                        <Row xs='3'>
                            <Col className='align-center'>
                                <Button
                                    disabled={selectedOptions.length === 0}
                                    onClick={testQuery}
                                    color='primary'
                                    className='mt-3'
                                >
                                    Test Query
                                </Button>
                            </Col>
                            <Col className='align-center'>
                                <Button
                                    disabled={selectedOptions.length === 0}
                                    onClick={handleSubmit}
                                    color='primary'
                                    className='mt-3'
                                >
                                    Finalize Query
                                </Button>
                            </Col>
                            <Col className='align-center'>
                                <Button
                                    disabled={selectedOptions.length === 0}
                                    onClick={saveQuery}
                                    color='primary'
                                    className='mt-3'
                                    type='submit'
                                >
                                    Save Query
                                </Button>
                            </Col>
                        </Row>
                    </Container>
                </Card>
            </Form>
            <QueryResponse toggleModal={toggleModal} title={"Response"} response={response} />
        </>
    );
}

export default BasicQuery;
