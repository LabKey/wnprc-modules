import * as WebUtils from "./WebUtils";

import * as jQuery from "jquery";
import * as knockout from "./WebUtils/externals/knockout-enhanced";
import * as markdown from 'markdown';
import * as moment from 'moment';
import * as rsvp from "rsvp";
import * as toastr from "toastr";
import * as _ from "underscore";
import * as s from "underscore.string";

let classify = require("../external_resources/js/classify.js");
let supersqlstore = require("../external_resources/js/supersqlstore.js");


export function exportGlobals() {
    // (0, eval)('this') is a robust way of getting a reference to the global object
    // For details, see http://stackoverflow.com/questions/14119988/return-this-0-evalthis/14120023#14120023
    let global = this || (0 || eval)('this') as any;

    _.extend(global, {
        _:             _,
        $:             jQuery,
        Classify:      classify,
        ko:            knockout,
        markdown:      markdown,
        moment:        moment,
        RSVP:          rsvp,
        SuperSqlStore: supersqlstore,
        toastr:        toastr,
        WebUtils:      WebUtils
    });

    if (global.Promise) {
        global.Promise.prototype["finally"] = rsvp.Promise.prototype["finally"];
    }
    else {
        global.Promise = rsvp.Promise;
    }
}