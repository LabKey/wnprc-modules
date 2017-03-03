import * as jQuery from "jquery";
import * as knockout from "knockout";
import * as rsvp from "rsvp";
import * as toastr from "toastr";
import * as WebUtils from "./WebUtils";
import * as _ from "underscore";


export function exportGlobals() {
    // (0, eval)('this') is a robust way of getting a reference to the global object
    // For details, see http://stackoverflow.com/questions/14119988/return-this-0-evalthis/14120023#14120023
    let global = this || (0 || eval)('this') as any;

    _.extend(global, {
        $: jQuery,
        ko: knockout,
        RSVP: rsvp,
        toastr: toastr,
        WebUtils: WebUtils,
        '_': _
    });
}