class ParamFieldData {
    fields: string[];
    maxLength: number;
    constructor(fields: string[], maxLength: number = -1) {
        this.fields = fields;
        this.maxLength = maxLength;
    }
}

const ParamFields: Record<string, ParamFieldData> = {
    Match: new ParamFieldData(["Field Path", "Value"]),
    Unwind: new ParamFieldData(["Field Path"], 1),
};

class QueryEntry {
    index: number;
    type: string;
    params: Record<string, string>[];

    constructor(index: number, queryType: string = "none") {
        this.index = index;
        this.type = queryType;
        this.params = [];
    }

    AddParams() {
        const param = ParamFields[this.type];

        // Ensure the param exists and enforce the max number of params for this QueryType
        if (!param || (param.maxLength != -1 && param.maxLength < this.params.length + 1)) return;

        const newObject: Record<string, string> = {};
        for (const key of param.fields) {
            newObject[key] = "";
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

    UpdateParamValues(index: number, field: string, operator: string, value: string) {
        this.params[index] = { field, operator, value };
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
    }
}

export default QueryEntry;
