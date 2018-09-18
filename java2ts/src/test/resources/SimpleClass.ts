/*
 * This file was generated from Java classes by java2ts:
 *
 *  - https://github.com/JonathonRichardson/java2ts
 *
 *  You should not edit this file!
 */
import moment = require("moment");
import Moment = moment.Moment;

export class SimpleClass {
    value: string;

    public clone(): SimpleClass {
        let obj: SimpleClass = new SimpleClass();
        obj.value = this.value;

        return obj;
    }

    static fromJSON(json: {[key: string]: any}): SimpleClass {
        let obj: SimpleClass = new SimpleClass();
        obj.value = json['value'];

        return obj;
    }
}