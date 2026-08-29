/**
 * Create form elements for each of the needed context forms
 *
 * Submit data entered by user to the backend server
 *
 * Forward user to data upload page with context id
 */

import { Form, Button, Card, Col, Row, CardTitle, CardBody, Container } from "reactstrap";

import "./ContextForm.css";

import { useEffect, useState, useCallback, useMemo } from "react";

import ContextJSONIdValues from "./JsonFiles/ContextForm.json";
import { useNavigate, useLocation } from "react-router-dom";
import DynamicForm from "./DynamicForm";
import SelectCreator from "./SelectorCreator";

import { BuildURI } from "../Utils/ServerUtils.ts";
import { saveItem, getItem, removeItem } from "Utils/SessionStorageLoader.ts";
import { Props } from "DefaultDataTypes.ts";
import { BoardNames, ConfigTypes, BikeConifg, BoardConfig, ConfigStorage } from "./ContextDataTypes.tsx";

/**
 * Create needed context forms. Return the configured elements
 *
 * @return {HTMLFormElement} Form element for all the needed fields
 */
function ContextForm(props: Props) {
    const [MainContextForm, SetContextForm] = useState<React.ReactElement | null>(null);
    const [EventContextForm, SetEventForm] = useState<React.ReactElement | null>(null);
    const [BikeContextForm, SetBikeForm] = useState<React.ReactElement | null>(null);
    const [BikeSelect, SetBikeSelect] = useState<React.ReactElement | null>(null);

    const [EventData, SetEventData] = useState(null);

    // Each config form object
    const [ConfigForm, SetFormElements] = useState<Record<BoardNames, React.ReactElement | null>>({
        bms: null,
        imu: null,
        tmu: null,
        tms: null,
        pvc: null,
        mc: null,
    });
    // Each dropdown object created in runtime with saved names and a field for custom
    const [DropDowns, SetDropDowns] = useState({
        bms: null,
        imu: null,
        tmu: null,
        tms: null,
        pvc: null,
        mc: null,
    });
    // Current selected value of each dropdown
    const [ConfigSelectedValue, SetConfigSelectedValue] = useState<Record<ConfigTypes, string>>({
        bms: "",
        imu: "",
        tmu: "",
        tms: "",
        pvc: "",
        mc: "",
        bike: "",
    });
    // Values passed from back end
    const [DropDownOptions, SetDropdownOptions] = useState<ConfigStorage>({
        bms: [],
        imu: [],
        tmu: [],
        tms: [],
        pvc: [],
        mc: [],
        bike: [],
    });

    const BoardNames: BoardNames[] = ["bms", "imu", "tmu", "tms", "pvc", "mc"];

    /**
     * All possible config types
     */
    const ConfigNames: ConfigTypes[] = [...BoardNames, "bike"];
    let navigate = useNavigate();
    let location = useLocation();

    /**
     * When a select field for the config forms updates,
     * pass the new value here to update the useState hook
     * and rerender effected components
     *
     * @param {string} configName - Name of config to update
     * @param {string} value - New value of select field
     */
    function UpdateSavedConfigSelectedValues(configName: string, value: string) {
        // Update the state of the new conifg. Mutates the state rather than creating a new state
        SetConfigSelectedValue((prev) => ({ ...prev, [configName]: value }));
    }

    /**
     * Whenever the select field on a config form changes
     * check if it is Custom. If it is, display form elements.
     * Else, set form object to null
     *
     * @param {string} configName - name of config being updated
     * @param {formElement.event} newConfigName - event that occurred to the select element
     */
    const HandleConfigFormChange = async (configName: ConfigTypes, newConfigName: string): Promise<void> => {
        if (newConfigName === "Custom") {
            const formElement = DynamicForm(`${configName}Config`);
            if (configName === "bike") {
                SetBikeForm(formElement);
            } else {
                SetFormElements((prev) => ({
                    ...prev,
                    [configName]: formElement,
                }));
            }
        } else if (newConfigName !== "") {
            // New configuration data selected by the user
            const targetConfig = DropDownOptions[configName].find((savedNames) => savedNames.name === newConfigName);

            if (!targetConfig) return;

            // Generate the new form and pass in values to assign
            const formElement = DynamicForm(`${configName}Config`, targetConfig);
            // If the saved name is a bike, we also need to fill in all the board configs
            if (configName === "bike") {
                const bikeConfig = targetConfig as BikeConifg;
                const pairs = Object.entries(bikeConfig.savedConfigs);

                pairs.forEach(([key, value]) => {
                    if (!key || !value) return;
                    if (key in DropDowns) {
                        UpdateSavedConfigSelectedValues(key as ConfigTypes, value);
                    }
                });

                SetBikeForm(formElement);
            } else {
                SetFormElements((prev) => ({
                    ...prev,
                    [configName]: formElement,
                }));
            }
        }
    };

    /**
     * Get all the saved configs from the backend
     */
    const SetConfigData = async (): Promise<void> => {
        try {
            const response = await fetch(BuildURI("config_data") + "/" + props.authToken, {
                method: "GET",
            });

            if (!response.ok) {
                console.error("Network response was not ok: " + response.statusText);
            }

            const data = await response.json();

            if (data && "data" in data && "config_data" in data["data"]) {
                console.log(data.data.config_data);
                SetDropdownOptions(data.data.config_data as ConfigStorage);
            }
        } catch (e) {
            console.error(e);
        }
    };

    /**
     * Post the saved conifg data to the backend
     */
    async function PostConfigData(configData: Record<ConfigTypes, BoardConfig | BikeConifg>) {
        const formData = new FormData();
        formData.append("configData", JSON.stringify(configData));
        await fetch(BuildURI("config_data") + "/" + props.authToken, {
            method: "POST",
            body: formData, // Convert object to JSON string
        });
    }

    /**
     * Check a new saved name against previous saved names for that board.
     * This avoids multiple configs being saved under the same name
     *
     * @param {string} savedName - name to check for
     * @param {string} boardName - board to check for a duplicate of
     *
     * @return {bool} if there is a duplicate
     */
    function CheckSavedName(savedName: string, boardName: BoardNames) {
        return DropDownOptions[boardName].some((config) => config.name === savedName);
    }

    /**
     * Once all needed fields have been filled out,
     * collect and send data to the backend as a json
     * object.
     *
     * @param {Event} event - event of form submit
     */
    function SubmitData(event: React.FormEvent<HTMLFormElement>) {
        // Prevent the form from clearing data
        event.preventDefault();

        //Save this data and pass it to the next step
        //Save the data in session storage in case user loses wifi/refreshes page
        //saveItem("BikeData", collectedData);

        //if there is any data saved in a new config send it to the backend
        //PostConfigData(newConfigItems);

        navigate("/data-upload");
    }

    /**
     * Auto complete the data field
     */
    function AutoFillData() {
        const date = new Date();
        const offset = date.getTimezoneOffset();
        const local = new Date(date.getTime() - offset * 60 * 1000);

        const configIDs = ContextJSONIdValues.event.run.context;
        const eventIDs = ContextJSONIdValues.event;

        (document.getElementById(eventIDs.name) as HTMLInputElement).value = "TEST";
        (document.getElementById(eventIDs.date) as HTMLInputElement).value = date.toISOString().slice(0, 10);
        (document.getElementById(eventIDs.type) as HTMLInputElement).value = "TEST";
        (document.getElementById(eventIDs.location) as HTMLInputElement).value = "TEST";

        (document.getElementById(configIDs.airTemp) as HTMLInputElement).value = "0";
        (document.getElementById(configIDs.humidity) as HTMLInputElement).value = "0";
        (document.getElementById(configIDs.airTemp) as HTMLInputElement).value = "0";
        (document.getElementById(configIDs.windSpeed) as HTMLInputElement).value = "0";
        (document.getElementById(configIDs.windDirection) as HTMLInputElement).value = "0";
        (document.getElementById(configIDs.riderFeedback) as HTMLInputElement).value = "TEST";
        (document.getElementById(configIDs.riderName) as HTMLInputElement).value = "TEST";
        (document.getElementById(configIDs.riderWeight) as HTMLInputElement).value = "0";
        (document.getElementById(configIDs.distanceCovered) as HTMLInputElement).value = "0";
        (document.getElementById(configIDs.startTime) as HTMLInputElement).value = local.toISOString().slice(0, 16);

        (document.getElementById("bikeSelect") as HTMLInputElement).value = "TEST_BIKE";
        UpdateSavedConfigSelectedValues("bike", "TEST_BIKE");
    }

    /**
     * Create all form elements for the main, bike, and event
     * sections and create dropdowns for the config fields
     * Hook on update to dropdown values
     */
    useEffect(() => {
        SetContextForm(DynamicForm("mainBody"));
        SetEventForm(DynamicForm("event", EventData ? EventData : null));
    }, [EventData]);

    useEffect(() => {
        ConfigNames.forEach((name) => {
            const dropDown = SelectCreator(
                DropDownOptions[name],
                name,
                UpdateSavedConfigSelectedValues,
                ConfigSelectedValue[name],
            );

            if (name === "bike") {
                SetBikeSelect(dropDown);
            } else if (BikeContextForm) {
                SetDropDowns((prev) => ({ ...prev, [name]: dropDown }));
            }
        });
    }, [DropDownOptions, BikeContextForm]);

    useEffect(() => {
        const pairs = Object.entries(ConfigSelectedValue) as [ConfigTypes, string][];
        pairs.forEach(([config, selectedValue]) => {
            if (selectedValue.toLowerCase() === "custom") {
                const formElement = DynamicForm(`${config}Config`);
                if (config === "bike") {
                    SetBikeForm(formElement);
                } else {
                    SetFormElements((prev) => ({
                        ...prev,
                        [config]: formElement,
                    }));
                }
            } else if (selectedValue) {
                // New configuration data selected by the user
                const targetConfig = DropDownOptions[config].find((config) => config.name === selectedValue);

                if (!targetConfig) return;

                // Generate the new form and pass in values to assign
                const formElement = DynamicForm(`${config}Config`, targetConfig);
                // If the saved name is a bike, we also need to fill in all the board configs
                if (config === "bike") {
                    const bikeConfig = targetConfig as BikeConifg;
                    const pairs = Object.entries(bikeConfig.savedConfigs);

                    pairs.forEach(([key, value]) => {
                        if (!key || !value) return;
                        if (key in DropDowns) {
                            UpdateSavedConfigSelectedValues(key as ConfigTypes, value);
                        }
                    });

                    SetBikeForm(formElement);
                } else {
                    SetFormElements((prev) => ({
                        ...prev,
                        [config]: formElement,
                    }));
                }
            }
        });
    }, [ConfigSelectedValue]);

    /**
     * Fetch all the saved configs on the first render
     * and check if this is a new run.
     */
    useEffect(() => {
        SetConfigData();

        if (location.pathname === "/new-run") {
            let eventData;

            if ((eventData = getItem("EventData")) !== null) {
                SetEventData(eventData);
            } else {
                console.error("Data for event was unsaved");
            }
        } else {
            //ensure no data leaks from past runs if this is a new context
            removeItem("EventData");
        }
    }, []);

    return (
        <Form className='ContextForm' name='Context' id='MainForm' onSubmit={(e) => SubmitData(e)}>
            <Container fluid className='main-container'>
                {/* === MAIN + EVENT + BIKE CONTEXT === */}
                <Row className='g-3 align-items-stretch'>
                    {/* Left Panel */}
                    <Col md='6' className='d-flex'>
                        <Card className='panel-content fill'>
                            <CardTitle tag='h2' className='panel-header'>
                                Main Context
                            </CardTitle>
                            <CardBody>{MainContextForm}</CardBody>
                        </Card>
                    </Col>

                    {/* Right Panels */}
                    <Col md='6' className='d-flex flex-column gap-3'>
                        <Card className='panel-content fill'>
                            <CardTitle tag='h2' className='panel-header'>
                                Event Context
                            </CardTitle>
                            <CardBody>{EventContextForm}</CardBody>
                        </Card>

                        <Card className='panel-content fill'>
                            <CardTitle tag='h2' className='panel-header'>
                                Bike Context: {BikeSelect}
                            </CardTitle>
                            <CardBody>{BikeContextForm}</CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* === CONFIGURATION GRID === */}
                {BikeContextForm && (
                    <Container fluid className='grid-container mt-4 spacing'>
                        {/* Loop over all configs. Group them in columns of 2. Render them to screen */}
                        {ConfigNames.filter((name: string) => name !== "bike")
                            .reduce<BoardNames[][]>((rows: BoardNames[][], value, i) => {
                                if (i % 2 === 0)
                                    rows.push([value as BoardNames]); // start a new pair
                                else rows[rows.length - 1]?.push(value as BoardNames); // append to last pair
                                return rows;
                            }, [])
                            .map((pair: BoardNames[], rowIndex) => (
                                // Loop over each board pair and create their row.
                                <Row key={rowIndex} className='g-3 mb-3'>
                                    {/** Now loop over each board and create their col display*/}
                                    {pair.map((name, colIndex) => (
                                        <Col md='6' key={colIndex} className='d-flex'>
                                            <Card className='grid-item fill flex-grow-1'>
                                                <CardTitle className='grid-header'>
                                                    {name.toUpperCase()} Configuration: {DropDowns[name]}
                                                </CardTitle>
                                                <CardBody>{ConfigForm[name]}</CardBody>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            ))}
                    </Container>
                )}
            </Container>

            <Button className='submitButton'>Submit {EventData ? "Run" : ""}</Button>
            <Button onClick={AutoFillData} className='autoFill'>
                Auto Complete
            </Button>
        </Form>
    );
}

export default ContextForm;
