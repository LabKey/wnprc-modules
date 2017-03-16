import * as API from "./WebUtils/API";
import * as Model from "./WebUtils/Model";
import * as URL from "./WebUtils/URL";
import * as Util from "./WebUtils/Util";
import {foreach2, registerCustomComponentLoader} from "./WebUtils/Util/Knockout";
import {extendUnderscore} from "./WebUtils/Util";
import {getModuleContext} from "./WebUtils/LabKey";

export {API, Model, URL, Util};

import * as lkTable from "./WebUtils/component/lk-table";

declare interface IterableIterator<T> {}
declare interface Symbol {}

// Include Knockout plugins
import * as ko from "./WebUtils/externals/knockout-enhanced";

lkTable.registerKoComponent();

/*
 * TODO:  Although this is used in lk-table, it no longer needs the beforeRenderAll/afterRenderAll methods, which were
 *        originally to allow the use of Sunny Walker's jQuery.FilterTable.  But, as I no longer use that, consider
 *        removing that usage and then removing this export.
 */
foreach2.registerCustomBinding();

// Register a custom component loader for Knockout to load stuff asynchronously while still respecting the context path.
registerCustomComponentLoader();

// Export underscore.string and an "isDefined" method to underscore
extendUnderscore();

require("qunit");
declare const QUnit: QUnit;

// Customize whether or not QUnit should run
let ctx = getModuleContext('webutils');
let qunitEnabled = (ctx['PerformUnitTestingPerPage'] || "").match(/true/i);

QUnit.config.altertitle = false;
if (!qunitEnabled) {
    QUnit.config.autostart = false;
}


// Now tell typescript about our new function:
interface Assert {
    isDefined(string: string, message: string): void;
}

// Defining a deep isDefined custom assertion to be able to test that variables exist (X.Y.Z) without first checking
// for parent variables (X.Y)
let isDefined = function(string: string, message: string): void {
    var jsCode = "if (_.isDefined(" + string + ")) { varIsDefined = true }";
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