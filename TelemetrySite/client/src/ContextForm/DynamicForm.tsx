import { FormGroup, Input, InputGroup, InputGroupText } from "reactstrap";
import "./ContextForm.css";
import ContextJSONFormElements from "./JsonFiles/FormElementFormat.json";
import { InputType } from "reactstrap/types/lib/Input";

import { FormFields, BoardConfig, BikeConifg, FormDataFields } from "./ContextDataTypes";

import { isRecord } from "Utils/EnumUtils";

const FormData = ContextJSONFormElements as FormConfig;

/**
 * Create a form group based off of the json key passed in.  Loop through all elements in the json
 * object and create that many input and label objects.
 *
 * @param {FormFields} jsonValue - Key for the element in the FormElementFormat.json file
 * @param {FormDataFields} outDataFormat - An output variable to hold data format
 * @param {Function} UpdateSavedValue - On change call this function to update data per input
 * @param {BoardConfig | BikeConifg | FormDataFields | null} optionalSetData - Predefined data for config inputs
 * @return {HTMLFormElement} Form group of all the input elements on the json file
 */
export default function DynamicForm(
    jsonValue: FormFields,
    outDataFormat: FormDataFields,
    UpdateSavedValue: Function,
    optionalSetData: BoardConfig | BikeConifg | FormDataFields | null = null,
): React.ReactElement {
    /* Loop through every json element for the current field and
     *  Create a new reactstrap input element for it
     *  TODO we may want to talk later about changing the way we approach this logic, but for now this functions
     */
    let newOptionalSetFormat: Record<string, string> = {};
    if (optionalSetData) {
        let optionalSetRecord = optionalSetData as Record<string, any>;

        // Loop over a record and copy value to optionalSetRecord
        // This ensures all data is in the correct field
        const loopRecord = (input: Record<string, any>) => {
            const keys = Object.keys(input);

            for (let index in keys) {
                let key = keys[index] as string;

                // Loop over sub records
                if (isRecord(input[key])) {
                    loopRecord(input[key]);
                } else {
                    newOptionalSetFormat[key] = input[key] as string;
                }
            }
        };

        loopRecord(optionalSetRecord);
    }
    return (
        <FormGroup>
            {Object.keys(FormData[jsonValue]).map((key) => {
                const formElement = FormData[jsonValue][key];
                if (!formElement) return;
                let name = formElement.label;
                let defaultValue: string | undefined = undefined;

                if (newOptionalSetFormat) {
                    defaultValue = newOptionalSetFormat[key];
                }
                if (outDataFormat)
                    // Setup the layout for this dynamic form
                    outDataFormat[name] = defaultValue ?? "";

                return (
                    <InputGroup key={name} className='FormGroupElement'>
                        <InputGroupText className='form-input-label'>
                            {name} {formElement["required"] ? <span style={{ color: "red" }}>*</span> : null}
                        </InputGroupText>
                        <Input
                            type={formElement["type"] as InputType}
                            placeholder={formElement["placeHolder"]}
                            required={formElement["required"]}
                            readOnly={formElement["readOnly"] || optionalSetData ? true : false}
                            className='formInput'
                            value={defaultValue}
                            onChange={(e) => {
                                UpdateSavedValue(jsonValue, name, e.target.value);
                            }}
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

//#region Form Types

type FieldType = "text" | "number" | "date" | "datetime-local" | "select" | "string";

interface BaseField {
    type: FieldType;
    label: string;
    required: boolean;
    placeHolder?: string;
    readOnly?: boolean;
}

interface SelectField extends BaseField {
    type: "select";
    selectValues: string[];
}

interface InputField extends BaseField {
    type: Exclude<FieldType, "select">;
}

type Field = SelectField | InputField;

interface FormSection {
    [key: string]: Field;
}

interface FormConfig {
    main: FormSection;
    event: FormSection;
    bike: FormSection;
    bms: FormSection;
    imu: FormSection;
    tmu: FormSection;
    tms: FormSection;
    pvc: FormSection;
    mc: FormSection;
}

//#endregion
