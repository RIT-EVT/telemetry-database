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

import {
  FetchConfigData,
  PostContextData,
  FetchEventDataCall,
} from "ServerCall/ServerCall.jsx";

//list of all id values to pass to backend
import ContextJSONIdValues from "./jsonFiles/ContextForm.json";
//all elements to have as input field and their properties
import ContextJSONFormElements from "./jsonFiles/FormElementFormat.json";
import { useNavigate, useParams } from "react-router-dom";

import "./ContextForm.css";
/**
 * Create needed context forms. Return the configured elements
 *
 * @return {HTMLFormElement} Form element for all the needed fields
 */
function ContextForm() {
  /* -------------------------------------------------------------------------- */
  /* -------------------------- Establish State Hooks ------------------------- */
  /* -------------------------------------------------------------------------- */
  const [mainContextForm, UpdateContext] = useState(null);

  const [eventContextForm, UpdateEventForm] = useState(null);
  const [bikeContextForm, UpdateBikeForm] = useState(null);

  //each config form object
  const [configForm, setFormElements] = useState({
    bms: null,
    imu: null,
    tmu: null,
    tms: null,
    pvc: null,
    mc: null,
  });
  //each dropdown object
  const [dropDowns, setDropDowns] = useState({
    bike: null,
    bms: null,
    imu: null,
    tmu: null,
    tms: null,
    pvc: null,
    mc: null,
  });
  //current selected value of each dropdown
  const [configSelects, setConfigSelects] = useState({
    bms: null,
    imu: null,
    tmu: null,
    tms: null,
    pvc: null,
    mc: null,
  });
  //values passed from back end
  const [dropDownOptions, setDropdownOptions] = useState({
    bms: [],
    imu: [],
    tmu: [],
    tms: [],
    pvc: [],
    mc: [],
    bike: [],
  });

  const [bikeSelected, setBikeSelected] = useState(false);

  const { contextID } = useParams();

  const [eventData, setEventData] = useState(null);
  /* -------------------------------------------------------------------------- */
  /* --------------------------- Initialize Constants ------------------------- */
  /* -------------------------------------------------------------------------- */
  let ConfigName = ["bms", "imu", "tmu", "tms", "pvc", "mc"];

  //which config selects are optional
  let RequiredSelects = {
    bmsConfig: true,
    tmsConfig: true,
    imuConfig: false,
    tmuConfig: false,
    pvcConfig: true,
    mcConfig: true,
  };
  let FormId = "ContextForm";

  let navigate = useNavigate();
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
    setConfigSelects((prev) => ({ ...prev, [configName]: value }));
  };

  /**
   * Whenever the select field on a config form changes
   * check if it is Custom. If it is, display form elements.
   * Else, set form object to null
   *
   * @param {formElement.event} event - event that occurred to the select element
   * @param {string} configName - name of config being updated
   */
  const handleConfigFormChange = async (event, configName) => {
    const value = event.target.value;
    //handle the bike differently from the configs
    if (configName !== "bike") {
      handleConfigSelectChange(configName, value);
      if (value === "Custom") {
        const formElement = GenerateFormElement(`${configName}Config`);
        setFormElements((prev) => ({ ...prev, [configName]: formElement }));
      } else {
        setFormElements((prev) => ({ ...prev, [configName]: null }));
      }
    } else {
      if (value === "Custom") {
        UpdateBikeForm(GenerateFormElement("BikeConfig"));
        setBikeSelected(true);
      } else {
        UpdateBikeForm(null);
        setBikeSelected(false);
      }
    }
  };

  /**
   * Call to the python API. For each of the config
   * forms, get any saved configs that are in the DB.
   * Set them to the corresponding dropdown option
   */
  const FetchConfigOptions = () => {
    //tables do not contain a name column
    //fetch names of config files to display for user to choose from
    FetchConfigData().then((data) => {
      if (!data) {
        return;
      }
      setDropdownOptions(data);
    });
  };

  /**
   * Call to the backend to fetch event data
   * relating to a context id. Set eventData
   * to the date response.
   */
  const FetchEventData = () => {
    FetchEventDataCall(contextID).then((data) => {
      //convert date into js date form
      data.date = new Date(data.date).toISOString().slice(0, 10);

      setEventData(data);
    });
  };

  /**
   * Create a form group based off of the json key passed in.
   * Loop through all elements in the json object and create that
   * many input and label objects.
   *
   * @param {string} jsonValue - Key for the element in the FormElementFormat.json file
   * @return {HTMLFormElement} Form group of all the input elements on the json file
   */
  const GenerateFormElement = (jsonValue) => {
    //if the event has been loaded based on a past event file
    //load that data and use it to create a read only form
    if (eventData && jsonValue === "Event") {
      return (
        <FormGroup>
          <InputGroup key={"eventDate"} className='FormGroupElement'>
            <InputGroupText>Event Date</InputGroupText>
            <Input id='eventDate' type='date' readOnly value={eventData.date} />
          </InputGroup>
          <InputGroup key={"eventType"} className='FormGroupElement'>
            <InputGroupText>Event Type</InputGroupText>
            <Input
              id='eventType'
              type='text'
              readOnly
              value={eventData.eventType}
            />
          </InputGroup>
          <InputGroup key={"eventLocation"} className='FormGroupElement'>
            <InputGroupText>Event location</InputGroupText>
            <Input
              id='location'
              type='text'
              readOnly
              value={eventData.location}
            />
          </InputGroup>
        </FormGroup>
      );
    } else {
      //loop through every json element for the current field and
      //create a new reactstrap input element for it
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
                    readOnly={formElement["readOnly"]}
                    className='formInput'
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
    }
  };

  /**
   * Create the select dropdowns for the config forms
   * On change check if value is Custom
   * If it is then display the normal form
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
        defaultValue=''
      >
        <option value='' disabled hidden>
          Select an option
        </option>
        {displayValues.map((configNameValue) => (
          <option key={configNameValue} value={configNameValue}>
            {configNameValue}
          </option>
        ))}
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
    //prevent the form from clearing data
    event.preventDefault();

    //gather all the data
    const collectedData = {
      Context: {
        MainBody: {},
        Event: {},
        BikeConfig: {},
        bms: {},
        imu: {},
        tmu: {},
        tms: {},
        pvc: {},
        mc: {},
      },
    };
    var bikeIsCustom = false;
    var isADup = false;
    //get the needed json object
    const ConfigElements = ContextJSONIdValues.ConfigElements;
    if (document.getElementById("bikeSelect").value === "Custom") {
      bikeIsCustom = true;
      ConfigName.forEach((configName) => {
        //get the json object of ids
        const configIds = ConfigElements[configName + "Config"];

        //check if the selected element is custom
        if (document.getElementById(configName + "Select").value === "Custom") {
          configIds.forEach((id) => {
            //get the item and make sure it exists
            const element = document.getElementById(id);
            if (element) {
              collectedData.Context[configName][id] = element.value; // Collect the value from the form element
            }
          });

          const savedName = document.getElementById(
            configName + "SavedName"
          ).value;
          collectedData.Context[configName]["savedName"] = savedName;
          //check if the name is a duplicate
          isADup = dropDownOptions[configName].some(
            (configElement) => configElement === savedName
          );

          if (isADup) {
            console.error(`Duplicate save name detected in ${configName}`);
          }
        } else {
          collectedData.Context[configName]["selected"] =
            document.getElementById(configName + "Select").value;
        }
      });
    }
    //don't send any data if there was a duplicate
    if (isADup) {
      return;
    }
    //handle the main, bike, and event
    const MainElements = ContextJSONIdValues.MainElements;

    for (const key in MainElements) {
      //if the bike is custom, make sure saved name
      //isn't a duplicate name
      if (key === "BikeConfig" && bikeIsCustom) {
        if (
          dropDownOptions["bike"].some(
            (contextElement) =>
              contextElement === document.getElementById("bikeConfigName").value
          )
        ) {
          console.error(`Duplicate save name detected in bike config`);
          return;
        }
      }

      if (key === "Event" && eventData) {
        collectedData.Context.Event.eventID = eventData.id;
      } else if (key === "BikeConfig" && !bikeIsCustom) {
        //collect the config name and check for a duplicate
        const element = document.getElementById("bikeSelect").value;
        // Collect the value from the form element
        collectedData.Context[key]["selected"] = element;
      } else {
        MainElements[key].forEach((id) => {
          //get the item and make sure it exists

          const element = document.getElementById(id);
          if (element) {
            // Collect the value from the form element
            collectedData.Context[key][id] = element.value;
          }
        });
      }
    }

    PostContextData(collectedData).then((result) => {
      if (result["success"]) {
        document.getElementById(FormId).reset();
        //switch to new screen
        navigate("/DataUpload/" + result["contextID"]);
      } else {
        throw new Error("An error has occurred while submitting data");
      }
    });
  };

  /**
   * Called to initialize Main Body and Event
   * form elements.
   */
  const InitializeForms = () => {
    UpdateContext(GenerateFormElement("MainBody"));
    UpdateEventForm(GenerateFormElement("Event"));
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
    ConfigName.forEach((name) => {
      const dropDown = SelectCreator(dropDownOptions[name], name);
      setDropDowns((prev) => ({ ...prev, [name]: dropDown }));
    });

    const bikeDrop = SelectCreator(dropDownOptions["bike"], "bike");
    setDropDowns((prev) => ({ ...prev, ["bike"]: bikeDrop }));
    //call out to initialize Context and Event
    InitializeForms();
  }, [dropDownOptions, eventData]);
  /**
   * Fetch all the saved configs on the first load
   */
  useEffect(() => {
    //check if contextID exists and is a number
    //if it exists but isn't a number, redirect to
    //404 error page
    //TODO change when home page is included
    if (contextID) {
      if (isNaN(contextID)) {
        navigate("/404Page");
      } else {
        FetchEventData();
      }
    }
    FetchConfigOptions();
  }, []);
  /**
   * Check all config select value. If it is == Custom
   * generate the needed config page
   * else set to null
   *
   * Hook on configSelect change
   */
  useEffect(() => {
    ConfigName.forEach((configName) => {
      const configSelectValue = configSelects[configName]; // Access the corresponding value for the config

      if (configSelectValue === "Custom") {
        const formElement = GenerateFormElement(`${configName}Config`);
        setFormElements((prev) => ({ ...prev, [configName]: formElement }));
      } else {
        setFormElements((prev) => ({ ...prev, [configName]: null }));
      }
    });
  }, [configSelects]);

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
                  Bike Context: {dropDowns["bike"]}
                </CardTitle>
                <CardBody>{bikeContextForm}</CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Container>

      {bikeSelected ? (
        <Container className='grid-container'>
          {ConfigName.map((name) => {
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
          })}
        </Container>
      ) : null}
      {/*
       * Submitting data is handled in the
       * SubmitData() const function
       */}
      <Button className='submitButton'>Submit</Button>
    </Form>
  );
}

export default ContextForm;
