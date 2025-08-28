/**
 * Create form elements for each of the needed context forms
 *
 * Submit data entered by user to the backend server
 *
 * Forward user to data upload page with context id
 */

import {
  Form,
  FormGroup,
  Input,
  Button,
  Card,
  Col,
  Row,
  CardTitle,
  CardBody,
  Container,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import React, { useEffect, useState } from "react";

import ContextJSONIdValues from "./JsonFiles/ContextForm.json";
import ContextJSONFormElements from "./JsonFiles/FormElementFormat.json";
import { useNavigate, useLocation } from "react-router-dom";

import "./ContextForm.css";

import { BuildURI } from "Utils/ServerUtils.jsx";

/**
 * Create needed context forms. Return the configured elements
 *
 * @return {HTMLFormElement} Form element for all the needed fields
 */
function ContextForm() {
  /* -------------------------------------------------------------------------- */
  /* -------------------------- Establish State Hooks ------------------------- */
  /* -------------------------------------------------------------------------- */
  const [mainContextForm, UpdateContext] = useState("");

  const [eventContextForm, UpdateEventForm] = useState(null);
  const [bikeContextForm, UpdateBikeForm] = useState(null);
  const [bikeSelect, UpdateBikeSelect] = useState(null);

  const [eventData, setEventData] = useState(null);

  // Each config form object
  const [configForm, setFormElements] = useState({
    bms: null,
    imu: null,
    tmu: null,
    tms: null,
    pvc: null,
    mc: null,
  });
  // Each dropdown object created in runtime with saved names and a field for custom
  const [dropDowns, setDropDowns] = useState({
    bms: null,
    imu: null,
    tmu: null,
    tms: null,
    pvc: null,
    mc: null,
  });
  // Current selected value of each dropdown
  const [configSelectedValue, setConfigSelectedValue] = useState({
    bms: null,
    imu: null,
    tmu: null,
    tms: null,
    pvc: null,
    mc: null,
    bike: null,
  });
  // Values passed from back end
  const [dropDownOptions, setDropdownOptions] = useState({
    bms: [],
    imu: [],
    tmu: [],
    tms: [],
    pvc: [],
    mc: [],
    bike: [],
  });

  /* -------------------------------------------------------------------------- */
  /* --------------------------- Initialize Constants ------------------------- */
  /* -------------------------------------------------------------------------- */

  /**
   * All possible config types
   */
  let ConfigName = ["bms", "imu", "tmu", "tms", "pvc", "mc", "bike"];

  // Which config selects are optional
  let RequiredSelects = {
    bms: true,
    tms: true,
    imu: false,
    tmu: false,
    pvc: true,
    mc: true,
    bike: true,
  };

  let FormId = "ContextForm";

  let navigate = useNavigate();
  let location = useLocation();
  /* -------------------------------------------------------------------------- */
  /* ----------------------------- Const Functions ---------------------------- */
  /* -------------------------------------------------------------------------- */

  /**
   * When a select field for the config forms updates,
   * pass the new value here to update the useState hook
   * and rerender effected components
   *
   * @param {string} configName - Name of config to update
   * @param {string} value - New value of select field
   */
  const handleConfigSelectChange = (configName, value) => {
    // Update the state of the new conifg. Mutates the state rather than creating a new state
    setConfigSelectedValue((prev) => ({ ...prev, [configName]: value }));
  };

  /**
   * Whenever the select field on a config form changes
   * check if it is Custom. If it is, display form elements.
   * Else, set form object to null
   *
   * @param {formElement.event} event - event that occurred to the select element
   * @param {string} configName - name of config being updated
   * @param {boolean} bikeLoaded - if the change is coming from the bike
   */
  const handleConfigFormChange = async (
    event,
    configName,
    bikeLoaded = false
  ) => {
    // Get the config that has been changed
    const newConfigName = bikeLoaded ? event : event.target.value;
    handleConfigSelectChange(configName, newConfigName);

    if (newConfigName === "Custom") {
      const formElement = GenerateFormElement(`${configName}Config`);
      if (configName === "bike") {
        UpdateBikeForm(formElement);
      } else {
        setFormElements((prev) => ({ ...prev, [configName]: formElement }));
      }
    } else if (newConfigName !== "") {
      const targetConfig = dropDownOptions[configName].find(
        (obj) => obj[configName + "SavedName"] === newConfigName
      );

      const formElement = GenerateFormElement(
        `${configName}Config`,
        targetConfig
      );

      if (configName === "bike") {
        for (const configEntry of Object.entries(targetConfig)) {
          // configEntry is an array in the form [key, data]
          const configKey = configEntry[0];
          const configValue = configEntry[1];
          if (configKey in dropDowns) {
            setConfigSelectedValue((prev) => ({
              ...prev,
              [configKey]: configValue,
            }));
            handleConfigFormChange(configValue, configKey, true);
          }
        }

        UpdateBikeForm(formElement);
      } else {
        setFormElements((prev) => ({ ...prev, [configName]: formElement }));
      }
    }
  };

  /**
   * Create a form group based off of the json key passed in.
   * Loop through all elements in the json object and create that
   * many input and label objects.
   *
   * @param {string} jsonValue - Key for the element in the FormElementFormat.json file
   * @param {json} optionalSetData - Predefined data for config inputs
   * @return {HTMLFormElement} Form group of all the input elements on the json file
   */
  const GenerateFormElement = (jsonValue, optionalSetData) => {
    // Loop through every json element for the current field and
    // Create a new reactstrap input element for it

    return (
      <FormGroup>
        {Object.values(ContextJSONFormElements[jsonValue]).map(
          (formElement) => {
            const idValue = formElement["id"];
            return (
              <InputGroup key={idValue} className='FormGroupElement'>
                <InputGroupText>{formElement["label"]}</InputGroupText>
                <Input
                  id={idValue}
                  type={formElement["type"]}
                  placeholder={formElement["placeHolder"]}
                  required={formElement["required"]}
                  readOnly={
                    formElement["readOnly"] || optionalSetData ? true : false
                  }
                  className='formInput'
                  value={optionalSetData ? optionalSetData[idValue] : undefined}
                >
                  {formElement["type"] === "select"
                    ? formElement["selectValues"].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))
                    : null}
                </Input>
              </InputGroup>
            );
          }
        )}
      </FormGroup>
    );
  };

  /**
   * Get all the saved configs from the backend
   */
  const GetConfigData = async () => {
    try {
      const response = await fetch(
        BuildURI("config_data") + "/" + sessionStorage.getItem("authToken"),
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        console.error("Network response was not ok: " + response.statusText);
      }
      const data = await response.json();

      return data;
    } catch (e) {
      console.error(e);
    }

    return null;
  };

  /**
   * Post the saved conifg data to the backend
   */
  const PostConfigData = async (configData) => {
    const formData = new FormData();
    formData.append("configData", configData);
    await fetch(
      BuildURI("config_data") + "/" + sessionStorage.getItem("authToken"),
      {
        method: "POST",
        body: formData, // Convert object to JSON string
      }
    );
  };

  /**
   * Create the select dropdowns for the config forms
   * on change check if value is Custom
   * if it is then display the normal form
   *
   * @param {string} displayValues - Options to display in select
   * @param {string} name - Name of config form
   * @return {HTMLInputElement} - HTML Select Input
   */
  const SelectCreator = (displayValues, name) => {
    return (
      <Input
        type='select'
        onChange={(e) => handleConfigFormChange(e, name)}
        placeholder='Select a config'
        required={RequiredSelects[name]}
        className='ConfigDropdown'
        id={`${name}Select`}
        defaultValue={
          configSelectedValue[name] !== null ? configSelectedValue[name] : ""
        }
        disabled={name !== "bike" && configSelectedValue["bike"] !== "Custom"}
      >
        <option value='' disabled hidden>
          Select an option
        </option>
        {displayValues.map((configNameValue) => {
          let savedName = configNameValue[name + "SavedName"];
          return (
            <option key={savedName} value={savedName}>
              {savedName}
            </option>
          );
        })}
        <option value='Custom'>Custom</option>
      </Input>
    );
  };

  /**
   * Once all needed fields have been filled out,
   * collect and send data to the backend as a json
   * object.
   *
   * @param {Event} event - event of form submit
   */
  const SubmitData = (event) => {
    // Prevent the form from clearing data
    event.preventDefault();

    const contextValues = ContextJSONIdValues.event.runs[0].context;

    // Save bike config id values
    const bikeConfig = contextValues.bikeConfig;

    // Gather all the data inputted by the user and save it to be passed to the backend.
    // All hard coded values are required to exists as fields in the form and will therefore
    // will never throw an error but may have the value of null if they are not required to be filled out
    const collectedData = {
      event: {
        name: document.getElementById(ContextJSONIdValues.event.name).value,
        date: document.getElementById(ContextJSONIdValues.event.date).value,
        type: document.getElementById(ContextJSONIdValues.event.type).value,
        location: document.getElementById(ContextJSONIdValues.event.location)
          .value,
        runs: [
          {
            //this number may be updated by the backend if this is not the first run
            orderNumber: 0,
            context: {
              bikeConfig: {
                platformName: document.getElementById(bikeConfig.platformName)
                  .value,
                tirePressure: document.getElementById(bikeConfig.tirePressure)
                  .value,
                coolantVolume: document.getElementById(bikeConfig.coolantVolume)
                  .value,
                bikeSavedName: document.getElementById(bikeConfig.bikeSavedName)
                  .value,
                firmwareConfig: {},

                hardwareConfig: {},
              },
              riderName: document.getElementById(contextValues.riderName).value,
              riderWeight: document.getElementById(contextValues.riderWeight)
                .value,
              humidity: document.getElementById(contextValues.humidity).value,
              airTemp: document.getElementById(contextValues.airTemp).value,
              windSpeed: document.getElementById(contextValues.windSpeed).value,
              windDirection: document.getElementById(
                contextValues.windDirection
              ).value,
              riderFeedback: document.getElementById(
                contextValues.riderFeedback
              ).value,
              distanceCovered: document.getElementById(
                contextValues.distanceCovered
              ).value,
              startTime: document.getElementById(contextValues.startTime).value,
            },
          },
        ],
      },
    };

    const newConfigItems = {
      bms: {},
      imu: {},
      tmu: {},
      tms: {},
      pvc: {},
      mc: {},
      bike: {},
    };

    // Save input from user about the firmware configuration
    const firmwareConfig = contextValues.bikeConfig.firmwareConfig;

    /**
     * Check a new saved name against previous saved names for that board.
     * This avoids multiple configs being saved under the same name
     *
     * @param {string} savedName - name to check for
     * @param {string} boardName - board to check for a duplicate of
     *
     * @return {bool} if there is a duplicate
     */
    const CheckSavedName = (savedName, boardName) => {
      return dropDownOptions[boardName].some(
        (config) => config[boardName + "SavedName"] === savedName
      );
    };
    /**
     * An array of saved names used when saving a new bike config
     */
    const configSavedNames = {};
    //Loop through all the board configs in the config file
    for (const firmwareConfigPart in firmwareConfig) {
      const firmwareConfigDataToSave = {};
      const savedNameObject = document.getElementById(
        firmwareConfigPart.toLowerCase() + "SavedName"
      );

      var saveConfigData = false;
      if (savedNameObject !== null) {
        const savedName = savedNameObject.value;
        // Save the config name in case the user wants to make a new bike config
        configSavedNames[firmwareConfigPart.toLowerCase()] = savedName;

        //Check if the config part is custom
        if (
          configSelectedValue[firmwareConfigPart.toLowerCase()] === "Custom"
        ) {
          // If it is custom make sure it is not a duplicate saved name

          if (
            savedName === null ||
            CheckSavedName(savedName, firmwareConfigPart.toLowerCase())
          ) {
            //Stop the data submission if it is a duplicate
            alert("Duplicate custom name " + savedName);
            return;
          } else {
            saveConfigData = true;
          }
        }
      }
      for (const firmwareId in firmwareConfig[firmwareConfigPart]) {
        //get the field from the web page to ensure it exists before you get the value
        const partId = firmwareConfig[firmwareConfigPart][firmwareId];
        const formInputField = document.getElementById(partId);

        if (formInputField != null) {
          // Save the to be passed to the backend
          firmwareConfigDataToSave[partId] = formInputField.value;
          if (saveConfigData) {
            newConfigItems[firmwareConfigPart.toLowerCase()][partId] =
              formInputField.value;
          }
        }
      }
      // Declare the board name to be saved
      collectedData.event.runs[0].context.bikeConfig.firmwareConfig[
        firmwareConfigPart
      ] = firmwareConfigDataToSave;
    }

    // Save a new bike config with a name and all the needed data
    // Check that the saved name of the bike doesn't already exist
    if (configSelectedValue["bike"] === "Custom") {
      // saved name already in collectedData
      const bikeSavedName =
        collectedData.event.runs[0].context.bikeConfig.bikeSavedName;
      if (bikeSavedName !== null && CheckSavedName(bikeSavedName, "bike")) {
        alert("Duplicate custom name " + bikeSavedName);
        return;
      } else {
        configSavedNames["bikeSavedName"] = bikeSavedName;
        newConfigItems["bike"] = configSavedNames;
      }
    }
    //Save this data and pass it to the next step
    //Save the data in session storage in case user loses wifi/refreshes page
    sessionStorage.setItem("BikeData", JSON.stringify(collectedData));

    //if there is any data saved in a new config send it to the backend
    if (
      Object.values(newConfigItems).some((item) => Object.keys(item).length > 0)
    ) {
      PostConfigData(JSON.stringify(newConfigItems));
    }
    navigate("/data-upload");
  };

  /**
   * Called to initialize Main Body and Event
   * form elements.
   */
  const InitializeForms = () => {
    UpdateContext(GenerateFormElement("mainBody"));
    UpdateEventForm(GenerateFormElement("event", eventData ? eventData : null));
  };

  /**
   * Auto complete the data field
   */
  const AutoFillData = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60 * 1000);

    const configIDs = ContextJSONIdValues.event.runs[0].context;
    const eventIDs = ContextJSONIdValues.event;

    document.getElementById(eventIDs.name).value = "TEST";
    document.getElementById(eventIDs.date).value = date
      .toISOString()
      .slice(0, 10);
    document.getElementById(eventIDs.type).value = "TEST";
    document.getElementById(eventIDs.location).value = "TEST";

    document.getElementById(configIDs.airTemp).value = 0;
    document.getElementById(configIDs.humidity).value = 0;
    document.getElementById(configIDs.airTemp).value = 0;
    document.getElementById(configIDs.windSpeed).value = 0;
    document.getElementById(configIDs.windDirection).value = 0;
    document.getElementById(configIDs.riderFeedback).value = "TEST";
    document.getElementById(configIDs.riderName).value = "TEST";
    document.getElementById(configIDs.riderWeight).value = 0;
    document.getElementById(configIDs.distanceCovered).value = 0;
    document.getElementById(configIDs.startTime).value = local
      .toISOString()
      .slice(0, 16);

    document.getElementById("bikeSelect").value = "TEST_BIKE";
    handleConfigFormChange("TEST_BIKE", "bike", true);
  };

  /* -------------------------------------------------------------------------- */
  /* ----------------------- Establish Use Effect Hooks ----------------------- */
  /* -------------------------------------------------------------------------- */

  /**
   * Create all form elements for the main, bike, and event
   * sections and create dropdowns for the config fields
   * Hook on update to dropdown values
   */
  useEffect(() => {
    // Create each select value
    ConfigName.forEach((name) => {
      const dropDown = SelectCreator(dropDownOptions[name], name);
      if (name === "bike") {
        UpdateBikeSelect(dropDown);
      } else if (bikeContextForm) {
        // don't create the board selects till the bike dropdown is selected
        setDropDowns((prev) => ({ ...prev, [name]: dropDown }));
      }
    });

    InitializeForms();
  }, [dropDownOptions, eventData, bikeContextForm]);
  /**
   * Fetch all the saved configs on the first load
   * and check if this is a new run
   */
  useEffect(() => {
    GetConfigData().then((response) => {
      if (response && "data" in response && "config_data" in response["data"]) {
        setDropdownOptions(response.data.config_data);
      }
    });

    if (location.pathname === "/new-run") {
      var eventData;

      if (
        (eventData = JSON.parse(sessionStorage.getItem("EventData"))) !== null
      ) {
        setEventData(eventData);
      } else {
        console.error("Data for event was unsaved");
      }
    } else {
      //ensure no data leaks from past runs
      sessionStorage.removeItem("EventData");
    }
  }, [location.pathname]);

  /* -------------------------------------------------------------------------- */
  /* ---------------------------- Return Final Form --------------------------- */
  /* -------------------------------------------------------------------------- */

  return (
    <Form
      className='ContextForm'
      name='Context'
      id={FormId}
      onSubmit={(e) => {
        SubmitData(e);
      }}
    >
      <Container className='container'>
        {/* Left Panel */}
        <Col className='left-panel'>
          <Card className='panel-content '>
            <CardTitle className='panel-header'>Main Context</CardTitle>
            <CardBody>{mainContextForm}</CardBody>
          </Card>
        </Col>

        {/* Right Panels */}
        <Col className='right-panel'>
          <Row>
            <Col className='top-right-panel'>
              <Card className='panel-content'>
                <CardTitle className='panel-header'>Event Context</CardTitle>
                <CardBody>{eventContextForm}</CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col className='bottom-right-panel'>
              <Card className='panel-content'>
                <CardTitle className='panel-header'>
                  Bike Context: {bikeSelect}
                </CardTitle>
                <CardBody>{bikeContextForm}</CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Container>
      <Container className='grid-container'>
        {bikeContextForm
          ? ConfigName.map((name) => {
              if (name === "bike") {
                return;
              }
              return (
                <Card className='grid-item'>
                  <CardTitle className='grid-header'>
                    {/*
                     *Create each element of the grid. Initially each has the name
                     *of the config and a dropdown. Dropdown is populated by past
                     *configs of the same type that have been saved. Allow user to also
                     *create a new one with the option to save it with a name
                     */}
                    {name.toLocaleUpperCase()} Configuration: {dropDowns[name]}
                  </CardTitle>
                  <CardBody>{configForm[name]}</CardBody>
                </Card>
              );
            })
          : null}
      </Container>

      {/*
       * Submitting data is handled in the
       * SubmitData() const function
       */}
      <Button className='submitButton'>
        Submit {eventData != null ? "Run" : null}
      </Button>
      <Button onClick={AutoFillData} className='autoFill'>
        Auto Complete
      </Button>
    </Form>
  );
}

export default ContextForm;
