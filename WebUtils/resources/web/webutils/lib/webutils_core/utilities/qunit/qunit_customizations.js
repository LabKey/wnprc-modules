/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
(function() {
    var ctx = LABKEY.getModuleContext('webutils') || {};
    var qunitEnabled = (ctx['PerformUnitTestingPerPage'] || "").match(/true/i);

    // Defining a deep isDefined custom assertion to be able to test that variables exist (X.Y.Z) without first checking
    // for parent variables (X.Y)
    QUnit.assert.isDefined = function(string, message) {
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

    QUnit.config.altertitle = false;
    if (!qunitEnabled) {
        QUnit.config.autostart = false;
    }
})();