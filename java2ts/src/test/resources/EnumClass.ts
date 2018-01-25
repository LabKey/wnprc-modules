/*
 * This file was generated from Java classes by java2ts:
 *
 *  - https://github.com/JonathonRichardson/java2ts
 *
 *  You should not edit this file!
 */
import moment = require("moment");
import Moment = moment.Moment;

export type SimpleEnum = "OPTION3" | "OPTION1" | "OPTION2";

export function getSimpleEnumValues(): SimpleEnum[] {
    return ["OPTION3", "OPTION1", "OPTION2"];
}

export class SimpleClassWithEnum {
    id: string;
    selectedOption: SimpleEnum;

    public clone(): SimpleClassWithEnum {
        let obj: SimpleClassWithEnum = new SimpleClassWithEnum();
        obj.id = this.id;
        obj.selectedOption = this.selectedOption;

        return obj;
    }

    static fromJSON(json: {[key: string]: any}): SimpleClassWithEnum {
        let obj: SimpleClassWithEnum = new SimpleClassWithEnum();
        obj.id = json['id'];
        obj.selectedOption = json['selectedOption'] as SimpleEnum;

        return obj;
    }
}