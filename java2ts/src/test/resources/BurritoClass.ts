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
    enumValueThatCouldBeNull: SimpleEnum | null;
    isNo: boolean;
    short2: number;
    short1: number;

    public clone(): FullyLoadedBurritoClass {
        let obj: FullyLoadedBurritoClass = new FullyLoadedBurritoClass();
        obj.isYes = this.isYes;
        obj.float1 = this.float1;
        obj.float2 = this.float2;
        obj.string = this.string;
        obj.long2 = this.long2;
        obj.int2 = this.int2;
        obj.int1 = this.int1;
        obj.long1 = this.long1;
        obj.enumValue = this.enumValue;
        obj.double2 = this.double2;
        obj.double1 = this.double1;
        obj.enumValueThatCouldBeNull = (this.enumValueThatCouldBeNull == null) ? null : ((val: any) => {return val;})(this.enumValueThatCouldBeNull);
        obj.isNo = this.isNo;
        obj.short2 = this.short2;
        obj.short1 = this.short1;

        return obj;
    }

    static fromJSON(json: {[key: string]: any}): FullyLoadedBurritoClass {
        let obj: FullyLoadedBurritoClass = new FullyLoadedBurritoClass();
        obj.isYes = (json['isYes'].toString().toLowerCase() === 'true') ? true : false;
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
        obj.enumValueThatCouldBeNull = (json['enumValueThatCouldBeNull'] == null) ? null : ((val: any) => {return val as SimpleEnum;})(json['enumValueThatCouldBeNull']);
        obj.isNo = (json['isNo'].toString().toLowerCase() === 'true') ? true : false;
        obj.short2 = parseFloat(json['short2']);
        obj.short1 = parseFloat(json['short1']);

        return obj;
    }
}