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

    static fromJSON(json: {[key: string]: string}): SimpleClassWithEnum {
        let obj: SimpleClassWithEnum = new SimpleClassWithEnum();
        obj.id = json['id'];
        obj.selectedOption = json['selectedOption'] as SimpleEnum;

        return obj;
    }
}