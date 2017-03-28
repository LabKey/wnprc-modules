import moment = require("moment");
import Moment = moment.Moment;

export class SimpleClass {
    value: string;

    public clone(): SimpleClass {
        let obj: SimpleClass = new SimpleClass();
        obj.value = this.value;

        return obj;
    }

    static fromJSON(json: {[key: string]: string}): SimpleClass {
        let obj: SimpleClass = new SimpleClass();
        obj.value = json['value'];

        return obj;
    }
}