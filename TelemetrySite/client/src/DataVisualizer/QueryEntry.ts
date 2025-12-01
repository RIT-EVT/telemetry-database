export default class QueryEntry {
    index: number;
    type: string;
    params: object[]
    constructor(index: number, queryType = "none") {
        this.index = index;
        this.type = queryType;
        this.params = [];
    }

    AddParams(field = "", operator = "", value = "") {
        this.params.push({ field: field, operator: operator, value: value });
    }

    RemoveParam(index: number) {
        this.params.splice(index, 1)
    }

    IncreaseIndex() {
        this.index++;
    }

    DecreaseIndex() {
        this.index--;
    }

    UpdateParamValues(index: number, field: string, operator: string, value: string) {
        this.params[index] = { field: field, operator, value };
    }

    UpdateParamValue(index: number, field: string, value: string){
        this.params[index][field] = value;
    }
}