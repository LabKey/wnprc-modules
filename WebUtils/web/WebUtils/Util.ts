import {getBaseURL} from "./LabKey";
export * from "./Util/Lookup";
export * from "./Util/DateTimePicker";

import * as jQuery from "jquery";
import * as knockout from "knockout";
import * as rsvp from "rsvp";
import * as toastr from "toastr";
import * as _ from "underscore";
import * as s from "underscore.string";

let classify = require("../../external_resources/js/classify.js");
let supersqlstore = require("../../external_resources/js/supersqlstore.js");

let extendUnderscore = function() {
    // Add the functions from the underscore-string library
    _.mixin(s.exports());

    _.mixin({
        isDefined: function (variable) { return !_.isUndefined(variable) }
    });
};
export {extendUnderscore}

export function exportGlobals() {
    // (0, eval)('this') is a robust way of getting a reference to the global object
    // For details, see http://stackoverflow.com/questions/14119988/return-this-0-evalthis/14120023#14120023
    let global = this || (0 || eval)('this') as any;

    _.extend(global, {
        $: jQuery,
        ko: knockout,
        RSVP: rsvp,
        toastr: toastr,
        '_': _,
        Classify: classify,
        SuperSqlStore: supersqlstore
    });

    if (global.Promise) {
        global.Promise.prototype["finally"] = rsvp.Promise.prototype["finally"];
    }
    else {
        global.Promise = rsvp.Promise;
    }
}

