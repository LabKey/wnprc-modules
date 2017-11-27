export * from "./util/Lookup";

import * as _ from "underscore";
import * as s from "underscore.string";

let extendUnderscore = function() {
    // Add the functions from the underscore-string library
    _.mixin(s.exports());
};
export {extendUnderscore}