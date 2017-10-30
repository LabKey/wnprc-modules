export * from "./util/Lookup";

import * as _ from "underscore";
import * as s from "underscore.string";


// Thank you: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

export function newUUID(): string {
    return guid().toUpperCase();
}


let extendUnderscore = function() {
    // Add the functions from the underscore-string library
    _.mixin(s.exports());
};
export {extendUnderscore}