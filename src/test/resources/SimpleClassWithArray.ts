import moment = require("moment");
import Moment = moment.Moment;

export class SimpleClassWithArray {
    texts: string[];

    static fromJSON(json: {[key: string]: string}): SimpleClassWithArray {
        let obj: SimpleClassWithArray = new SimpleClassWithArray();
        obj.texts = (json['texts'] as any[]).map((val: any) => {return (val as string)});

        return obj;
    }
}