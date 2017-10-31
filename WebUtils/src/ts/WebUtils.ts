import * as API from "./WebUtils/API";
import * as Model from "./WebUtils/Model";
import * as URL from "./WebUtils/URL";
import * as Util from "./WebUtils/Util";
import { registerCustomComponentLoader } from "./WebUtils/util/Knockout";
import { getModuleContext } from "./WebUtils/LabKey";

export { API, Model, URL, Util };

//----------------------------------------------------------------------------------------------------------------------
// Register a custom component loader for Knockout to load stuff asynchronously while still respecting the context path.
import * as ko from "knockout"

require("knockout.mapping");
require("knockout.punches");

ko.punches.enableAll();

import * as lkTable from "./WebUtils/component/lk-table";
lkTable.registerKoComponent();

registerCustomComponentLoader();

//----------------------------------------------------------------------------------------------------------------------
// Export underscore.string methods to underscore proper

import * as _ from "underscore";
import * as s from "underscore.string";
_.mixin(s.exports());

//----------------------------------------------------------------------------------------------------------------------
// Configure QUnit to set whether or not to run and add a new custom assert (isDefined)

require("qunit");
declare const QUnit: QUnit;

// Customize whether or not QUnit should run
let ctx = getModuleContext('webutils');
let qunitEnabled = (ctx['PerformUnitTestingPerPage'] || "").match(/true/i);

QUnit.config.altertitle = false;
if (!qunitEnabled) {
    QUnit.config.autostart = false;
}

// Defining a deep isDefined custom assertion to be able to test that variables exist (X.Y.Z) without first checking
// for parent variables (X.Y)
let isDefined = function(string: string, message: string): void {
    var jsCode = "if (" + string + " !== undefined) { varIsDefined = true }";
    var varIsDefined = false;
    try {
        eval(jsCode);
    }
    catch (e) {
        // Do nothing
    }

    this.pushResult({
        result: varIsDefined,
        actual: varIsDefined ? "Defined" : "Undefined",
        expected: "Defined",
        message: message || string + " is Defined"
    });
};


let customAssertions = QUnit.assert as any;
customAssertions['isDefined'] = isDefined;