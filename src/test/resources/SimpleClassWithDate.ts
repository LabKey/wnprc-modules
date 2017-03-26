import moment = require("moment");
import Moment = moment.Moment;

export class SimpleClassWithDate {
    value: string;
    startDate: Moment;

    static fromJSON(json: {[key: string]: string}): SimpleClassWithDate {
        let obj: SimpleClassWithDate = new SimpleClassWithDate();
        obj.value = json['value'];
        obj.startDate = moment(json['startDate']);

        return obj;
    }
}