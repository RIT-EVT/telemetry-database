const ParamFields: Record<string, string[]> = {
    Match: ["Field", "Value"],
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
        const fields = ParamFields[this.type];
        if (!fields) return;

        const object: Record<string, string> = {};
        for (const key of fields) {
            object[key] = "";
        }

        this.params.push(object);
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
}

export default QueryEntry;
