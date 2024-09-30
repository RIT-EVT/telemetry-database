import { Form, FormGroup, Label, Input, Button } from "reactstrap";
import { useEffect, useState } from "react";

import "./ContextForm.css";

//list of bike for drop down
import BikeList from "./jsonFiles/BikeList.json";
//list of all id values to pass to backend
import ContextJSON from "./jsonFiles/ContextForm.json";
//all elements to have as input field and their properties
import ContextJSONFormElements from "./jsonFiles/FormElementFormat.json";

//url to call to
const BASE_URL = "http://127.0.0.1:5000";

function ContextForm({ getExistingContext }) {
  //initialize all id values
  const [contextId, setContextId] = useState(null);

  const [eventId, setEventID] = useState(null);
  // const [bikeConfigId, setBikeConfigId] = useState(null);

  const [bmsConfigSelect, setBMSConfigSelect] = useState(null);
  const [imuConfigSelect, setIMUConfigSelect] = useState(null);
  const [tmuConfigSelect, setTMUConfigSelect] = useState(null);
  const [tmsConfigSelect, setTMSConfigSelect] = useState(null);
  const [pvcConfigSelect, setPVCConfigSelect] = useState(null);
  const [mcConfigSelect, setMCConfigSelect] = useState(null);

  //initialize all form elements
  const [mainContextForm, UpdateContext] = useState(null);

  const [eventContextForm, UpdateEventForm] = useState(null);
  const [bikeContextForm, UpdateBikeForm] = useState(null);

  const [bmsConfigForm, UpdateBMSForm] = useState(null);
  const [tmsConfigForm, UpdateTMSForm] = useState(null);
  const [imuConfigForm, UpdateIMUForm] = useState(null);
  const [tmuConfigForm, UpdateTMUForm] = useState(null);
  const [pvcConfigForm, UpdatePVCForm] = useState(null);
  const [mcConfigForm, UpdateMCForm] = useState(null);

  const [bmsConfigDropDown, UpdateBMSConfigDropDown] = useState(null);
  const [tmsConfigDropDown, UpdateTMSConfigDropDown] = useState(null);
  const [imuConfigDropDown, UpdateIMUConfigDropDown] = useState(null);
  const [tmuConfigDropDown, UpdateTMUConfigDropDown] = useState(null);
  const [pvcConfigDropDown, UpdatePVCConfigDropDown] = useState(null);
  const [mcConfigDropDown, UpdateMCConfigDropDown] = useState(null);

  const ConfigName = [
    "BmsConfig",
    "ImuConfig",
    "TmuConfig",
    "TmsConfig",
    "PvcConfig",
    "McConfig",
  ];

  const HandleBMSForm = (event) => {
    setBMSConfigSelect(event.target.value);
  };
  const HandleTMSForm = (event) => {
    setTMSConfigSelect(event.target.value);
  };
  const HandleIMUForm = (event) => {
    setIMUConfigSelect(event.target.value);
  };
  const HandleTMUForm = (event) => {
    setTMUConfigSelect(event.target.value);
  };
  const HandlePVCForm = (event) => {
    setPVCConfigSelect(event.target.value);
  };
  const HandleMCForm = (event) => {
    setMCConfigSelect(event.target.value);
  };

  const ConfigNameToUpdate = {
    bmsConfig: HandleBMSForm,
    tmsConfig: HandleTMSForm,
    imuConfig: HandleIMUForm,
    tmuConfig: HandleTMUForm,
    pvcConfig: HandlePVCForm,
    mcConfig: HandleMCForm,
  };
  //todo fix this later. this is a shit solution for required
  const RequiredSelects = {
    bmsConfig: true,
    tmsConfig: false,
    imuConfig: false,
    tmuConfig: true,
    pvcConfig: true,
    mcConfig: true,
  };
  //does not work yet
  //tables do not contain a name column
  //TODO update config tables to include a name
  //fetch names of config files to display for user to choose from
  const FetchConfigOptions = () => {
    fetch(BASE_URL + "/Context/Configs")
      .then((response) => {
        if (!response.ok) {
          console.error("Did you turn your server on?");
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        throw new Error(
          "Error has occurred while fetching config data " + error.error
        );
      });
  };

  //create needed from fields from json file
  //return the form group
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
                  required={formElement["required"] === "true"}
                  readOnly={formElement["readOnly"] === "true"}
                >
                  {formElement["type"] === "select"
                    ? BikeList.TotalList.map((bikeName) => (
                        <option key={bikeName} value={bikeName}>
                          {bikeName}
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

  //Create the drop down for each config
  const SelectCreator = (data, name) => {
    console.log(name);
    return (
      <Input
        type="select"
        onChange={ConfigNameToUpdate[name]}
        placeholder="Select a config"
        required={RequiredSelects[name]}
      >
        <option value="" disabled selected hidden>
          Select an option
        </option>

        {data.map((configNameValue) => {
          return <option value={configNameValue}>{configNameValue}</option>;
        })}
        <option value="Custom">Custom</option>
      </Input>
    );
  };

  //toggle if the IMU and TMU fields show in the form
  //based off the bike name

  useEffect(() => {
    UpdateContext(GenerateFormElement("MainBody"));

    UpdateBikeForm(GenerateFormElement("BikeConfig"));
    UpdateEventForm(GenerateFormElement("Event"));
  }, []);

  useEffect(() => {
    //TODO replace the temp data
    //establish drop downs for each config
    UpdateBMSConfigDropDown(SelectCreator(["test"], "bmsConfig"));
    UpdateTMSConfigDropDown(SelectCreator(["test"], "tmsConfig"));
    UpdateIMUConfigDropDown(SelectCreator(["test"], "imuConfig"));
    UpdateTMUConfigDropDown(SelectCreator(["test"], "tmuConfig"));
    UpdatePVCConfigDropDown(SelectCreator(["test"], "pvcConfig"));
    UpdateMCConfigDropDown(SelectCreator(["test"], "mcConfig"));
  }, []);

  //fetch any data from context file
  if (getExistingContext) {
    fetch(BASE_URL + "/Context") // By default, fetch uses GET method
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
    //Get the context here context here
  }
  //TODO Fix padding issue. When bms is created, all the gird elements become long
  //TODO also fix overflow problem on the input fields
  //TODO Also keep the select field when it displays
  useEffect(() => {
    if (bmsConfigSelect === "Custom") {
      UpdateBMSForm(GenerateFormElement("BmsConfig"));
    } else {
      UpdateBMSForm(null);
    }
  }, [bmsConfigSelect]);

  useEffect(() => {
    if (tmsConfigSelect === "Custom") {
      UpdateTMSForm(GenerateFormElement("TmsConfig"));
    } else {
      UpdateTMSForm(null);
    }
  }, [tmsConfigSelect]);

  useEffect(() => {
    if (imuConfigSelect === "Custom") {
      UpdateIMUForm(GenerateFormElement("ImuConfig"));
    } else {
      UpdateIMUForm(null);
    }
  }, [imuConfigSelect]);

  useEffect(() => {
    if (tmuConfigSelect === "Custom") {
      UpdateTMUForm(GenerateFormElement("TmuConfig"));
    } else {
      UpdateTMUForm(null);
    }
  }, [tmuConfigSelect]);

  useEffect(() => {
    if (pvcConfigSelect === "Custom") {
      UpdatePVCForm(GenerateFormElement("PvcConfig"));
    } else {
      UpdatePVCForm(null);
    }
  }, [pvcConfigSelect]);

  useEffect(() => {
    if (mcConfigSelect === "Custom") {
      UpdateMCForm(GenerateFormElement("McConfig"));
    } else {
      UpdateMCForm(null);
    }
  }, [mcConfigSelect]);

  const SubmitData = (action) => {
    action.preventDefault();
    //gather all the data
    const collectedData = {
      Context: {
        MainBody: {},
        Event: {},
        BikeConfig: {},
        BmsConfig: {},
        ImuConfig: {},
        TmuConfig: {},
        TmsConfig: {},
        PvcConfig: {},
        McConfig: {},
      },
    };
    // Loop through each key in Context and collect data
    for (const key in ContextJSON.Context) {
      ContextJSON.Context[key].forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
          collectedData.Context[key][id] = element.value; // Collect the value from the form element
        }
      });
    }
    console.log("It's data time!");
    fetch(BASE_URL + "/Context", {
      //post data to the server
      method: "POST",
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
  };

  //display the final result
  return (
    <Form
      className="ContextForm"
      name="Context"
      onSubmit={(e) => {
        SubmitData(e);
      }}
    >
      <div className="container">
        <div className="left-panel">
          <h3 className="panel-header">Main Context</h3>
          <div className="panel-content">{mainContextForm}</div>
        </div>
        <div className="right-panel">
          <div className="top-right-panel">
            <h3 className="panel-header">Event Context</h3>
            <div className="panel-content">{eventContextForm}</div>
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
        <div className="grid-item">
          <h3 className="grid-header">
            BMS Configuration: {bmsConfigDropDown}
          </h3>
          {bmsConfigForm}
        </div>
        <div className="grid-item">
          <h3 className="grid-header">
            TMS Configuration: {tmsConfigDropDown}
          </h3>
          {tmsConfigForm}
        </div>
        <div className="grid-item">
          <h3 className="grid-header">
            IMU Configuration: {imuConfigDropDown}
          </h3>
          {imuConfigForm}
        </div>
        <div className="grid-item">
          <h3 className="grid-header">
            TMU Configuration: {tmuConfigDropDown}
          </h3>
          {tmuConfigForm}
        </div>
        <div className="grid-item">
          <h3 className="grid-header">
            PVC Configuration: {pvcConfigDropDown}
          </h3>
          {pvcConfigForm}
        </div>
        <div className="grid-item">
          <h3 className="grid-header">MC Configuration: {mcConfigDropDown}</h3>
          {mcConfigForm}
        </div>
      </div>

      <Button className="submitButton">Submit</Button>
    </Form>
  );
}

export default ContextForm;
