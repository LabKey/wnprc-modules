/*
 * This file was generated from Java classes by java2ts:
 *
 *  - https://github.com/JonathonRichardson/java2ts
 *
 *  You should not edit this file!
 */
import moment = require("moment");
import Moment = moment.Moment;

export class SimpleClassWithDate {
    nullableStartDate: Moment | null;
    value: string;
    startDate: Moment;

    public clone(): SimpleClassWithDate {
        let obj: SimpleClassWithDate = new SimpleClassWithDate();
        obj.nullableStartDate = (this.nullableStartDate == null) ? null : ((val: any) => {return val.clone();})(this.nullableStartDate);
        obj.value = this.value;
        obj.startDate = this.startDate.clone();

        return obj;
    }

    static fromJSON(json: {[key: string]: any}): SimpleClassWithDate {
        let obj: SimpleClassWithDate = new SimpleClassWithDate();
        obj.nullableStartDate = (json['nullableStartDate'] == null) ? null : ((val: any) => {return moment(val);})(json['nullableStartDate']);
        obj.value = json['value'];
        obj.startDate = moment(json['startDate']);

        return obj;
    }
}