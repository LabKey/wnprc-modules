import moment = require("moment");
import Moment = moment.Moment;

export class SimpleClassWithDate {
    value: string;
    startDate: Moment;

    public clone(): SimpleClassWithDate {
        let obj: SimpleClassWithDate = new SimpleClassWithDate();
        obj.value = this.value;
        obj.startDate = this.startDate.clone();

        return obj;
    }

    static fromJSON(json: {[key: string]: string}): SimpleClassWithDate {
        let obj: SimpleClassWithDate = new SimpleClassWithDate();
        obj.value = json['value'];
        obj.startDate = moment(json['startDate']);

        return obj;
    }
}