import { Input } from "reactstrap";
import { ConfigTypes, BoardConfig, BikeConifg } from "./ContextDataTypes";
import "./ContextForm.css";

// Which config selects are optional
const RequiredSelects: Record<ConfigTypes, boolean> = {
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
 * @param { BoardConfig[] | BikeConifg[]} displayValues - Options to display in select
 * @param {ConfigTypes} name - Name of config form
 * @param {function} onChange - Callback function for when the dropdown is updated
 * @param {Dictionary} configSelectedValue - The current value of the dropdowns
 * @return {HTMLInputElement} - HTML Select Input
 */
export default function SelectCreator(
    displayValues: BoardConfig[] | BikeConifg[],
    name: ConfigTypes,
    onChange: (name: ConfigTypes, change: string) => void,
    configSelectedValue: string,
    lockNoneBike: boolean,
): React.ReactElement {
    if (!displayValues) {
        displayValues = [];
    }
    // Disable this select if it was assigned by the bike
    let disabled: boolean = name !== "bike" && lockNoneBike;
    return (
        <Input
            type='select'
            onChange={(e) => onChange(name, e.target.value)}
            placeholder='Select a config'
            required={RequiredSelects[name]}
            className='ConfigDropdown'
            id={`${name}Select`}
            defaultValue={configSelectedValue ?? ""}
            value={configSelectedValue ?? ""}
            disabled={disabled}
        >
            <option value='' disabled hidden>
                Select an option
            </option>
            {/** Display each saved config name as an option. */}
            {displayValues.map((configNameValue: BoardConfig | BikeConifg) => {
                return (
                    <option key={configNameValue.name} value={configNameValue.name}>
                        {configNameValue.name}
                    </option>
                );
            })}
            <option key='Custom' value='Custom'>
                Custom
            </option>
        </Input>
    );
}
