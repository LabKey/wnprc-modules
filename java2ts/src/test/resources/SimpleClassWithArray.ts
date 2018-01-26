/*
 * This file was generated from Java classes by java2ts:
 *
 *  - https://github.com/JonathonRichardson/java2ts
 *
 *  You should not edit this file!
 */
import moment = require("moment");
import Moment = moment.Moment;

export class SimpleClassWithArray {
    texts: string[];

    public clone(): SimpleClassWithArray {
        let obj: SimpleClassWithArray = new SimpleClassWithArray();
        obj.texts = (this.texts).map((val) => { return val; });

        return obj;
    }

    static fromJSON(json: {[key: string]: any}): SimpleClassWithArray {
        let obj: SimpleClassWithArray = new SimpleClassWithArray();
        obj.texts = (json['texts'] as any[]).map((val: any) => {return val});

        return obj;
    }
}