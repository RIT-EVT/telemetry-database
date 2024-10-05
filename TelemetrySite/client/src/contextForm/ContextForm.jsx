/**
 * EHughes
 * 2024
 *
 * Create form elements for each of the needed context
 * forms
 *
 * Submit data entered by user to the backend
 * server
 */

import { Form, FormGroup, Label, Input, Button } from "reactstrap";
import { useEffect, useState } from "react";

import "./ContextForm.css";

//list of all id values to pass to backend
import ContextJSON from "./jsonFiles/ContextForm.json";
//all elements to have as input field and their properties
import ContextJSONFormElements from "./jsonFiles/FormElementFormat.json";

//url to call to
const BASE_URL = "http://127.0.0.1:5000";

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
  //value of each config checkbox
  const [checkBox, setCheckBox] = useState({
    bms: false,
    imu: false,
    tmu: false,
    tms: false,
    pvc: false,
    mc: false,
  });
  //values passed from back end
  const [dropDownOptions, setDropdownOptions] = useState({
    bms: [],
    imu: [],
    tmu: [],
    tms: [],
    pvc: [],
    mc: [],
  });

  /* -------------------------------------------------------------------------- */
  /* --------------------------- Initialize Constants ------------------------- */
  /* -------------------------------------------------------------------------- */
  let ConfigName = ["bms", "imu", "tmu", "tms", "pvc", "mc"];

  //which config selects are optional
  let RequiredSelects = {
    bmsConfig: true,
    tmsConfig: false,
    imuConfig: false,
    tmuConfig: true,
    pvcConfig: true,
    mcConfig: true,
  };

  /* -------------------------------------------------------------------------- */
  /* ----------------------------- Const Functions ---------------------------- */
  /* -------------------------------------------------------------------------- */

  /**
   * When a select field for the config forms updates
   * Call here and assign update the UseState hook to
   * the new value
   *
   * @param {string} configName - Name of config to update
   * @param {string} value - New value of select field
   */
  const handleConfigSelectChange = (configName, value) => {
    setConfigSelects((prev) => ({ ...prev, [configName]: value }));
  };

  /**
   * Whenever the select field on a config form changes
   * check if it is Custom. If its is display form elements.
   * Else set form object to null
   *
   * @param {Event} event - Event that occurred
   * @param {string} configName - Name of the config to update
   */
  const handleConfigFormChange = (event, configName) => {
    const value = event.target.value;
    handleConfigSelectChange(configName, value);
    if (value === "Custom") {
      const formElement = GenerateFormElement(`${configName}Config`);
      setFormElements((prev) => ({ ...prev, [configName]: formElement }));
    } else {
      setFormElements((prev) => ({ ...prev, [configName]: null }));
    }
  };

  /**
   * Handle the change of a check box for the
   * config config save toggle
   *
   * @param {string} value - new value of the checkbox
   * @param {string} configName - config form the value is from
   */
  const checkBoxChange = (value, configName) => {
    setCheckBox((prev) => ({ ...prev, [configName]: value }));
  };

  /**
   * Call to the python API. For each of the config
   * forms, get any saved configs that are in the DB.
   * Set them to the corresponding dropdown option
   */
  const FetchConfigOptions = () => {
    //does not work yet
    //tables do not contain a name column
    //fetch names of config files to display for user to choose from
    fetch(BASE_URL + "/Context")
      .then((response) => {
        if (!response.ok) {
          console.error("Did you turn your server on?");
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setDropdownOptions(data);
      })
      .catch((error) => {
        throw new Error(
          "Error has occurred while fetching config data " + error.error
        );
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
    return (
      <FormGroup>
        {Object.values(ContextJSONFormElements[jsonValue]).map(
          (formElement) => {
            const idValue = formElement["id"];

            return (
              <FormGroup key={idValue} className="FormGroupElement">
                <Label for={idValue}>{formElement["label"]} </Label>
                <Input
                  id={idValue}
                  type={formElement["type"]}
                  placeholder={formElement["placeHolder"]}
                  required={formElement["required"]}
                  readOnly={formElement["readOnly"]}
                >
                  {/*
                   * If the object is a select, it must contain a field called "selectValues"
                   * loop through each value and make it an option
                   */}
                  {formElement["type"] === "select"
                    ? formElement["selectValues"].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))
                    : null}
                </Input>
              </FormGroup>
            );
          }
        )}
      </FormGroup>
    );
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
        type="select"
        onChange={(e) => handleConfigFormChange(e, name)}
        placeholder="Select a config"
        required={RequiredSelects[name]}
        className="ConfigDropdown"
        id={`${name}Select`}
      >
        <option value="" disabled selected hidden>
          Select an option
        </option>
        {displayValues.map((configNameValue) => (
          <option key={configNameValue} value={configNameValue}>
            {configNameValue}
          </option>
        ))}
        <option value="Custom">Custom</option>
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

    //get the needed json object
    const ConfigElements = ContextJSON.ConfigElements;

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

        //if the box is checked save the name
        if (checkBox[configName]) {
          collectedData.Context[configName]["savedName"] =
            document.getElementById(configName + "SavedName").value;
        } else {
          collectedData.Context[configName]["savedName"] = "";
        }
      } else {
        collectedData.Context[configName]["selected"] = document.getElementById(
          configName + "Select"
        ).value;
      }
    });
    //handle the main, bike, and event
    const MainElements = ContextJSON.MainElements;

    for (const key in MainElements) {
      MainElements[key].forEach((id) => {
        //get the item and make sure it exists
        const element = document.getElementById(id);
        if (element) {
          collectedData.Context[key][id] = element.value; // Collect the value from the form element
        }
      });
    }

    fetch(BASE_URL + "/Context", {
      //post data to the server
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(collectedData), // Convert the data to JSON
    })
      .then((response) => {
        if (!response.ok) {
          console.error("Did you turn your server on?");
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data); // Handle the response
      })
      .catch((error) => {
        console.error("Error:", error); // Handle any errors
      });
    //document.getElementById("ContextForm").reset();
  };
  /**
   * Create a check box with label.
   * If the box is clicked -> Also display
   * a text input box to take a name input
   *
   * @param {string} name - Name of config form
   *
   * @return {HTMLDivElement} - Div containing a Label, Check Box, and a Text Input
   */
  const CreateCheckBox = (name) => {
    const checkBoxId = name + "CheckBox";

    if (configSelects[name] === "Custom") {
      return (
        <div>
          <Label for={checkBoxId}>Save preset</Label>
          <Input
            type="checkbox"
            id={checkBoxId}
            name={checkBoxId}
            checked={checkBox[name]}
            onChange={(e) => {
              checkBoxChange(e.target.checked, name);
            }}
          />
          {checkBox[name] && (
            <Input
              type="text"
              placeholder="Enter some text"
              id={name + "SavedName"}
              style={{ marginLeft: "10px" }} // Inline with the checkbox
              required
            />
          )}
        </div>
      );
    }
  };

  /* -------------------------------------------------------------------------- */
  /* ----------------------- Establish Use Effect Hooks ----------------------- */
  /* -------------------------------------------------------------------------- */

  /**
   * Create all form elements for the main, bike, and event
   * sections and create dropdowns for the config fields
   */

  useEffect(() => {
    //FetchConfigOptions();
    ConfigName.forEach((name) => {
      const dropDown = SelectCreator(dropDownOptions[name], name);
      setDropDowns((prev) => ({ ...prev, [name]: dropDown }));
    });

    UpdateContext(GenerateFormElement("MainBody"));
    UpdateBikeForm(GenerateFormElement("BikeConfig"));
    UpdateEventForm(GenerateFormElement("Event"));
  }, [dropDownOptions]);

  /**
   * Check all config select value. If it is == Custom
   * generate the needed config page
   * else set to null
   *
   * Run on configSelect change
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
      className="ContextForm"
      name="Context"
      id="ContextForm"
      onSubmit={(e) => {
        SubmitData(e);
      }}
    >
      <div className="container">
        <div className="left-panel">
          <div className="panel-content">
            <h3 className="panel-header">Main Context</h3>
            {mainContextForm}
          </div>
        </div>
        <div className="right-panel">
          <div className="top-right-panel">
            <div className="panel-content">
              <h3 className="panel-header">Event Context</h3>
              {eventContextForm}
            </div>
          </div>
          <div className="bottom-right-panel">
            <div className="panel-content">
              <h3 className="panel-header">Bike Context</h3>
              {bikeContextForm}
            </div>
          </div>
        </div>
      </div>

      <div className="grid-container">
        {ConfigName.map((name) => {
          return (
            <div className="grid-item">
              <h3 className="grid-header">
                {/*
                 *Create each element of the grid. Initially each has the name
                 *of the config and a dropdown. Dropdown is populated by past
                 *configs of the same type that have been saved. Allow user to also
                 *create a new one with the option to save it with a name
                 */}
                {name.toLocaleUpperCase()} Configuration: {dropDowns[name]}
              </h3>
              {configForm[name]}
              {CreateCheckBox(name)}
            </div>
          );
        })}
      </div>

      <Button className="submitButton">Submit</Button>
    </Form>
  );
}

export default ContextForm;
