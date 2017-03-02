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