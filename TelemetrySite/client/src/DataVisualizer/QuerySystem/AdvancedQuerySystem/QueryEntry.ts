class ParamFieldData {
    fields: string[];
    maxLength: number;
    // Fields listed here are rendered as dropdowns; the first option is the default
    options: Record<string, string[]>;
    constructor(fields: string[], maxLength: number = -1, options: Record<string, string[]> = {}) {
        this.fields = fields;
        this.maxLength = maxLength;
        this.options = options;
    }
}

const ParamFields: Record<string, ParamFieldData> = {
    Match: new ParamFieldData(["Field Path", "Value"]),
    // Use Output Name "_id" for the group key (leave Field Path empty to group everything together)
    Group: new ParamFieldData(["Output Name", "Operation", "Field Path"], -1, {
        Operation: ["sum", "count", "avg", "min", "max", "first", "last", "push", "addToSet"],
    }),
    Sample: new ParamFieldData(["Size"], 1),
    Sort: new ParamFieldData(["Field Path", "Direction"], -1, { Direction: ["asc", "desc"] }),
    Unwind: new ParamFieldData(["Field Path"], 1),
};

let nextStageId = 0;

class QueryEntry {
    id: number; // Stable React key, unlike index which changes when stages are added/removed
    index: number;
    type: string;
    params: Record<string, string>[];

    constructor(index: number, queryType: string = "none") {
        this.id = nextStageId++;
        this.index = index;
        this.type = queryType;
        this.params = [];
    }

    AddParams() {
        const param = ParamFields[this.type];

        // Ensure the param exists and enforce the max number of params for this QueryType
        if (!param || (param.maxLength !== -1 && param.maxLength < this.params.length + 1)) return;

        const newObject: Record<string, string> = {};
        for (const key of param.fields) {
            newObject[key] = param.options[key]?.[0] ?? "";
        }

        this.params.push(newObject);
    }

    RemoveParam(index: number) {
        this.params.splice(index, 1);
    }

    IncreaseIndex() {
        this.index++;
    }
    DecreaseIndex() {
        this.index--;
    }

    UpdateParamValue(index: number, field: string, value: string) {
        if (!this.params[index]) return;
        this.params[index][field] = value;
    }

    UpdateType(type: string) {
        if (!ParamFields[type]) {
            console.error("Attempted to add param type " + type + " that does not exist in ParamFields");
            return;
        }

        this.type = type;
        this.params = []; // Reset the array so we don't carry data over
        this.AddParams(); // Start with one row so the stage is immediately usable
    }

    /** Shape sent to the backend, which validates it and builds the Mongo stage */
    toPayload() {
        return { type: this.type, params: this.params };
    }
}

export { ParamFields };
export default QueryEntry;
