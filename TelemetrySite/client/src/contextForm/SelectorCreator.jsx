import React from "react";
import { Input } from "reactstrap";
import "./ContextForm.css"

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
/**
   * Create the select dropdowns for the config forms
   * on change check if value is Custom
   * if it is then display the normal form
   *
   * @param {string} displayValues - Options to display in select
   * @param {string} name - Name of config form
   * @return {HTMLInputElement} - HTML Select Input
   */
export default function SelectCreator(displayValues, name, onChange, configSelectedValue) {

    return (
        <Input
            type='select'
            onChange={(e) => onChange(name, e)}
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