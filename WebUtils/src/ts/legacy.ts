export * from "./WebUtils";

import * as jQuery from "jquery";
import * as knockout from "knockout";
import * as moment from 'moment';
import * as rsvp from "rsvp";
import * as toastr from "toastr";
import * as uri from "urijs";
import * as _ from "underscore";
import * as s from "underscore.string";

const markdown: any = require('markdown');

knockout.punches.enableAll();

import { Util, Model } from "./WebUtils";
let utils = Util, Models = Model;
export { utils, Models };

export function exportGlobals() {
    // (0, eval)('this') is a robust way of getting a reference to the global object
    // For details, see http://stackoverflow.com/questions/14119988/return-this-0-evalthis/14120023#14120023
    let global = this || (0 || eval)('this') as any;

    _.extend(global, {
        _:             _,
        $:             jQuery,
        ko:            knockout,
        markdown:      markdown,
        moment:        moment,
        RSVP:          rsvp,
        s:             s,
        toastr:        toastr,
        URI:           uri
    });

    global.Classify = require("expose-loader?Classify!classify");
    global.SuperSQLStore = require("expose-loader?SuperSQLStore!supersqlstore");

    if (global.Promise) {
        global.Promise.prototype["finally"] = rsvp.Promise.prototype["finally"];
    }
    else {
        global.Promise = rsvp.Promise;
    }
}

exportGlobals();
