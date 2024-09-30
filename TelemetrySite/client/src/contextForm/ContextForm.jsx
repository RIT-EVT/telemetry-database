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

  // const [bmsConfigId, setBMSConfig] = useState(null);
  // const [imuConfigId, setIMUConfig] = useState(null);
  // const [tmuConfigId, setTMUConfig] = useState(null);
  // const [tmsConfigId, setTMSConfig] = useState(null);
  // const [pvcConfigId, setPVCConfig] = useState(null);
  // const [mcConfigId, setMCConfig] = useState(null);

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

  //fetch id values
  //parse from json
  //no longer display the id values
  // useEffect(() => {
  //   fetch(BASE_URL + "/ID")
  //     .then((response) => response.json())
  //     .then((data) => {
  //       // set each value to its corresponding key in the data object
  //       console.log(data);
  //       setContextId(data.contextId);
  //       setEventID(data.eventId);
  //       setBikeConfigId(data.bikeId);
  //       setBMSConfig(data.bmsId);
  //       setIMUConfig(data.imuId);
  //       setTMUConfig(data.tmuId);
  //       setTMSConfig(data.tmsId);
  //       setPVCConfig(data.pvcId);
  //       setMCConfig(data.mcId);
  //     })
  //     .catch((error) => {
  //       //catch any error that could have ocurred
  //       console.error("Error fetching data:", error);
  //     });
  // }, []); // Empty dependency array ensures this runs only once when the component mounts

  //convert between an id name to an id value
  //key: id name, value: id variable
  // const idValueSearch = {
  //   id: contextId,

  //   eventId: eventId,
  //   bikeConfigId: bikeConfigId,

  //   bmsConfigId: bmsConfigId,
  //   tmuConfigId: tmuConfigId,
  //   imuConfigId: imuConfigId,
  //   tmsConfigId: tmsConfigId,
  //   pvcConfigId: pvcConfigId,
  //   mcConfigId: mcConfigId,
  // };

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

  //toggle if the IMU and TMU fields show in the form
  //based off the bike name

  useEffect(() => {
    UpdateContext(GenerateFormElement("MainBody"));

    UpdateBikeForm(GenerateFormElement("BikeConfig"));
    UpdateEventForm(GenerateFormElement("Event"));
    //Create a drop down for each config
    //all user to either select a previous config
    //or create their own
    // FetchConfigOptions();
    // UpdateBMSForm(GenerateFormElement("BmsConfig"));
    // UpdateIMUForm(GenerateFormElement("ImuConfig"));
    // UpdateTMUForm(GenerateFormElement("TmuConfig"));
    // UpdateTMSForm(GenerateFormElement("TmsConfig"));
    // UpdatePVCForm(GenerateFormElement("PvcConfig"));
    // UpdateMCForm(GenerateFormElement("McConfig"));
  }, []);

  //fetch any data from context file
  if (getExistingContext) {
    fetch(BASE_URL + "/Context") // By default, fetch uses GET method
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Error:", error));
    //Get the context here context here
  }

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
        <div className="left-panel">{mainContextForm}</div>
        <div className="right-panel">
          <div className="top-right-panel">{eventContextForm}</div>
          <div className="bottom-right-panel">{bikeContextForm}</div>
        </div>
      </div>
      <div className="grid-container">
        <div className="grid-item">{bmsConfigForm}</div>
        <div className="grid-item">{tmsConfigForm}</div>
        <div className="grid-item">{imuConfigForm}</div>
        <div className="grid-item">{tmuConfigForm}</div>
        <div className="grid-item">{pvcConfigForm}</div>
        <div className="grid-item">{mcConfigForm}</div>
      </div>
      <Button className="submitButton">Submit</Button>
    </Form>
  );
}

export default ContextForm;
