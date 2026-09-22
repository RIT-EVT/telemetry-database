import { FormGroup, Input, InputGroup, InputGroupText } from "reactstrap";
import "./ContextForm.css";
import ContextJSONFormElements from "./JsonFiles/FormElementFormat.json";
import { InputType } from "reactstrap/types/lib/Input";

import { FormFields, BoardConfig, BikeConfig, FormDataFields } from "./ContextDataTypes";

import { isRecord } from "Utils/EnumUtils";

const FormElements = ContextJSONFormElements as FormConfig;

/**
 * Loop over a record (and any sub records) and copy every value into a single flat record.
 * This ensures all data is in the correct field, no matter how deeply it was nested.
 *
 * @param {Record<string, any>} input - Record to flatten
 * @param {Record<string, string>} output - Record the values are copied into
 * @return {Record<string, string>} The flattened record
 */
function FlattenRecord(input: Record<string, any>, output: Record<string, string> = {}): Record<string, string> {
    for (const key of Object.keys(input)) {
        const value = input[key];

        // Loop over sub records
        if (isRecord(value)) {
            FlattenRecord(value, output);
        } else if (value !== null && value !== undefined) {
            output[key] = String(value);
        }
    }

    return output;
}

/**
 * Build the starting values for a form. Every field in the form's json section gets an entry, keyed by the
 * field's label (this is the format the rest of the form logic saves data in), and filled from
 * the predefined data if there is any. Fields without predefined data start out empty.
 *
 * Predefined data is matched to fields by their json key, falling back to their label.
 *
 * @param {FormFields} formName - Key for the section in the FormElementFormat.json file
 * @param {BoardConfig | BikeConfig | FormDataFields | null} optionalSetData - Predefined data for the inputs
 * @return {Record<string, string>} Starting value of every field, keyed by label
 */
export function CreateInitialFormValues(
    formName: FormFields,
    optionalSetData: BoardConfig | BikeConfig | FormDataFields | null = null,
): Record<string, string> {
    const presetValues = optionalSetData ? FlattenRecord(optionalSetData as Record<string, any>) : {};
    const values: Record<string, string> = {};

    for (const [key, formElement] of Object.entries(FormElements[formName])) {
        if (!formElement) continue;
        values[key] = presetValues[key] ?? presetValues[key] ?? "";
    }

    return values;
}

interface DynamicFormProps {
    /** Key for the element in the FormElementFormat.json file */
    formName: FormFields;
    /** Current value of every input, keyed by the input's label */
    values: FormDataFields | undefined;
    /** On change call this function to update data per input */
    onChange: (formName: FormFields, fieldName: string, value: string) => void;
    /** Lock every input in the form. Used when the data comes from a saved config */
    readOnly?: boolean;
}

/**
 * Create a form group based off of the json key passed in.  Loop through all elements in the json
 * object and create that many input and label objects.
 *
 * The form holds no state of its own. The parent owns the values (see CreateInitialFormValues)
 * and this displays them.
 *
 * @param {DynamicFormProps} props - Form key, current values, change callback and read only flag
 * @return {HTMLFormElement} Form group of all the input elements on the json file
 */
export default function DynamicForm({ formName, values, onChange, readOnly = false }: DynamicFormProps): React.ReactElement {
    /* Loop through every json element for the current field and
     *  Create a new reactstrap input element for it
     *  TODO we may want to talk later about changing the way we approach this logic, but for now this functions
     */
    const section = FormElements[formName];
    console.log(values);

    if (values) values = FlattenRecord(values as FormDataFields);
    console.log(values);
    return (
        <FormGroup>
            {Object.keys(section).map((key) => {
                const formElement = section[key];
                if (!formElement) return null;

                const name = formElement.label;
                const isReadOnly = Boolean(formElement.readOnly || readOnly);

                return (
                    <InputGroup key={name} className='FormGroupElement'>
                        <InputGroupText className='form-input-label'>
                            {name} {formElement.required ? <span style={{ color: "red" }}>*</span> : null}
                        </InputGroupText>
                        <Input
                            // "string" is not a real html input type, so it is treated as text
                            type={(formElement.type === "string" ? "text" : formElement.type) as InputType}
                            placeholder={formElement.placeHolder}
                            required={formElement.required}
                            readOnly={isReadOnly}
                            // readOnly has no effect on a select, so lock it with disabled instead
                            disabled={formElement.type === "select" && isReadOnly}
                            className='formInput'
                            value={String(values?.[key] ?? "")}
                            onChange={(e) => {
                                onChange(formName, key, e.target.value);
                            }}
                        >
                            {formElement.type === "select" ? (
                                <>
                                    {/* Empty option so the select matches the (empty) saved value until the user picks one */}
                                    <option value='' disabled hidden>
                                        {formElement.placeHolder ?? "Select an option"}
                                    </option>
                                    {formElement.selectValues.map((value) => (
                                        <option key={value} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </>
                            ) : null}
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
