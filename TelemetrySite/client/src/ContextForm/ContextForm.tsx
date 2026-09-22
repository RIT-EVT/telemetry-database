/**
 * Create form elements for each of the needed context forms
 *
 * Submit data entered by user to the backend server
 *
 * Forward user to data upload page with context id
 */

import { Form, Button, Card, Col, Row, CardTitle, CardBody, Container } from "reactstrap";

import "./ContextForm.css";

import { useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import DynamicForm, { CreateInitialFormValues } from "./DynamicForm";
import SelectCreator from "./SelectorCreator";

import { BuildURI } from "../Utils/ServerUtils.ts";
import { saveItem, getItem, removeItem } from "Utils/SessionStorageLoader.ts";
import { Props } from "DefaultDataTypes.ts";
import {
    BoardNames,
    FormFields,
    FormDataFields,
    ConfigTypes,
    BikeConfig,
    BoardConfig,
    ConfigStorage,
    CUSTOM_OPTION,
} from "./ContextDataTypes.tsx";

/** Every board, in the order they are displayed */
const BOARD_NAMES: BoardNames[] = ["bms", "imu", "tmu", "tms", "pvc", "mc"];

/**
 * All possible config types
 */
const CONFIG_NAMES: ConfigTypes[] = [...BOARD_NAMES, "bike"];

/** Boards are displayed in rows of this many columns */
const BOARDS_PER_ROW = 2;

/** Route the user is on when adding another run to an existing event */
const NEW_RUN_PATH = "/new-run";

/** Saved bike config the Auto Complete button selects (if it exists) */
const AUTOFILL_BIKE_NAME = "test";

/** No saved configs yet */
const EMPTY_CONFIG_STORAGE: ConfigStorage = {
    bms: [],
    imu: [],
    tmu: [],
    tms: [],
    pvc: [],
    mc: [],
    bike: [],
};

/** Nothing selected in any config dropdown yet */
const EMPTY_SELECTED_VALUES: Record<ConfigTypes, string> = {
    bms: "",
    imu: "",
    tmu: "",
    tms: "",
    pvc: "",
    mc: "",
    bike: "",
};

/**
 * Group a list into rows of a set size. The last row holds whatever is left over.
 *
 * @param {T[]} items - List to group
 * @param {number} size - Max number of items per row
 * @return {T[][]} The rows
 */
function ChunkItems<T>(items: T[], size: number): T[][] {
    const rows: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        rows.push(items.slice(i, i + size));
    }
    return rows;
}

/**
 * Create needed context forms. Return the configured elements
 *
 * @return {HTMLFormElement} Form element for all the needed fields
 */
function ContextForm(props: Props) {
    let navigate = useNavigate();
    let location = useLocation();

    // Event data carried over from the previous run. Only set when this is a new run of an existing event
    const [EventData] = useState<FormDataFields | null>(() =>
        location.pathname === NEW_RUN_PATH ? (getItem("EventData") as FormDataFields | null) : null,
    );

    // Current selected value of each config dropdown
    const [ConfigSelectedValue, SetConfigSelectedValue] = useState<Record<ConfigTypes, string>>(EMPTY_SELECTED_VALUES);

    // Current saved configs used previously
    const [DropDownOptions, SetDropdownOptions] = useState<ConfigStorage>(EMPTY_CONFIG_STORAGE);

    // Current value of every input in every form, keyed by form and then by input label
    const [FormDataUpdate, setFormData] = useState<Partial<Record<FormFields, FormDataFields>>>(() => ({
        main: CreateInitialFormValues("main"),
        event: CreateInitialFormValues("event", EventData),
    }));

    const [NameCollisionError, setNameCollisionError] = useState<string | null>(null);

    /**
     * Find a saved config by name
     *
     * @param {ConfigTypes} configName - Type of config to look in
     * @param {string} savedName - Name the config was saved under
     * @return {BoardConfig | BikeConfig | null} The saved config, null if there is none (i.e. Custom)
     */
    const FindSavedConfig = (configName: ConfigTypes, savedName: string): BoardConfig | BikeConfig | null =>
        (DropDownOptions[configName] as Array<BoardConfig | BikeConfig>).find((config) => config.name === savedName) ?? null;

    /**
     * A form is locked when its data comes from a saved config rather than being typed in
     *
     * @param {ConfigTypes} configName - Config form to check
     * @return {boolean} If the selected value is a saved config
     */
    const IsSavedConfig = (configName: ConfigTypes): boolean =>
        FindSavedConfig(configName, ConfigSelectedValue[configName]) !== null;

    /**
     * When a select field for the config forms updates,
     * pass the new value here to update the useState hook
     * and rerender effected components
     *
     * @param {ConfigTypes} configName - Name of config to update
     * @param {string} value - New value of select field
     */
    const UpdateSavedConfigSelectedValues = (configName: ConfigTypes, value: string): void => {
        // Update the state of the new conifg
        SetConfigSelectedValue((prev) => ({ ...prev, [configName]: value }));

        // Target config could be null here. This is handled by CreateInitialFormValues
        const targetConfig = FindSavedConfig(configName, value);
        setFormData((prev) => ({ ...prev, [configName]: CreateInitialFormValues(configName, targetConfig) }));

        if (configName === "bike" && targetConfig) {
            // Loop over each saved conifg and update the value
            const savedConfigs = (targetConfig as BikeConfig).savedConfigs ?? {};
            for (const [board, config] of Object.entries(savedConfigs)) {
                UpdateSavedConfigSelectedValues(board as ConfigTypes, config);
            }
        }
    };

    /**
     * Save the new value of a single input
     *
     * @param {FormFields} formName - Form the input is in
     * @param {string} fieldName - Label of the input
     * @param {string | Date | number | boolean} value - New value of the input
     */
    const UpdateSavedValue = (formName: FormFields, fieldName: string, value: string | Date | number | boolean) => {
        // Always build off the latest state, the form only calls this with what changed
        setFormData((prev) => ({ ...prev, [formName]: { ...prev[formName], [fieldName]: value } }));
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
                return;
            }

            const data = await response.json();

            if (data && "data" in data && "config_data" in data["data"]) {
                // Anything the backend leaves out stays an empty list
                SetDropdownOptions({ ...EMPTY_CONFIG_STORAGE, ...(data.data.config_data as Partial<ConfigStorage>) });
            }
        } catch (e) {
            console.error(e);
        }
    };

    /**
     * Post the saved conifg data to the backend
     */
    async function PostConfigData(configData: Record<ConfigTypes, BoardConfig | BikeConfig>) {
        const formData = new FormData();
        // Convert object to JSON string
        formData.append("configData", JSON.stringify(configData));
        await fetch(BuildURI("config_data") + "/" + props.authToken, {
            method: "POST",
            body: formData,
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
    function CheckSavedName(savedName: string, configName: ConfigTypes): boolean {
        return DropDownOptions[configName]?.some((config) => config.name === savedName) ?? false;
    }

    /**
     * Look at every config the user is saving under a new name (i.e. currently
     * set to Custom with a name typed in) and check it against previously saved
     * names for that same config type.
     *
     * @return {ConfigTypes[]} Config types whose new name collides with an existing saved config
     */
    function FindNameCollisions(): ConfigTypes[] {
        debugger;

        return CONFIG_NAMES.filter((name) => {
            const isNewConfig = ConfigSelectedValue[name] === CUSTOM_OPTION;
            const newName = FormDataUpdate[name]?.name as string | undefined;
            return isNewConfig && !!newName && CheckSavedName(newName, name);
        });
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

        // Don't let a new config silently overwrite/collide with an existing saved one
        const collisions = FindNameCollisions();
        debugger;
        if (collisions.length > 0) {
            setNameCollisionError(
                `The following config name(s) are already in use, please choose different names: ${collisions
                    .map((name) => name.toUpperCase())
                    .join(", ")}`,
            );
            return;
        }
        setNameCollisionError(null);

        const dataFormatted = {
            event: {
                ...FormDataUpdate["event"],
                run: {
                    orderNumber: 0,
                    context: {
                        bikeConfig: {
                            ...FormDataUpdate["bike"],
                            firmwareConfig: {
                                bms: { ...FormDataUpdate["bms"] },
                                imu: { ...FormDataUpdate["imu"] },
                                tmu: { ...FormDataUpdate["tmu"] },
                                tms: { ...FormDataUpdate["tms"] },
                                pvc: { ...FormDataUpdate["pvc"] },
                                mc: { ...FormDataUpdate["mc"] },
                            },
                        },
                        ...FormDataUpdate["main"],
                    },
                },
            },
        };

        //Save this data and pass it to the next step
        //Save the data in session storage in case user loses wifi/refreshes page
        saveItem("BikeData", dataFormatted);

        //if there is any data saved in a new config send it to the backend
        //PostConfigData(newConfigItems);

        navigate("/data-upload");
    }

    /**
     * Auto complete the data field
     */
    function AutoFillData() {
        // Local time, not UTC. toISOString always prints UTC, so shift the date by the timezone offset first
        const date = new Date();
        const offset = date.getTimezoneOffset();
        const local = new Date(date.getTime() - offset * 60 * 1000);
        const localISO = local.toISOString();

        const new_main_data: FormDataFields = {
            airTemp: "0",
            humidity: "0",
            windSpeed: "0",
            windAngle: "0",
            riderFeedback: "TEST",
            riderName: "TEST",
            riderWeight: "0",
            distanceCovered: "0",
            startTime: localISO.slice(0, 16),
        };

        const new_event_data: FormDataFields = {
            eventName: "TEST",
            eventDate: localISO.slice(0, 10),
            eventType: "TEST",
            location: "TEST",
        };

        setFormData((prev) => ({
            ...prev,
            main: CreateInitialFormValues("main", new_main_data),
            // The event of a new run was carried over from the last one, don't overwrite it with test data
            ...(EventData ? {} : { event: CreateInitialFormValues("event", new_event_data) }),
        }));

        // Fall back to a hand filled bike if the test config was never saved
        UpdateSavedConfigSelectedValues(
            "bike",
            FindSavedConfig("bike", AUTOFILL_BIKE_NAME) ? AUTOFILL_BIKE_NAME : CUSTOM_OPTION,
        );
    }

    /**
     * Fetch all the saved configs on the first render
     * and check if this is a new run.
     */
    useEffect(() => {
        SetConfigData();

        if (location.pathname === NEW_RUN_PATH) {
            if (EventData === null) {
                console.error("Data for event was unsaved");
            }
        } else {
            //ensure no data leaks from past runs if this is a new context
            removeItem("EventData");
        }
    }, []);

    /**
     * Create the dropdown for a config field
     *
     * @param {ConfigTypes} name - Config to create the dropdown for
     */
    const RenderSelect = (name: ConfigTypes) => (
        <SelectCreator
            displayValues={DropDownOptions[name]}
            name={name}
            onChange={UpdateSavedConfigSelectedValues}
            configSelectedValue={ConfigSelectedValue[name]}
            // If bike has a selected value, lock all others
            lockNonBike={ConfigSelectedValue["bike"] !== CUSTOM_OPTION}
        />
    );

    /**
     * Create the input elements for a form
     *
     * @param {FormFields} name - Form to create the inputs for
     * @param {boolean} readOnly - Lock every input in the form
     */
    const RenderForm = (name: FormFields, readOnly: boolean = false) => (
        <DynamicForm formName={name} values={FormDataUpdate[name]} onChange={UpdateSavedValue} readOnly={readOnly} />
    );

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
                            <CardBody>{RenderForm("main")}</CardBody>
                        </Card>
                    </Col>

                    {/* Right Panels */}
                    <Col md='6' className='d-flex flex-column gap-3'>
                        <Card className='panel-content fill'>
                            <CardTitle tag='h2' className='panel-header'>
                                Event Context
                            </CardTitle>
                            <CardBody>{RenderForm("event", EventData !== null)}</CardBody>
                        </Card>

                        <Card className='panel-content fill'>
                            <CardTitle tag='h2' className='panel-header'>
                                Bike Context: {RenderSelect("bike")}
                            </CardTitle>
                            <CardBody>
                                {ConfigSelectedValue["bike"] !== "" && RenderForm("bike", IsSavedConfig("bike"))}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* === CONFIGURATION GRID === */}
                {ConfigSelectedValue["bike"] !== "" && (
                    <Container fluid className='grid-container mt-4 spacing'>
                        {/* Loop over all configs. Group them in columns of 2. Render them to screen */}
                        {ChunkItems(
                            CONFIG_NAMES.filter((name): name is BoardNames => name !== "bike"),
                            BOARDS_PER_ROW,
                        ).map((pair: BoardNames[], rowIndex) => (
                            // Loop over each board pair and create their row.
                            <Row key={rowIndex} className='g-3 mb-3'>
                                {/** Now loop over each board and create their col display*/}
                                {pair.map((name) => (
                                    <Col md='6' key={name} className='d-flex'>
                                        <Card className='grid-item fill flex-grow-1'>
                                            <CardTitle className='grid-header'>
                                                {name.toUpperCase()} Configuration: {RenderSelect(name)}
                                            </CardTitle>
                                            <CardBody>
                                                {ConfigSelectedValue[name] !== "" && RenderForm(name, IsSavedConfig(name))}
                                            </CardBody>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ))}
                    </Container>
                )}
            </Container>
            {NameCollisionError && <div className='text-danger mt-2 mb-2'>{NameCollisionError}</div>}

            <Button className='submitButton'>Submit {EventData ? "Run" : ""}</Button>
            <Button onClick={AutoFillData} className='autoFill'>
                Auto Complete
            </Button>
        </Form>
    );
}

export default ContextForm;
