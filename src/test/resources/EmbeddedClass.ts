import moment = require("moment");
import Moment = moment.Moment;

export class EmbeddedClass {
    embeddedClass: SimpleClass;
    id: string;

    static fromJSON(json: {[key: string]: string}): EmbeddedClass {
        let obj: EmbeddedClass = new EmbeddedClass();
        obj.embeddedClass = SimpleClass.fromJSON((json['embeddedClass'] as any) as {[key: string]: string});
        obj.id = json['id'];

        return obj;
    }
}
export class SimpleClass {
    value: string;

    static fromJSON(json: {[key: string]: string}): SimpleClass {
        let obj: SimpleClass = new SimpleClass();
        obj.value = json['value'];

        return obj;
    }
}