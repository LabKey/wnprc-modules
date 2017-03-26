import moment = require("moment");
import Moment = moment.Moment;

export class SimpleClass {
    value: string;

    static fromJSON(json: {[key: string]: string}): SimpleClass {
        let obj: SimpleClass = new SimpleClass();
        obj.value = json['value'];

        return obj;
    }
}