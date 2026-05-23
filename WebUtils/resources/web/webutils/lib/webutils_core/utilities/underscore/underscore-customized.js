/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
(function() {
    // Add the functions from the underscore-string library
    _.mixin(s.exports());

    // Add a function to make sure that a variable name exists before using it.
    var ensureVariableNameExists = function (name) {
        var makeVar = function (parentObj, varName) {
            var pieces = varName.toString().split(".");

            var baseName = pieces.shift();
            parentObj[baseName] = parentObj[baseName] || {};
            if (pieces.length > 0) {
                return makeVar(parentObj[baseName], pieces.join("."));
            }
            else {
                return parentObj[baseName];
            }
        };

        return makeVar(window, name);
    };

    _.mixin({
        isDefined: function (variable) { return !_.isUndefined(variable) },
        makeVarDeep: ensureVariableNameExists,
        ensurePathExists: ensureVariableNameExists
    });
})();