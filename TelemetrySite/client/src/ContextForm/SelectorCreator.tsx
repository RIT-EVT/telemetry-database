import { Input } from "reactstrap";
import { ConfigTypes, BoardConfig, BikeConfig, CUSTOM_OPTION } from "./ContextDataTypes";
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

interface SelectCreatorProps {
    /** Options to display in select */
    displayValues: BoardConfig[] | BikeConfig[];
    /** Name of config form */
    name: ConfigTypes;
    /** Callback function for when the dropdown is updated */
    onChange: (name: ConfigTypes, change: string) => void;
    /** The current value of the dropdown */
    configSelectedValue: string;
    /** True if the bike controls the board selects, so they can't be changed by hand */
    lockNonBike: boolean;
}

/**
 * Create the select dropdowns for the config forms
 * on change check if value is Custom
 * if it is then display the normal form
 *
 * @param {SelectCreatorProps} props - Options, name, change callback, current value and lock flag
 * @return {HTMLInputElement} - HTML Select Input
 */
export default function SelectCreator({
    displayValues,
    name,
    onChange,
    configSelectedValue,
    lockNonBike,
}: SelectCreatorProps): React.ReactElement {
    const options: Array<BoardConfig | BikeConfig> = displayValues ?? [];

    // Disable this select if it was assigned by the bike
    const disabled: boolean = name !== "bike" && lockNonBike;

    return (
        <Input
            type="select"
            onChange={(e) => onChange(name, e.target.value)}
            placeholder="Select a config"
            required={RequiredSelects[name]}
            className="ConfigDropdown"
            id={`${name}Select`}
            value={configSelectedValue ?? ""}
            disabled={disabled}
        >
            <option value="" disabled hidden>
                Select an option
            </option>
            {/** Display each saved config name as an option. */}
            {options.map((configNameValue) => (
                <option key={configNameValue.name} value={configNameValue.name}>
                    {configNameValue.name}
                </option>
            ))}
            <option key={CUSTOM_OPTION} value={CUSTOM_OPTION}>
                {CUSTOM_OPTION}
            </option>
        </Input>
    );
}
