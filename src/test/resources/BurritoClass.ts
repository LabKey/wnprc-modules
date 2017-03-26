import moment = require("moment");
import Moment = moment.Moment;

export type SimpleEnum = "OPTION3" | "OPTION1" | "OPTION2";

export function getSimpleEnumValues(): SimpleEnum[] {
    return ["OPTION3", "OPTION1", "OPTION2"];
}

export class FullyLoadedBurritoClass {
    isYes: boolean;
    float1: number;
    float2: number;
    string: string;
    long2: number;
    int2: number;
    int1: number;
    long1: number;
    enumValue: SimpleEnum;
    double2: number;
    double1: number;
    isNo: boolean;
    short2: number;
    short1: number;

    static fromJSON(json: {[key: string]: string}): FullyLoadedBurritoClass {
        let obj: FullyLoadedBurritoClass = new FullyLoadedBurritoClass();
        obj.isYes = (json['isYes'].toLowerCase() === 'true') ? true : false;
        obj.float1 = parseFloat(json['float1']);
        obj.float2 = parseFloat(json['float2']);
        obj.string = json['string'];
        obj.long2 = parseFloat(json['long2']);
        obj.int2 = parseFloat(json['int2']);
        obj.int1 = parseFloat(json['int1']);
        obj.long1 = parseFloat(json['long1']);
        obj.enumValue = json['enumValue'] as SimpleEnum;
        obj.double2 = parseFloat(json['double2']);
        obj.double1 = parseFloat(json['double1']);
        obj.isNo = (json['isNo'].toLowerCase() === 'true') ? true : false;
        obj.short2 = parseFloat(json['short2']);
        obj.short1 = parseFloat(json['short1']);

        return obj;
    }
}