import React from "react";
import { FormGroup, Input, InputGroup, InputGroupText } from "reactstrap";
import "./ContextForm.css";
import ContextJSONFormElements from "./JsonFiles/FormElementFormat.json";

/**
 * Create a form group based off of the json key passed in.
 * Loop through all elements in the json object and create that
 * many input and label objects.
 *
 * @param {string} jsonValue - Key for the element in the FormElementFormat.json file
 * @param {json} optionalSetData - Predefined data for config inputs
 * @return {HTMLFormElement} Form group of all the input elements on the json file
 */
export default function DynamicForm(jsonValue, optionalSetData) {
  // Loop through every json element for the current field and
  // Create a new reactstrap input element for it
  // TODO we may want to talk later about changing the way we approach this logic, but for now this function
  return (
    <FormGroup>
      {Object.values(ContextJSONFormElements[jsonValue]).map((formElement) => {
        const idValue = formElement["id"];
        return (
          <InputGroup key={idValue} className='FormGroupElement'>
            <InputGroupText>
              <label htmlFor={idValue} className='mb-0'>
                {formElement["label"]}
              </label>
            </InputGroupText>
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
      })}
    </FormGroup>
  );
}
